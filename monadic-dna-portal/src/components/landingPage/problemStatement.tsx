import React from 'react';
import Image from 'next/image';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProblemStatement = () => {
  return (
    <>
        <Box className='flex flex-wrap flex-col sm:flex-row items-end xl:gap-x-[52px]'>
            <Box className='flex-1 sm:pb-[118px]'>
                <Typography variant='h3'className='pt-6 sm:pt-[92px]'> The current privacy challenge with personal genomics </Typography>
                <Typography
                    className='pt-[36px] pb-6 text-lg sm:text-2xl '
                >
                    Personal genomics services have transformed the understanding we have of our health and ancestry by offering insights into our biological heritage and health predispositions.
                </Typography>
                <Typography className='text-lg sm:text-2xl' >
                    However, these services often rely on insecure methods for handling your data. This risks the exposure of your most sensitive biological information to unauthorized third parties and cyber threats.
                </Typography>
            </Box>

            <Box className='flex-none w-[301px] h-[244px] xl:mr-[126px] '>
                <Image
                    src={'/privacy.png'}
                    width={301}
                    height={244}
                    alt="Monadic DNA App Logo"
                />
            </Box>
        </Box>
    </>
  )
}

export default ProblemStatement;