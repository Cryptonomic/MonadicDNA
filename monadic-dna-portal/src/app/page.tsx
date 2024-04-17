import Box from '@mui/material/Box';

import HowItWorks from '@/components/landingPage/howItWorks';
import ProblemStatement from '@/components/landingPage/problemStatement';
import Solution from '@/components/landingPage/solution';
import Footer from '@/components/landingPage/footer';

export default function Home() {
    return (
        <>
            <main>
                <Box className='flex flex-col px-4 sm:p-5 lg:px-20 pl-4 xl:pl-[151px]'>
                    <ProblemStatement />

                    <Solution />

                    <HowItWorks />
                </Box>
            </main>
            <Footer />
        </>
    );
}
