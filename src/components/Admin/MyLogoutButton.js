import * as React from 'react';
import { forwardRef } from 'react';
import MenuItem from '@mui/material/MenuItem';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';
import { signOut } from 'supertokens-auth-react/recipe/session';

const MyLogoutButton = forwardRef((props, ref) => {
  const handleClick = async () => {
    await signOut();
    window.location.reload(); // react-admin uses hash router. We need to reload to redirect back to Supertokens login page
  };

  return (
    <MenuItem onClick={handleClick} ref={ref}>
      <ExitIcon /> Logout
    </MenuItem>
  );
});

export default MyLogoutButton;
