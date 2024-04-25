'use client';
import React, { ChangeEvent, useState } from 'react';

import SparkMD5 from 'spark-md5';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisuallyHiddenInput from './visuallyHiddenInput';
import DownLoadWallet from './downloadWallet';
import ViewResults from './viewResults';
import GetExternalDataset from './getExternalDataset';
import FileProgressDetails from './fileProgressDetails';

import { createAttestation, getAllAttestationIds } from '@/utils/signProtocol';
import { generateRandomUID, parsePassportFile } from '@/utils';
import { storeOnNillion } from '@/utils/nillion';

import { ActionType, ActionData, IError } from '@/types/uploadFile';
import { IMonadicDNAPassport, IMonadicDNAValidDataset } from '@/types';
import ErrorModal from './errorModal';

const UploadFile = ({ type, isTypeCreate }: { type: ActionType; isTypeCreate?: boolean; } ) => {
    const currentAction = ActionData[type];

    const [file, setFile] = useState<File | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [fileProgress, setFileProgress] = React.useState(0);
    const [isWallet, setIsWallet] = useState(false);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [passport, setPassport] = useState<IMonadicDNAPassport>();
    const [attestationIds, setAttestationIds] = useState<string[] | undefined>();
    const [error, setError] = useState<IError | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if(!selectedFile) return;

        if(currentAction.type === 'createPassport') {
            if(selectedFile.type !== 'text/plain') {
                setError({
                    isError: true,
                    title: 'Invalid File',
                    text: 'Please ensure it is a genetic data.txt file'
                });
                return;
            }
            setIsFileLoading(true);
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onloadend = updateProgress;
            reader.readAsArrayBuffer(selectedFile);
        }

        if(currentAction.type === 'viewResults') {
            const reader = new FileReader();
            reader.onprogress = updateProgress;

            reader.onload = (e: ProgressEvent<FileReader>) => {
                try {
                    const fileContent = e.target?.result as string;
                    const parsedContent = parsePassportFile(fileContent);
                    setFile(selectedFile);

                    setPassport(parsedContent);
                } catch (e) {
                    console.error('Error parsing passport file', e)
                    setError({
                        isError: true,
                        title: 'Error parsing passport file',
                        text: 'Please ensure it is a Monadic DNA passport file in JSON format.'
                    });
                    setFileProgress(0)
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const updateProgress = (e: ProgressEvent<FileReader>) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            console.log(`File upload fileProgress: ${percentComplete}%`);
            setFileProgress(percentComplete)
            setIsFileLoading(percentComplete < 100)
        }
    };

    const createDNAPassport = async() => {
        if (!file) { return };

        try {
            setIsProcessingTransaction(true);

            const nillionData = await storeOnNillion(file);

            const reader = new FileReader();
            reader.onload = async(e) => {
                const fileBuffer = e.target?.result as ArrayBuffer;
                // Convert file name to ArrayBuffer
                const fileNameArrayBuffer = new TextEncoder().encode(file.name);

                const spark = new SparkMD5.ArrayBuffer();

                // Calculate file name hash
                spark.append(fileNameArrayBuffer);
                const fileHash = spark.end();

                // Reset SparkMD5 instance for file content hashing
                spark.reset();
                spark.append(fileBuffer);
                const dataHash = spark.end();

                const UID = generateRandomUID(6);
                const passportId = `monadicdna_${fileHash}_${UID}`

                const passportData: IMonadicDNAPassport = {
                    passport_id: passportId,
                    filename_hash: fileHash,
                    data_hash: dataHash,
                    nillion_data: nillionData,
                }

                const data: IMonadicDNAValidDataset = {
                    passportId,
                    fileHash,
                    dataHash,
                    valid: true,
                }

                try {
                    await createAttestation(data);
                    setPassport(passportData);
                    setIsWallet(true);
                } catch (e: any) {
                    console.error('Failed to create attestation:', e);
                    setError({
                        isError: true,
                        title: 'Failed to create attestation',
                        text: e.message ?? ''
                    });
                } finally {
                  setIsProcessingTransaction(false);
                }
            }

            reader.readAsArrayBuffer(file);
        } catch (e: any) {
            console.error('Failed to store file on Nillion:', e);
            setError({
                isError: true,
                title: 'Failed to store file on Nillion',
                text: e.message ?? ''
            });
            setIsProcessingTransaction(false);
        }
    }

    const viewResults = async() => {
        if(!passport) return;

        setIsProcessingTransaction(true);

        try {
            const retreivedIds = await getAllAttestationIds(passport.passport_id);
            setAttestationIds(retreivedIds);
        } catch (e: any) {
            console.error('Failed to retreive attestation ID:', e);
            setError({
                isError: true,
                title: 'Failed to retreive attestation ID',
                text: e.message ?? ''
            });
        } finally {
            setIsProcessingTransaction(false);
        }
    }

    const handleClickDelete = () => {
        setFile(null);
        setFileProgress(0);
        setIsFileLoading(false);
    }


    // Mapping of function names to functions
    const actionFunctions: Record<string, () => void> = {
        'createDNAPassport': () => createDNAPassport(),
        'viewResults': () => viewResults(),
    }

    const currentActionFunction = actionFunctions[currentAction.buttonAction];

    console.log('passport', passport)

    if(ActionData[type].type === 'createPassport' && isWallet && passport) {
        return <DownLoadWallet
            passport={passport}
            goBack={() => {
                setIsWallet(false);
                setPassport(undefined);
                setFile(null)
                setFileProgress(0)
            }}
        />
    }

    if(currentAction.type === 'viewResults' && attestationIds) {
        return <ViewResults ids={attestationIds} />
    }

    return (
        <>
            {error?.isError &&
                <ErrorModal error={error} setError={setError} />
            }
            <div>
                <Typography variant='h5'>
                    { currentAction.title }
                </Typography>
                <Box
                    className='flex flex-col gap-2 sm:w-[552px] px-4 py-6 mt-2 justify-center items-center border border-dashed'
                    sx={{ borderColor: 'error'}}
                >
                    <UploadFileIcon className='w-10 h-10' />
                    <div>
                        <Link
                            className='p-0 cursor-pointer'
                            component='label'
                            variant='inherit'
                            color='text.primary'
                        >
                            Click to upload
                            <VisuallyHiddenInput type='file' accept='.txt' onChange={handleFileChange} disabled={isFileLoading} />
                        </Link>
                        {' '}
                        or drag and drop
                    </div>
                    {isTypeCreate &&
                        <Typography color='text.secondary'>
                            23andMe genetic data.txt file
                        </Typography>
                    }

                </Box>
                {file &&
                    <FileProgressDetails {...{ file, fileProgress, handleClickDelete }} />
                }

                <Box className={`${file ? 'mt-0' : 'mt-10'}`} />
                {isTypeCreate && <GetExternalDataset /> }

                <LoadingButton
                    variant='contained'
                    loading={isProcessingTransaction}
                    disabled={fileProgress < 100 || error?.isError}
                    onClick={() => currentActionFunction()}
                    className='sm:w-[400px]'
                    sx={{ zIndex: error?.isError ? -5 : 1}}
                >
                    {currentAction.buttonTitle}
                </LoadingButton>
            </div>
        </>
    )
}

export default UploadFile;