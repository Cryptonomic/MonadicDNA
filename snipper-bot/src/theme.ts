'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { orange } from '@mui/material/colors';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const darkText = 'rgba(0, 0, 0, 0.87)';
const darkTextSecondary = 'rgba(0, 0, 0, 0.6)';

const theme = createTheme({
    palette: {
        mode: 'light', // Force light mode
        primary: {
            main: orange[800],
        },
        text: {
            primary: darkText,
            secondary: darkTextSecondary,
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        }
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: `${darkText}`,
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: `${darkText}`,
                }
            }
        }
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        allVariants: {
            color: darkText,
        },
    },
});

export default theme;
