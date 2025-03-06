'use client';
import React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Image from 'next/image';

const Header = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static' color='transparent' sx={{ boxShadow: 0 }}>
                <Toolbar variant='dense' sx={{ justifyContent: 'center' }}>
                    <IconButton
                        color='inherit'
                        href='/'
                        aria-label='menu'
                        className='p-0 w-[225px] h-[45px]'
                        disableRipple
                    >
                        <Image
                            src={'/logo.svg'}
                            layout='fill'
                            alt="SnipperBot App Logo"
                        />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Header;