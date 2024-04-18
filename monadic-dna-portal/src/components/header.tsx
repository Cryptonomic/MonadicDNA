'use client';
import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { lime, teal } from '@mui/material/colors';
import LandingPageHeader from './landingPage/landingPageHeader';

const Header = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

    return (
        <Box
            className='px-2 sm:p-5 lg:px-20 lg:py-5 bg-opacity-75'
            sx={{
                flexGrow: 1,
                background: `${isLandingPage && lime[50]}59`
            }}
        >
            <AppBar position='static' color='transparent' sx={{ boxShadow: 0 }}>
                <Toolbar variant='dense' className='p-0 justify-between'>
                    <IconButton
                        edge='start'
                        color='inherit'
                        href='/'
                        aria-label='menu'
                        className='p-0 w-[197px] h-[48px]'
                        disableRipple
                    >
                        <Image
                            src={'/logo.svg'}
                            layout='fill'
                            objectFit='contain'
                            alt="Monadic DNA App Logo"
                        />
                    </IconButton>
                    {isLandingPage &&
                        <Button
                            variant='contained'
                            href='/passport/create'
                        >
                            Enter App
                        </Button>
                    }
                </Toolbar>
            </AppBar>
            {isLandingPage &&
                <LandingPageHeader />
            }
        </Box>
    )
}

export default Header;