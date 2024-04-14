import React, { ChangeEvent, useState } from 'react';

import SparkMD5 from 'spark-md5';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

import VisuallyHiddenInput from './visuallyHiddenInput';
import { formatFileSize } from '@/utils/formatting';
import DownLoadWallet from './downloadWallet';
import { createAttestation, IPassportData } from '@/utils/attestations';

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [passportData, setPassportData] = useState<IPassportData>();
  const [isWallet, setIsWallet] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileProgress, setFileProgress] = React.useState(0);
  const [isCreatingPassport, setIsCreatingPassport] = useState(false);

  const reader = new FileReader();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setIsFileLoading(true);
      setFile(selectedFile);
      reader.onprogress = updateProgress;
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const createDNAPassport = () => {
    if (!file) { return };

    setIsCreatingPassport(true);

    // TODO: upload file on NIllion

    reader.onload = async(e) => {
      const fileBuffer = e.target?.result as ArrayBuffer;
      // Convert file name to ArrayBuffer
      const fileNameArrayBuffer = new TextEncoder().encode(file.name);

      const spark = new SparkMD5.ArrayBuffer();

      // Calculate file name hash
      spark.append(fileNameArrayBuffer);
      const passportId = spark.end();

      // Reset SparkMD5 instance for file content hashing
      spark.reset();
      spark.append(fileBuffer);
      const fileHash = spark.end();

      const data: IPassportData = {
          passportId,
          fileHash,
          dataHash: '',
          valid: true,
      }

      try {
          await createAttestation(data);
          setPassportData(data);
          setIsWallet(true);
      } catch (error) {
          console.error('Failed to create attestation:', error);
      } finally {
        setIsCreatingPassport(false);
      }
    }

    reader.readAsArrayBuffer(file);
  }

  const updateProgress = (e: ProgressEvent<FileReader>) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      console.log(`File upload fileProgress: ${percentComplete}%`);
      setFileProgress(percentComplete)
      setIsFileLoading(percentComplete < 100)
    }
  };

  console.log('passportData', passportData)

  if(isWallet && passportData) {
    return <DownLoadWallet
      passport={passportData}
      goBack={() => setIsWallet(false)}
    />
  }

  return (
    <div className='sm:w-[552px]'>
      <Typography variant='h5'> Upload Raw DNA File </Typography>
      <Box
        className='flex flex-col gap-2 px-4 py-6 mt-2 justify-center items-center border border-dashed'
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

        <Typography color='text.secondary'> Exome sequencing or genotyping data (Max X GB) </Typography>
      </Box>
      {file &&
        <>
          <Box className='flex justify-between mt-4 mb-10'>
            <div className='flex items-center gap-3'>
              <UploadFileIcon className='w-10 h-10' />
              <div>
                <Typography color='text.primary'> { file.name } </Typography>
                <Typography color='text.secondary' variant='subtitle2'> {formatFileSize(file?.size ?? 0)} . Loading </Typography>
                <Box sx={{ width: '200px' }}>
                  <LinearProgress variant='determinate' value={fileProgress} />
                </Box>
              </div>
            </div>
            <IconButton
              onClick={() => console.log('delete file')}
              aria-label="remove file"
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <LoadingButton
            variant='contained'
            loading={isCreatingPassport}
            disabled={fileProgress < 100}
            onClick={() => createDNAPassport()}
            className='w-[400px]'
          >
            Create DNA PAssport
          </LoadingButton>
        </>
      }
    </div>
  )
}

export default UploadFile;