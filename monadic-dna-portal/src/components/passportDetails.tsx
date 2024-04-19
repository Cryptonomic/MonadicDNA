import React from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';


const PassportDetails = () => {
    return (
        <List
              className='ml-5'
              sx={{ listStyleType: 'disc' }}
        >
            <ListItem sx={{ display: 'list-item'}}>
                A unique ID
            </ListItem>
            <ListItem sx={{ display: 'list-item'}}>
                Information that lets providers validate your data
            </ListItem>
            <ListItem sx={{ display: 'list-item'}}>
                Names for encrypted items we have stored on the Nillion network for you
            </ListItem>
        </List>
    )
}

export default PassportDetails;