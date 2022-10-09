import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';

const Dashboard = () => {
  return (
    <Card>
      <CardHeader title="Welcome to the admin panel" />
      <CardContent>
        You can create, read, update and delete various resources here. Be
        careful as with more power, comes more responsibility...
      </CardContent>
    </Card>
  );
};

export default Dashboard;
