import React, { Dispatch, SetStateAction } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { lime } from '@mui/material/colors';

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
            <Dialog
                open={error.isError ?? true}
                aria-labelledby="error-title"
                aria-describedby="error-description"
                sx={{ background: `${lime[50]}59`, zIndex: 20 }}
            >
                <DialogTitle id="error-title" color='error.main' textAlign='center'>
                   { error.title }
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setError({
                        isError: false,
                        title: '',
                        text: '',
                    })}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[800],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <DialogContentText id="error-description" textAlign='center'>
                        { error.text }
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ErrorModal;