'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import PageTabs from '@/components/tabs';
import UploadFile from '@/components/uploadFile';

export default function Home() {
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = pathname.split('/passport/')[1];


    const [value, setValue] = useState(currentTab);

    const handleChange = (event: React.SyntheticEvent, newValue: string,) => {
        setValue(newValue);
        router.push(`/passport/${newValue}`);
    };

    const tabs = [
        { value: 'create', label: 'Create DNA Passport' },
        { value: 'results', label: 'View Results' }
    ];

    return (
        <div className='p-4 sm:p-5 lg:pl-[130px] lg:pt-[50px]'>
            <PageTabs { ...{ value, handleChange, tabs }}/>
            <div className='w-full mt-10'>
                {value === 'create' &&
                    <UploadFile
                        type='createPassport'
                        isTypeCreate
                    />
                }
                {value === 'results' &&
                    <UploadFile type='viewResults' />
                }
            </div>
        </div>
    );
}
