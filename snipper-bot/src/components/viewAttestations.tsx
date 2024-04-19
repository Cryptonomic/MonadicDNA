'use client';
import React from 'react';
import Link from '@mui/material/Link';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IViewAttestation } from '@/types';
import { getRiskLevel } from '@/utils';

import { resultData } from '@/utils/data';

const config = require('../config.json');

const ViewAttestationsCard = ({
    data
}: {
    data: IViewAttestation
}) => {

    const attestationData = data.data;
    console.log('attestationData', attestationData);
    const trait = attestationData.Trait.toLowerCase();
    const currentTrait = resultData[trait];

    if(!currentTrait) { return; }

    const title = currentTrait.title;
    const description = currentTrait.description;
    const riskLevel = getRiskLevel(attestationData.Value);
    const footerText = currentTrait.getFooterText(riskLevel);
    const color = currentTrait.color;

    return (
        <Box
            className={`sm:w-[698px] flex flex-col justify-between border p-0 mb-6`}
            sx={{ borderColor: color[900] }}
        >
        <Box
            className={`w-full h-[55px] pt-3 pl-5 mb-11 text-white`}
            sx={{ background: color[900] }}
        >
            <Typography> { title } </Typography>
        </Box>

        <Typography className='pl-5'> { description } </Typography>

        <Box className='flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between mt-14 pb-3 p-4' sx={{ background: `${color[900]}0D` }}>
            <Typography>  { footerText } </Typography>
            <Link
                href={`${config.signUrl}/${data.id}`}
                target="_blank"
                rel="noopener noreferrer"
                color='inherit'
            >
                View on SignScan
            </Link>
        </Box>
        </Box>
    )
}


const ViewAttestations = ({
    attestationData
}: {
    attestationData: IViewAttestation[]
}) => {

    return (
        <Box className='pl-4 pt-11 lg:pl-[372px]'>
            <Typography variant='h6'> Your Results </Typography>
            <Typography paddingY={4} > Attestations of these results have been added to your DNA Passport. </Typography>

            {attestationData && attestationData?.map((data) => (
                <ViewAttestationsCard key={data.id} data={data} />
            ))}
        </Box>
    )
}

export default ViewAttestations;