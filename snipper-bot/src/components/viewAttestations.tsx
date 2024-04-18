'use client';
import React from 'react';
import Link from '@mui/material/Link';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { teal, grey, pink } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { IMonadicDNAVerifiedTrait } from '@/types';

const config = require('../config.json');

interface IResultData {
    title: string;
    description: string;
    color: any;
    getFooterText(result: string): string;
}

const resultData: Record<string, IResultData> = {
  'thrombosis': {
      title: 'Genetic risk for thrombophilia',
      description: 'Thrombophilia is a predisposition to developing harmful blood clots. The two most common genetic variants linked to an increased risk for thrombophilia are found in two genes called F5 and F2.',
      color: pink,
      getFooterText(result: string): string {
          return `You have a ${result === 'no' ? 'Low' : 'High'} likelihood of genetic thrombophilia.`;
      }
  },
};


const ViewAttestations = ({
    id,
    attestationData
}: {
    id: string,
    attestationData: IMonadicDNAVerifiedTrait
}) => {

    console.log('attestationData', attestationData);
    const trait = attestationData.Trait.toLowerCase();

    const title = resultData[trait].title;
    const description = resultData[trait].description;
    const footerText = resultData[trait].getFooterText(attestationData.Value);
    const color = resultData[trait].color;

    return (
        <Box className='pl-4 pt-11 lg:pl-[372px]'>
            <Typography variant='h6'> Your Results </Typography>
            <Typography paddingY={4} > Attestations of these results have been added to your DNA Passport. </Typography>
            <Box
                className={`sm:w-[698px] flex flex-col justify-between border p-0`}
                sx={{ borderColor: color[900] }}
            >
            <Box
                className={`w-full h-[55px] pt-3 pl-5 mb-11 text-white`}
                sx={{ background: color[900] }}
            >
                <Typography> { title } </Typography>
            </Box>

            <Typography className='pl-5'> { description } </Typography>

            <Box className='flex justify-between mt-14 pb-3 p-4' sx={{ background: `${color[900]}0D` }}>
                <Typography>  { footerText } </Typography>
                <Link
                    href={`${config.signUrl}/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    color='inherit'
                >
                    View on SignScan
                </Link>
            </Box>
            </Box>
        </Box>
    )
}

export default ViewAttestations;