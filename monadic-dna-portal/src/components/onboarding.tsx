'use client';
import { ChangeEvent, FormEvent, useState } from 'react';
import { MD5 } from 'crypto-js';

import Image from 'next/image';
import uploadIcon from '../../public/upload.svg';
import Modal from './modal';
import Loading from './loading';
import DownLoadWallet from './downloadWallet';
import { createNotaryAttestation } from '@/utils/sdkattestations';
import { createNotaryAttestation2 } from '@/utils/attestations';

export default function Onboarding() {
  const [file, setFile] = useState<File | null>(null);
  const [passportData, setPassportData] = useState<{ passportId: string; fileHash: string } | null>(null);
  const [isEncryptingFile, setIsEncryptingFile] = useState(false);
  const [isPassport, setIsPassport] = useState(false);
  const [fileErrorText, setFileErrorText] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const passportId = MD5(selectedFile.name).toString();
      setPassportData({ passportId, fileHash: '' });
    }
  };

  const handleFileLoad = (e: ProgressEvent<FileReader>) => {
    const fileBuffer = e.target?.result as ArrayBuffer;
    const byteArray = Array.from(new Uint8Array(fileBuffer));
    const binaryString = String.fromCharCode.apply(null, byteArray);
    const fileHash = MD5(binaryString).toString();
    setPassportData(prevData => prevData ? { ...prevData, fileHash } : null);
  };

  const uploadFile = (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileErrorText('Please select a file.');
      return;
    }

    setIsEncryptingFile(true);

    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsArrayBuffer(file);

    setTimeout(() => {
      setIsEncryptingFile(false);
      setIsPassport(true);
    }, 3000);
  }

  if(isPassport) {
    return <DownLoadWallet passport={passportData} />
  }

  const createAttestation = async () => {
    // const res = await createNotaryAttestation()
    const res = await createNotaryAttestation2()
    console.log('res', res)
  }

  return (
    <>
      <br />
      <button
        onClick={ () => createAttestation()}
      >
        Create Attestation
      </button>
      <Modal open={isEncryptingFile}>
        <Loading />
      </Modal>
      <div>
        <div className='flex sm:w-[38.125rem] h-[12.8125rem] border border-black border-dashed px-2 py-10 sm:p-0'>
          <button
            onClick={(e) => uploadFile(e)}
            className='bg-[#E1E1E1] flex m-auto sm:text-2xl capitalize sm:w-[421px] h-[48px] justify-center items-center'
          >
            <Image
              src={uploadIcon}
              alt='upload'
              className='w-8 h-8'
            />
            Upload Raw Genomic Data File
          </button>
        </div>
        <div className='flex flex-col gap-2 mt-7'>
          <div className='bg-[#E1E1E1] w-[30%] sm:w-[160px] h-[27px]' />
          <div className='bg-[#E1E1E1] sm:w-[610px] h-[27px]' />
        </div>
        <div className='sm:w-[601px] bg-[#E1E1E1] mt-16'>
          <input
            type="file"
            onChange={handleFileChange}
            className='w-full'
          />
        </div>
        <span className='text-[red] text-xs'> {fileErrorText} </span>
      </div>
    </>
  );
}
