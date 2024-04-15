'use client';

import { useState } from 'react';

import PageTabs from '@/components/tabs';
import UploadFile from '@/components/uploadFile';

export default function Home() {
    const [value, setValue] = useState('one');

    const handleChange = (event: React.SyntheticEvent, newValue: string,) => {
        setValue(newValue);
    };

    const tabs = [
        { value: 'one', label: 'Create DNA Passport' },
        { value: 'two', label: 'View Attestations' }
    ];

    return (
        <>
            <PageTabs { ...{ value, handleChange, tabs }}/>
            <div className='w-full mt-10'>
                {value === 'one' &&
                    <UploadFile type='createPassport' />
                }
                {value === 'two' &&
                    <UploadFile type='viewAttestation' />
                }
            </div>
        </>
    );
}
