import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Button } from '@mui/material';
import { Menu as MenuIcon, Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

import PtPalLogo from '../../assets/logo-pt-pal.png' // Pastikan path ini benar

const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return { isMobile };
};

const Navbar = ({ onMenuToggle, user, onLogout }) => {
  const responsive = useResponsive();

  // Fungsi logout yang sudah diperbaiki
  const handleLogout = () => {
    try {
      // 1. Hapus token dari localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 2. Hapus token dari sessionStorage (jika ada)
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // 3. Clear any cookies (jika menggunakan cookies untuk auth)
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 4. Panggil callback onLogout dari parent component
      if (onLogout && typeof onLogout === 'function') {
        onLogout();
      }
      
      // 5. Redirect ke halaman login
      // Gunakan window.location.replace untuk mencegah user kembali dengan tombol back
      window.location.replace('/login');
      
      console.log("User berhasil logout!");
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Tetap redirect ke login meskipun ada error
      window.location.replace('/login');
    }
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      backdropFilter: 'blur(10px)',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      borderRadius: 0,
    }}>
      <Toolbar disableGutters>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ ml: { xs: 0.5, sm: 1 }, mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo PT PAL Indonesia */}
        <Box
          component="img"
          src={PtPalLogo}
          alt="PT PAL Indonesia Logo"
          sx={{
            height: { xs: 80, sm: 100 },
            width: 'auto',
            ml: { xs: 0.5, sm: 1 },
            mr: 2,
            filter: 'brightness(0) invert(1)',
          }}
        />

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {responsive.isMobile ? 'Material Dashboard' : 'Material Distribution Dashboard'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: { xs: 0.5, sm: 1 } }}>
          {/* Avatar User */}
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <PersonIcon />
          </Avatar>

          {/* Username - hanya tampil di desktop */}
          {!responsive.isMobile && (
            <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>
              {user?.username || 'User'}
            </Typography>
          )}

          {/* Tombol Logout - Desktop/Tablet */}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
              display: { xs: 'none', sm: 'flex' },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Logout
          </Button>

          {/* Tombol Logout - Mobile (hanya ikon) */}
          {responsive.isMobile && (
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;