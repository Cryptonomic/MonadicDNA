import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { CustomError } from '@/types/customError';

const ErrorModal = ({
    error,
    setError
  }: {
    error: CustomError,
    setError: React.Dispatch<React.SetStateAction<CustomError | undefined>>;
}) => {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
      setOpen(false);
      setError(undefined);
    };


    return (
        <>
            <Dialog
                open={open}
                aria-labelledby="error-title"
                aria-describedby="error-description"
            >
                <DialogTitle id="error-title" color='error.main' textAlign='center'>
                   { error.message }
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                        { error.description }
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ErrorModal;