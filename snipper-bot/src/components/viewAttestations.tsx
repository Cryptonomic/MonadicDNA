'use client';
import React from 'react';
import Link from '@mui/material/Link';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { grey,  } from '@mui/material/colors';
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

    const title = resultData[trait]?.title ?? trait;
    const description = resultData[trait]?.description;
    const riskLevel = getRiskLevel(attestationData.Value);
    const footerText = resultData[trait]?.getFooterText(riskLevel);
    const color = resultData[trait]?.color ?? grey;

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
                    href={`${config.signUrl}/${data.id}`}
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


const ViewAttestations = ({
    attestationData
}: {
    attestationData: IViewAttestation[]
}) => {

    return (
        <>
            {attestationData && attestationData?.map((data) => (
                <ViewAttestationsCard key={data.id} data={data} />
            ))}
        </>
    )
}

export default ViewAttestations;