import React, { useState } from 'react';
import {
  Container,
  TextField,
  Checkbox,
  Button,
  Typography,
  Link,
  Box,
  // Card, // Not used, can be removed
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
// import GoogleIcon from '@mui/icons-material/Google'; // Removed
// import FacebookIcon from '@mui/icons-material/Facebook'; // Removed
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Keep if jwtDecode is used elsewhere, otherwise remove

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Keep if used for responsive adjustments

  // Function to handle form submission (login)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const user = await AuthService.login(formData.email, formData.password);
      console.log('LOGIN USER:', user);
  
      // Removed the success message box
      // const messageBox = document.createElement('div');
      // messageBox.style.cssText = `
      //   position: fixed;
      //   top: 20px; /* Changed from 50% to 20px */
      //   left: 50%;
      //   transform: translateX(-50%); /* Changed from translate(-50%, -50%) */
      //   background-color: #4CAF50;
      //   color: white;
      //   padding: 15px 30px;
      //   border-radius: 8px;
      //   box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      //   z-index: 1000;
      //   text-align: center;
      // `;
      // messageBox.innerHTML = `Login berhasil sebagai ${user.username} (${user.role})`;
      // document.body.appendChild(messageBox);

      // setTimeout(() => {
      //   document.body.removeChild(messageBox);
      // }, 3000); // Remove message after 3 seconds

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'user') {
        navigate('/user');
      } else {
        // Using a custom message box for invalid role
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
          position: fixed;
          top: 20px; /* Changed from 50% to 20px */
          left: 50%;
          transform: translateX(-50%); /* Changed from translate(-50%, -50%) */
          background-color: #f44336;
          color: white;
          padding: 15px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          z-index: 1000;
          text-align: center;
        `;
        errorMessage.innerHTML = 'Role tidak valid';
        document.body.appendChild(errorMessage);
        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 3000);
      }
    } catch (error) {
      console.error('Login gagal:', error);
      // Using a custom message box for login failure
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px; /* Changed from 50% to 20px */
        left: 50%;
        transform: translateX(-50%); /* Changed from translate(-50%, -50%) */
        background-color: #f44336;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        text-align: center;
      `;
      errorMessage.innerHTML = 'Login gagal. Periksa email dan password.';
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };

  // Function to toggle password visibility
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
          minHeight: '100vh', // Center content vertically on the page
        }}
      >
        <Paper 
          elevation={6} // Add shadow to the card
          sx={{
            width: '100%',
            borderRadius: 4, // Rounded corners for the paper
            overflow: 'hidden', // Ensures content respects border radius
          }}
        >
          {/* Header section with app name and icon */}
          <Box
            sx={{
              bgcolor: 'primary.main', // Primary color background
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

          {/* Login form content */}
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {/* Email Input */}
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
              {/* Password Input */}
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
              
              {/* Remember Me and Forgot Password links */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {/* <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Ingat saya"
                /> */}
                {/* <Link href="#" variant="body2" color="primary.main" fontWeight="500">
                  Lupa password?
                </Link> */}
              </Box>
              
              {/* Login Button */}
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

              {/* Link to Register page */}
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
