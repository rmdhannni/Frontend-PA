import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    username: '', 
    password: '' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AuthService.register(formData);
      alert('Register berhasil');
      navigate('/login');
    } catch (err) {
      alert('Register gagal');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card sx={{ width: '100%', backgroundColor: '#e3f2fd', boxShadow: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" textAlign="center" gutterBottom>
              Register
            </Typography>

            <TextField
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign up
            </Button>

            <Typography textAlign="center">
              Already have an account? <Link href="/login">Sign in</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;