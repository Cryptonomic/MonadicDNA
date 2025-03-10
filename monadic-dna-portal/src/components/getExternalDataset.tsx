import React from 'react';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import { lime } from '@mui/material/colors';

const config = require('../config.json');

const GetExternalDataset = () => {
    return (
        <>
          <Box className='flex items-center gap-2 pb-14'>
              <span>
                  <InfoIcon sx={{color: lime[400]}} />
              </span>
              <Typography className='text-xs sm:text-base '>
                  Don&apos;t have your own 23andMe data? {' '}
                  <Link target="_blank" rel="noopener noreferrer" color="inherit" href={config.dataSetUrl}>Get an example dataset</Link>
              </Typography>
          </Box>
        </>
    )
}

export default GetExternalDataset;