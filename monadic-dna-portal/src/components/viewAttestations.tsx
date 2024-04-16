import React from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { teal, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/CheckCircle';

const ViewAttestations = () => {

    return (
        <Box
            className={`w-[296px] h-[247px] flex flex-col justify-between border rounded-[20px] p-0`}
            sx={{ borderColor: teal[900] }}
        >
          <Box
              className={`w-full h-[55px] rounded-t-[18px] pt-3 pl-5 mb-11 text-white`}
              sx={{ background: teal[900] }}
          >
              <Typography> { 'Type-2 Diabetes' } </Typography>
          </Box>

          <Typography className='pl-5'> Result: {' High Risk' }</Typography>

          <Box className='mt-14 pb-3 pl-5 rounded-b-[19px]' sx={{ background: grey[50] }}>
              <Typography> Provided by: SnipperBot </Typography>
              <Typography className='flex items-center gap-1' color='success.main'>
                  <span> Authorized Provider </span>
                  <CheckIcon sx={{ width:16, height: 16 }}/>
              </Typography>
          </Box>

        </Box>
    )
}

export default ViewAttestations;