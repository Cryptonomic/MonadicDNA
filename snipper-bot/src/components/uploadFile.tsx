'use client';
import React, { ChangeEvent, useState } from 'react';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import VisuallyHiddenInput from './visuallyHiddenInput';

import { createAttestation } from '@/utils/attestations';
import { computeOnNillion } from '@/utils/nillion';
import FileProgressIndicator from './fileProgressIndicator';
import { IMonadicDNAPassport } from '@/types';
import ViewAttestations from './viewAttestations';

const config = require('../config.json');

const UploadFile = () => {

    const [file, setFile] = useState<File | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [fileProgress, setFileProgress] = React.useState(0);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [jsonData, setJsonData] = useState<IMonadicDNAPassport | null>(null);
    const [attestationId, setAttestationId] = useState<string | undefined>();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            setIsFileLoading(true);
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onload = parseFile;
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

    const parseFile = (e: ProgressEvent<FileReader>) => {
        const fileContent = e.target?.result as string;
        try {
            const jsonContent = JSON.parse(fileContent) as IMonadicDNAPassport;
            setJsonData(jsonContent);
        } catch (error) {
            console.error('Error parsing JSON file:', error);
        }
    };

    const computePassport = async() => {
        if (!jsonData) { return };

        setIsProcessingTransaction(true);

        try {
            const traitId = config.trait.id
            const storeId = jsonData.nillion_data[traitId];
            const res = await computeOnNillion(storeId);
            const interpretation = res?.result ? 'yes' : 'no';

            const tx = await createAttestation(jsonData.passport_id, interpretation);
            setAttestationId(tx.attestationId);
        } catch (error) {
            console.error('Failed to compute passport:', error);
        } finally {
          setIsProcessingTransaction(false);
        }
    }


    if(attestationId !== undefined ) {
        return <ViewAttestations id={attestationId} />
    }

    return (
        <div className='sm:w-[552px]'>
            <Typography variant='h5'>
                Upload Your DNA Passport
            </Typography>
            <Box
                className='flex flex-col gap-2 px-4 py-6 mt-2 justify-center items-center border border-dashed'
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
                        <VisuallyHiddenInput type='file' onChange={handleFileChange} disabled={isFileLoading} />
                    </Link>
                    {' '}
                    or drag and drop
                </div>

                <Typography color='text.secondary'> Exome sequencing or genotyping data (Max X GB) </Typography>
            </Box>
            {file &&
                <>
                    <FileProgressIndicator {...{file, fileProgress}} />
                    <LoadingButton
                        variant='contained'
                        loading={isProcessingTransaction}
                        disabled={fileProgress < 100}
                        onClick={() => computePassport()}
                        className='w-[400px]'
                    >
                        Compute Passport
                    </LoadingButton>
                </>
            }
        </div>
    )
}

export default UploadFile;