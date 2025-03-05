import React from 'react';
import Image from 'next/image';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { blueGrey, lime } from '@mui/material/colors';

const LandingPageHeader = () => {
  return (
    <>
        <Box className='flex flex-col items-center mt-16 sm:mt-[118px] pl-4 xl:pl-[71px]'>
            <Typography variant='h3' color='text.primary'>
                Monadic DNA lets you encrypt your DNA data to use with privacy-respecting genomic sequencing services
            </Typography>
            <Box
                className='flex justify-center items-center sm:w-[654px] gap-4 p-2 mt-12'
                sx={{ background: lime[50] }}
            >
                <Typography variant='h4'> 👩‍💻 </Typography>
                <Typography color='primary'>
                    This prototype was created for the Scaling Ethereum 2024 hackathon and is for demonstration purposes only. It is not intended for any healthcare application and does not provide medical advice.
                </Typography>
            </Box>
        </Box>
        <Box className='flex flex-col sm:flex-row justify-center items-center gap-2 mt-16'>
            <Button size='large' variant='contained' href='/passport/create'> Create a DNA PAssport </Button>
            <Button size='large' sx={{ color: blueGrey[900] }} href='/passport/results'> View Results </Button>
        </Box>

        <Box className='flex justify-center items-center mx-auto mt-4 sm:mt-14'>
            <Image
                src={'/poweredBy.svg'}
                width={487}
                height={27}
                alt="Powered by Nillion, Sign Protocol and Risc Zero"
            />
        </Box>
    </>
  )
}

export default LandingPageHeader;