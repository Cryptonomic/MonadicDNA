import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Home() {
    return (
        <main>
            <div className='flex flex-col items-center mb-12'>
                <div className='bg-[#E1E1E1] w-[70%] sm:w-[600px] lg:w-[858px] h-[63px] mb-5' />
                <div className='bg-[#E1E1E1] w-[100%] sm:w-[680px] lg:w-[996px] h-[56px]' />
            </div>

            <div className='flex items-center justify-center gap-2'>
                <Button variant='contained' href='/passport/create'> Create DNA PAssport </Button>
                <Button color='inherit' href='attestations/view'> View Attestations </Button>
            </div>

            <div className='mt-[79px] mb-[59px]'>
                <Typography className='text-center' variant='h5'> Problem Statement</Typography>
                <div className='bg-[#E1E1E1] sm:w-[680px] lg:w-[996px] h-[220px] mt-5' />
            </div>

            <div>
                <Typography className='text-center' variant='h5'> How Monadic DNA is a solution</Typography>
                <div className='bg-[#E1E1E1] sm:w-[680px] lg:w-[996px] h-[220px] mt-5' />
            </div>
        </main>
    );
}
