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
    title: "Monadic DNA Portal | Scaling Ethereum Hackathon Prototype",
    description: "Generated by Monadic DNA portal",
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
                    <div className="w-screen flex flex-col h-screen">
                        <Header />
                        <div className="flex h-screen flex-col">
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
