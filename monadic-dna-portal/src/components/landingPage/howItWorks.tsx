import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { lime } from '@mui/material/colors';

const CustomList = ({
  title,
  text
}:{
  title: string;
  text: string;
}) => {
    return (
      <li className='py-3'>
          <b> {title} </b>
          {text}
      </li>
    );
}

const HowItWorks = () => {
    return (
        <>
            <Box
                className='flex flex-col items-center justify-center py-14'
                sx={{ background: `${lime[50]}33`}}
            >
                <Typography variant='h3' className='pb-11'> How does it work? </Typography>
                <ol className='sm:w-[520px]'>
                    <CustomList
                      title='1. Create a DNA Passport:'
                      text='Upload your 23andMe raw genomic data to create a DNA passport. This will make an encrypted file containing your genomic data.'
                    />
                    <CustomList
                      title='2. Get Insights:'
                      text='This secure DNA passport can be used on privacy-respecting tools like SnipperBot and mtDog to learn about health and ancestry insights in an anonymous and private way.'
                    />
                    <CustomList
                      title='3. Receive Attestations:'
                      text='After these services provide you with results about your encrypted DNA data, Monadic DNA can read your passport to display related attestations created. Attestations allow you to show verified results to providers without actually revealing your sensitive genomic data.'
                    />
                </ol>
            </Box>
        </>
    )
}

export default HowItWorks;