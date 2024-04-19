import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { orange } from '@mui/material/colors';

const AnalysisInsights = () => {
    return (
        <>
            <Box
                className='sm:w-[532px] p-4 mt-[1.875rem]'
                sx={{ background: `${orange[50]}40` }}
            >
                <Typography>
                    Genomic Analysis Insights
                </Typography>
                <List
                    className='ml-6'
                    sx={{ listStyleType: 'disc' }}
                >
                    <ListItem sx={{ display: 'list-item', paddingX: 0, }}>
                        Find out whether you carry genetic risk for Thrombophilia
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', paddingX: 0, }}>
                        More insights coming soon!
                    </ListItem>
                </List>
            </Box>
        </>
    )
}

export default AnalysisInsights;