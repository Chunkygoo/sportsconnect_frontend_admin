import * as React from 'react';
import { forwardRef } from 'react';
import MenuItem from '@mui/material/MenuItem';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';

const MyLogoutButton = forwardRef((props, ref) => {
  return (
    <MenuItem onClick={props.reactAdminSignOut} ref={ref}>
      <ExitIcon /> Logout
    </MenuItem>
  );
});

export default MyLogoutButton;
