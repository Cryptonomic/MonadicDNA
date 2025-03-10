'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import VisuallyHiddenInput from './visuallyHiddenInput';

import { createAttestation } from '@/utils/attestations';
import { computeOnNillion } from '@/utils/nillion';
import FileProgressIndicator from './fileProgressIndicator';
import { IComputedResult, IMonadicDNAPassport, IMonadicDNAVerifiedTrait, ISNPs, IViewAttestation } from '@/types';
import ViewAttestations from './viewAttestations';
import AnalysisInsights from './analysisInsights';
import AnalysisStepper from './analysisStepper';
import ErrorModal from './errorModal';
import { CustomError, invalidFileError } from '@/types/customError';
import { getValue, isValidMonadicDNAPassport } from '@/utils';

const config = require('../config.json');

const UploadFile = () => {

    const [file, setFile] = useState<File | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [fileProgress, setFileProgress] = React.useState(0);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [passport, setPassport] = useState<IMonadicDNAPassport | null>(null);
    const [activeStep, setActiveStep] = React.useState(-1);
    const [error, setError] = useState<CustomError>();
    const [attestationData, setAttestationData] = useState<IViewAttestation[] | null>();


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            setIsFileLoading(true);
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onload = parseFile;
            reader.onloadend = updateProgress;
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
            if (!isValidMonadicDNAPassport(jsonContent)) {
                throw new Error('Parsed JSON content does not match IMonadicDNAPassport interface');
            }
            setPassport(jsonContent);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          } catch (e) {
            console.error('Error parsing JSON file:', e);
            setError(invalidFileError);
        }
    };

    const analyseData = async() => {
        if (!passport) { return };

        setIsProcessingTransaction(true);

        try {
            const SNPs = config.SNPs;
            const computedResult: IComputedResult[] = await Promise.all(
                SNPs.map(async (snp: ISNPs) => {
                    const { id: traitId, trait } = snp;
                    const storeId = passport.nillion_data[traitId];

                    if (!storeId) { return };

                    const res = await computeOnNillion(storeId);
                    const interpretation = res?.result ? 'yes' : 'no';
                    return { trait, value: interpretation };
                })
              );

              setActiveStep((prevActiveStep) => prevActiveStep + 1);

              let allAttestations: IViewAttestation[] = [];

              for (const result of computedResult) {
                  const createdAttestation = await createAttestation(passport.passport_id, result);
                  allAttestations.push({
                      id: `${config.networkId}_${createdAttestation.attestationId}`,
                      data: {
                          "Passport ID": passport.passport_id,
                          Provider: config.provider,
                          Trait: result.trait,
                          Value: getValue(result.value)
                      }
                  });
              }

              const filteredAttestations = allAttestations.filter((item, index, self) =>
                  item.data.Provider.toLowerCase() === config.provider.toLowerCase() &&
                  index === self.findIndex((t) =>
                      t.data.Trait === item.data.Trait
                  )
              );
              setAttestationData(filteredAttestations);
              setActiveStep((prevActiveStep) => prevActiveStep + 1);
          } catch (e) {
            console.error('Failed to Analyse DNA Passport:', e);
            setError(e as CustomError);
        } finally {
          setIsProcessingTransaction(false);
        }
    }

    if(activeStep >= 2 && attestationData) {
        return (
            <Box className='pt-4 sm:pt-11'>
                <AnalysisStepper {...{ activeStep, setActiveStep }} />
                <ViewAttestations attestationData={attestationData} />
            </Box>
        );
    }

    const handleClickDeleteFile = () => {
        setFile(null);
        setFileProgress(0);
        setIsFileLoading(false);
    }

    return (
        <Box className='pt-4 sm:pt-11'>
            {error && <ErrorModal error={error} setError={setError} /> }
            <AnalysisStepper {...{ activeStep, setActiveStep }} />
            <div className='sm:w-[552px] mt-12 mx-auto'>
                <Typography variant='h5'>
                    Upload Your DNA Passport
                </Typography>
                {!file &&
                    <Typography className='pb-4'>
                            Upload your Monadic DNA Passport to run an analysis. Attestations of the results will be added to your DNA passport.
                    </Typography>
                }
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
                            <VisuallyHiddenInput type='file' accept='.json' onChange={handleFileChange} disabled={isFileLoading} />
                        </Link>
                    </div>

                    <Typography color='text.secondary'> DNA Passport JSON </Typography>
                </Box>
                {file &&
                    <FileProgressIndicator {...{file, fileProgress, handleClickDeleteFile}} />
                }

                <AnalysisInsights />

                <LoadingButton
                    variant='contained'
                    loading={isProcessingTransaction}
                    disabled={fileProgress < 100 || !passport}
                    onClick={() => analyseData()}
                    className={`w-full sm:w-[400px] ${file ? 'mt-8' : 'mt-20' }`}
                >
                    Analyse Data
                </LoadingButton>
            </div>
        </Box>
    )
}

export default UploadFile;