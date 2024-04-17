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

import { createAttestation, getAttestationId } from '@/utils/signProtocol';
import { generateRandomUID, parsePassportFile } from '@/utils';
import { storeOnNillion } from '@/utils/nillion';

import { ActionType, ActionData } from '@/types/uploadFile';
import { IMonadicDNAPassport, IMonadicDNAValidDataset } from '@/types';

const UploadFile = ({ type, isTypeCreate }: { type: ActionType; isTypeCreate?: boolean; } ) => {
    const currentAction = ActionData[type];

    const [file, setFile] = useState<File | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [fileProgress, setFileProgress] = React.useState(0);
    const [isWallet, setIsWallet] = useState(false);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [passport, setPassport] = useState<IMonadicDNAPassport>();
    const [attestationId, setAttestationId] = useState<string | undefined>();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        // if (selectedFile) {
        setIsFileLoading(true);
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onprogress = updateProgress;
        reader.readAsArrayBuffer(selectedFile);
        // }

        if(currentAction.type === 'viewResults') {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const fileContent = e.target?.result as string;
                const parsedContent = parsePassportFile(fileContent);
                setPassport(parsedContent);
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
                } catch (error) {
                    console.error('Failed to create attestation:', error);
                } finally {
                  setIsProcessingTransaction(false);
                }
            }

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Failed to store file on Nillion:', error);
        }
    }

    const viewResults = async() => {
        if(!passport) return;

        setIsProcessingTransaction(true);

        try {
            const attestationId = await getAttestationId(passport.passport_id);
            setAttestationId(attestationId);
        } catch (error) {
            console.error('Failed to retreive attestation ID:', error);
        } finally {
            setIsProcessingTransaction(false);
        }
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
            }}
        />
    }

    if(currentAction.type === 'viewResults' && attestationId) {
        return <ViewResults id={attestationId} />
    }

    return (
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
                        component="label"
                        variant='inherit'
                        color='text.primary'
                    >
                        Click to upload
                        <VisuallyHiddenInput type="file" onChange={handleFileChange} disabled={isFileLoading} />
                    </Link>
                    {' '}
                    or drag and drop
                </div>
                {isTypeCreate &&
                    <Typography color='text.secondary'>
                        Exome sequencing or genotyping data (Max X GB)
                    </Typography>
                }

            </Box>
            {file &&
                <>
                    <FileProgressDetails {...{ file, fileProgress }}  />
                    {isTypeCreate &&
                        <GetExternalDataset />
                    }

                    <LoadingButton
                        variant='contained'
                        loading={isProcessingTransaction}
                        disabled={fileProgress < 100}
                        onClick={() => currentActionFunction()}
                        className='sm:w-[400px]'
                    >
                        {currentAction.buttonTitle}
                    </LoadingButton>
                </>
            }
        </div>
    )
}

export default UploadFile;