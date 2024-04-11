'use client';

export default function DownLoadWallet({ passport }: {passport: any}) {

  const downloadPassportData = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passportData.json';
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <div className='flex flex-col justify-center items-center'>
      <p className="sm:text-2xl mb-[28px]">
        Your Encrypted Genomic Wallet
      </p>
      <button
        onClick={() => downloadPassportData(passport)}
        className='bg-[#E1E1E1] flex m-auto sm:text-2xl justify-center items-center'
      >
        passportData.json
      </button>
    </div>
  );
}