'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';

import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IPassportData } from '@/utils/attestations';

export default function DownLoadWallet({
    passport,
    goBack,
}: {
    passport: IPassportData;
    goBack: () => void;
}) {

    const fileName = `monadicdna_passport_${passport?.fileHash}`

    const downloadPassportData = (data: any) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.json`;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    };

    return (
        <Box className='w-fit'>
            <Typography variant='h5'> Your DNA Passport </Typography>

            <Box className='flex items-center p-6 mt-6 bg-[#f7f7f7]'>
                <Typography color={blue[500]}> {`${fileName}.JSON`} </Typography>
                <IconButton
                    onClick={() => downloadPassportData(passport)}
                    className='ml-6'
                    aria-label="download DNA passport"
                >
                    <DownloadIcon />
                </IconButton>
            </Box>

            <Typography> Your genomic data is now encrypted with your passport! </Typography>
            <Typography className='pt-7'> Your DNA passport includes: </Typography>
            <div className='bg-[#E1E1E1] sm:w-[283px] h-[24px] mt-1' />
            <div className='bg-[#E1E1E1] sm:w-[283px] h-[24px] mt-1' />
            <div className='bg-[#E1E1E1] sm:w-[283px] h-[24px] mt-1 mb-6' />
            <Button
                onClick={goBack}
                startIcon={<ArrowBackIcon />}
            >
                Go back
            </Button>
        </Box>
    );
}