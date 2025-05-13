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
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  FormControlLabel,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper 
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" color="white" fontWeight="bold">
              Selamat Datang
            </Typography>
            <Typography variant="body2" color="white" textAlign="center">
              Masuk ke akun Anda untuk melanjutkan
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                id="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Ingat saya"
                />
                <Link href="#" variant="body2" color="primary.main" fontWeight="500">
                  Lupa password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Masuk
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Atau masuk dengan
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    flex: 1,
                    textTransform: 'none'
                  }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    flex: 1,
                    textTransform: 'none'
                  }}
                >
                  Facebook
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2">
                  Belum punya akun?{' '}
                  <Link href="/register" variant="body2" fontWeight="bold" color="primary.main">
                    Daftar Sekarang
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;