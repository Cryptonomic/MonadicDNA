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
                <Toolbar variant='dense' className='p-0'>
                    <IconButton
                        edge='start'
                        color='inherit'
                        href='/'
                        aria-label='menu'
                        className='p-0 w-[48px] h-[48px]'
                    >
                        <Image
                            src={'/logo.png'}
                            width={48}
                            height={48}
                            alt="Monadic DNA App Logo"
                        />
                    </IconButton>
                    <Typography
                        variant='h5'
                        className={`font-light text-2xl ml-2 font-['Inria_Sans']`}
                        sx={{
                            flexGrow: 1,
                            color: teal[900]
                        }}
                    >
                        Monadic DNA
                    </Typography>
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