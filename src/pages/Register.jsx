import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  CardContent,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Password tidak cocok');
      return;
    }

    try {
      await AuthService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      alert('Register berhasil');
      navigate('/login');
    } catch (err) {
      alert('Register gagal');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });

    // Reset error when typing
    if (passwordError && formData.confirmPassword === newPassword) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setFormData({ ...formData, confirmPassword: confirmPassword });

    if (formData.password !== confirmPassword) {
      setPasswordError('Password tidak cocok');
    } else {
      setPasswordError('');
    }
  };

  // Password strength criteria
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

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
              <PersonAddOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" color="white" fontWeight="bold">
              Buat Akun Baru
            </Typography>
            <Typography variant="body2" color="white" textAlign="center">
              Lengkapi data diri Anda untuk mendaftar
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
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
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

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Konfirmasi Password"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                variant="outlined"
              />

              {formData.password && (
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Kekuatan Password:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color={hasLowerCase ? "success" : "disabled"}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color={hasLowerCase ? "textPrimary" : "textSecondary"}>
                        Minimal 1 huruf kecil
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color={hasUpperCase ? "success" : "disabled"}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color={hasUpperCase ? "textPrimary" : "textSecondary"}>
                        Minimal 1 huruf besar
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color={hasNumber ? "success" : "disabled"}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color={hasNumber ? "textPrimary" : "textSecondary"}>
                        Minimal 1 angka
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color={hasMinLength ? "success" : "disabled"}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color={hasMinLength ? "textPrimary" : "textSecondary"}>
                        Minimal 8 karakter
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

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
                Daftar Sekarang
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2">
                  Sudah memiliki akun?{' '}
                  <Link href="/login" variant="body2" fontWeight="bold" color="primary.main">
                    Masuk
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

export default Register;