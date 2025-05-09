import React, { useState } from 'react';
import {
  Container,
  TextField,
  Checkbox,
  Button,
  Typography,
  Link,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const user = await AuthService.login(formData.email, formData.password);
      console.log('LOGIN USER:', user);
  
      alert(`Login berhasil sebagai ${user.username} (${user.role})`);
  
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'user') {
        navigate('/user');
      } else {
        alert('Role tidak valid');
      }
    } catch (error) {
      console.error('Login gagal:', error);
      alert('Login gagal. Periksa email dan password.');
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
              Sign In
            </Typography>

            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Checkbox />
                <Typography variant="body2">Remember me</Typography>
              </Box>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign in
            </Button>

            <Typography textAlign="center">
              Not a member? <Link href="/register">Register</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;