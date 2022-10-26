import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { forwardRef } from 'react';

const LoggedInUserEmail = forwardRef((props, ref) => {
  return <MenuItem ref={ref}>{props.loggedInUserEmail}</MenuItem>;
});

export default LoggedInUserEmail;
