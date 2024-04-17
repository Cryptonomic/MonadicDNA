'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { teal } from '@mui/material/colors';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        primary: {
            main: teal[800],
        }
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
});

export default theme;
