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
    title: "Snipper Bot",
    description: "Generated by snipper-bot app",
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
                    <div className="w-screen px-2 sm:p-5 lg:px-20 py-5 flex flex-col min-h-screen">
                        <Header />
                        <div className="flex min-h-screen flex-col items-center mt-[115px]">
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}