import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { lime } from '@mui/material/colors';

const HowItWorks = () => {
    return (
        <>
            <Box
                className='flex flex-col items-center justify-center py-14'
                sx={{ background: `${lime[50]}33`}}
            >
                <Typography variant='h3' className='pb-11'> How does it work? </Typography>
                <ol className='sm:w-[520px]'>
                <li className='py-3'>
                    <b> 1. Create a DNA Passport: </b>
                    Upload your 23andMe raw genomic data to create a DNA passport. This will make an encrypted file containing your genomic data.
                </li>
                <li className='py-3'>
                    <b> 2. Get Insights: </b>
                    <span>
                        This secure DNA passport can be used on privacy-respecting tools like
                        <Link href='https://snipperbot.xyz' target='_blank' rel='noopener noreferrer' color='inherit'> SnipperBot </Link>
                        and
                        <Link href='https://mtdog.xyz' target='_blank' rel='noopener noreferrer' color='inherit'> mtDog </Link>
                        to learn about health and ancestry insights in an anonymous and private way.
                    </span>
                </li>
                <li className='py-3'>
                    <b> 3. Receive Attestations: </b>
                    After these services provide you with results about your encrypted DNA data, Monadic DNA can read your passport to display related attestations created. Attestations allow you to show verified results to providers without actually revealing your sensitive genomic data.
                </li>
                </ol>
            </Box>
        </>
    )
}

export default HowItWorks;