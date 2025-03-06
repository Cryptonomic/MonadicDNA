import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';

import "./globals.css";

import Header from "@/components/header";
import theme from "@/theme";

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: "Snipper Bot | Scaling Ethereum Hackathon Prototype",
    description: "Snipper Bot is a prototype for the Scaling Ethereum hackathon",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={roboto.className}>
                <ThemeProvider theme={theme}>
                    <div className="w-screen flex flex-col min-h-screen px-4 sm:p-5 lg:px-20 lg:pt-11">
                        <Header />
                        <div className="flex min-h-screen flex-col">
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
