import React, { Dispatch, SetStateAction } from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { lime } from '@mui/material/colors';

import Modal from './modal';
import { IError } from '@/types/uploadFile';

const ErrorModal = ({
    error,
    setError
}:{
    error: IError;
    setError: Dispatch<SetStateAction<IError | null>>;
}) => {
    console.log('error', error)

    return (
        <>
            <Modal open={error.isError ?? true}>
                <Box
                    className='sm:w-[400px] flex flex-col items-center justify-between p-5 rounded-lg'
                    sx={{ background: `${lime[50]}59`, zIndex: 20 }}
                >
                    <Typography color='error.main' variant='h6' className='pb-4 capitalize'> { error.title } </Typography>
                    <Typography> { error.text } </Typography>
                    <Button
                        className='mt-4 ml-auto'
                        variant='outlined'
                        onClick={() => setError({
                            isError: false,
                            title: '',
                            text: '',
                        })}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
        </>
    )
}

export default ErrorModal;