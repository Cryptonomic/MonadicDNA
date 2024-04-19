'use client';
import React, { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { lime, teal, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { IMonadicDNAVerifiedTrait } from '@/types';
import { getResultsById } from '@/utils/signProtocol';
import { IError } from '@/types/uploadFile';
import ErrorModal from './errorModal';
import { getRiskLevel } from '@/utils';

const config = require('../config.json');

const ResultsCard = ({
    id,
    attestationData
}: {
    id: string;
    attestationData: IMonadicDNAVerifiedTrait
}) => {

    return (
        <>
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

              <Typography className='pl-5'> Result: {getRiskLevel(attestationData?.Value)}</Typography>
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
        </>
    )
}


const ViewResults = ({ ids }: { ids: string[]; }) => {

    const [attestationData, setAttestationData] = useState<IMonadicDNAVerifiedTrait[] | null>();
    const [error, setError] = useState<IError | null>(null);

    useEffect(() => {
        (async() => {
            try {
                const promises = ids.map(id => getResultsById(id));
                const results = await Promise.all(promises);

                const filteredResult = results.filter((item, index, self) =>
                    index === self.findIndex((t) =>
                        t.Provider === item.Provider && t.Trait === item.Trait
                    )
                );

                setAttestationData(filteredResult);

            } catch (error) {
                setError({
                    isError: true,
                    title: 'Failed to retreive results',
                    text: 'Please ensure that an attestation has been added to this passport. Contact support if issue persits.'
                });
            }
        })()
    }, [ids])

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-4'>
            {error?.isError &&
                <ErrorModal error={error} setError={setError} />
            }
            {attestationData && attestationData?.map((x, index) => (
              <ResultsCard key={ids[index]} id={ids[index]} attestationData={x} />
            ))}

        </div>
    )
}

export default ViewResults;