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
                sx={{ 
                    background: `${orange[50]}40`,
                    color: 'rgba(0, 0, 0, 0.87)',
                }}
            >
                <Typography sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    Genomic Analysis Insights
                </Typography>
                <List
                    className='ml-6'
                    sx={{ 
                        listStyleType: 'disc',
                        color: 'rgba(0, 0, 0, 0.87)',
                    }}
                >
                    <ListItem 
                        sx={{ 
                            display: 'list-item', 
                            paddingX: 0,
                            color: 'rgba(0, 0, 0, 0.87)',
                        }}
                    >
                        Find out whether you carry genetic risk for Thrombophilia
                    </ListItem>
                    <ListItem 
                        sx={{ 
                            display: 'list-item', 
                            paddingX: 0,
                            color: 'rgba(0, 0, 0, 0.87)',
                        }}
                    >
                        More insights coming soon!
                    </ListItem>
                </List>
            </Box>
        </>
    )
}

export default AnalysisInsights;