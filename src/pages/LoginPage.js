import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, FormHelperText } from '@mui/material';
import { UserContext } from '../context/UserContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const username = email.split('@')[0];
        // IMPORTANT: Replace this with your actual backend URL
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, {
          email,
          username,
        });
        login(response.data); // Assuming the response contains the user object
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormHelperText sx={{ ml: 1 }}>
            Try: raise2025@gmail.com or raisehackathon@gmail.com
          </FormHelperText>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Enter
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
