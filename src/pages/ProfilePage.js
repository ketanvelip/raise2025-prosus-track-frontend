import React from 'react';
import { Container, Typography, Paper, Box, Avatar, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  const { user } = useUser();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        User Profile
      </Typography>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar alt={user.name} src={user.avatar} sx={{ width: 80, height: 80 }} />
          </Grid>
          <Grid item>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="body1" color="text.secondary">{user.email}</Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Virtual Wallet</Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.paper' }}>
            <Typography variant="h6">Balance: ${user.walletBalance.toFixed(2)}</Typography>
          </Paper>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} to="/profile/orders" variant="contained">View Order History</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
