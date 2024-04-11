'use client';

import Image from 'next/image';

import loadingIcon from '../../public/loading.svg';

export default function Loading() {
  return (
    <div className='flex flex-col justify-center items-center'>
      <p className="sm:text-2xl">
        Encrypting your data ...
      </p>
      <div className="w-[66px] h-[66px] m-auto">
        <Image
          src={loadingIcon}
          alt="loading-gif"
          className="animate-spin w-full h-full mt-6"
        />
      </div>
    </div>
  );
}