'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { teal } from '@mui/material/colors';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const darkText = 'rgba(0, 0, 0, 0.87)';
const darkTextSecondary = 'rgba(0, 0, 0, 0.6)';

const theme = createTheme({
    palette: {
        primary: {
            main: teal[800],
        },
        text: {
            primary: darkText,
            secondary: darkTextSecondary,
        },
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
        },
        MuiList: {
            styleOverrides: {
                root: {
                    color: `${darkText}`,
                }
            }
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    color: `${darkText}`,
                }
            }
        }
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
});

export default theme;
