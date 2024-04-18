'use client';
import React, { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { lime, teal, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { IMonadicDNAVerifiedTrait } from '@/types';
import { getResultsById } from '@/utils/signProtocol';

const config = require('../config.json');

const ViewResults = ({ id }: { id: string; }) => {

    const [attestationData, setAttestationData] = useState<IMonadicDNAVerifiedTrait | null>();

    useEffect(() => {
        (async() => {
            const result = await getResultsById(id)
            setAttestationData(result);
        })()
    }, [id])

    return (
        <Box
            className={`w-[296px] h-[247px] flex flex-col justify-between border rounded-[20px] p-0`}
            sx={{ borderColor: teal[900] }}
        >
          <Box
              className={`w-full h-[55px] rounded-t-[18px] pt-3 pl-5 mb-11 text-white`}
              sx={{ background: teal[900] }}
          >
              <Typography> { attestationData?.Trait } </Typography>
          </Box>

          <Typography className='pl-5'> Result: {attestationData?.Value?.toLowerCase() === 'yes' ? ' High Risk' : ' Low Risk'}</Typography>
          <Link
              href={`${config.signUrl}/${id}`}
              className='pl-5'
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: lime[800]}}
          >
              ID: {id}
          </Link>

          <Box className='mt-14 pb-3 pl-5 rounded-b-[19px]' sx={{ background: grey[50] }}>
              <Typography> Provided by: {attestationData?.Provider} </Typography>
              <Typography className='flex items-center gap-1' color='success.main'>
                  <span> Authorized Provider </span>
                  <CheckIcon sx={{ width:16, height: 16 }}/>
              </Typography>
          </Box>

        </Box>
    )
}

export default ViewResults;