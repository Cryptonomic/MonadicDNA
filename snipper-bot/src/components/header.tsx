'use client';
import React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

const Header = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static' color='transparent' sx={{ boxShadow: 0 }}>
                <Toolbar variant='dense' className='p-0'>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='menu'
                        sx={{ mr: 2 }}
                    >
                        <BloodtypeIcon />
                    </IconButton>
                    <Typography
                        variant='h5'
                        sx={{ flexGrow: 1 }}
                        className={`font-light font-['Inria_Sans']`}
                    >
                        Snipper Bot
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Header;