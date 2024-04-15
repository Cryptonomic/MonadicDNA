// 'use client';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';


export default function PageTabs({
    value,
    handleChange,
    tabs
}: {
    value: string,
    handleChange: (event: React.SyntheticEvent, value: any) => void,
    tabs: { value: string; label: string; }[],
}) {

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label='Navigation tabs for managing DNA Passport'
            >
                {tabs.map((tab: { value: string; label: string }) => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                ))}
            </Tabs>
        </Box>
    );
}