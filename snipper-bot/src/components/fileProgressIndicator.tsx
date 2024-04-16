import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { formatFileSize } from '@/utils/formatting';

const FileProgressIndicator = ({
    file,
    fileProgress
}: {
    file: File;
    fileProgress: number;
}) => {
  return (
    <>
      <Box className='flex justify-between mt-4 mb-10'>
          <div className='flex items-center gap-3'>
              <UploadFileIcon className='w-10 h-10' />
              <div>
                  <Typography color='text.primary'> { file.name } </Typography>
                  <Typography color='text.secondary' variant='subtitle2'> {formatFileSize(file?.size ?? 0)} . Loading </Typography>
                  <Box sx={{ width: '200px' }}>
                      <LinearProgress variant='determinate' value={fileProgress} />
                  </Box>
              </div>
          </div>
          <IconButton
              onClick={() => console.log('delete file')}
              aria-label="remove file"
          >
              <DeleteIcon />
          </IconButton>
      </Box>
    </>
  )
}

export default FileProgressIndicator;