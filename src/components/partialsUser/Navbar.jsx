import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Button } from '@mui/material'; // Hapus Badge
import { Menu as MenuIcon, Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material'; // Hapus NotificationsIcon
import { useTheme, useMediaQuery } from '@mui/material';

import PtPalLogo from '../../assets/logo-pt-pal.png' // Pastikan path ini benar

const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return { isMobile };
};

const Navbar = ({ onMenuToggle, user }) => {
  const responsive = useResponsive();

  // Fungsi placeholder untuk logout.
  // Anda perlu mengimplementasikan logika logout yang sebenarnya di sini,
  // misalnya dengan menghapus token sesi, mengarahkan ke halaman login, dll.
  const handleLogout = () => {
    // Contoh: Logika logout (misalnya, menghapus token, mengarahkan ke halaman login)
    console.log("User logged out!");
    // window.location.href = '/login'; // Contoh pengalihan ke halaman login
    alert("Anda telah logout."); // Ganti dengan modal atau snackbar di aplikasi nyata
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      backdropFilter: 'blur(10px)',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      borderRadius: 0, // Menghilangkan border-radius
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

        {/* Logo PT PAL Indonesia - Ukuran disesuaikan dan padding diperkecil */}
        <Box
          component="img"
          src={PtPalLogo}
          alt="PT PAL Indonesia Logo"
          sx={{
            height: { xs: 80, sm: 100 }, // Sesuaikan ukuran logo sesuai preferensi Anda
            width: 'auto', // PENTING: Menjaga rasio aspek logo agar tidak gepeng
            ml: { xs: 0.5, sm: 1 }, // Padding kiri logo
            mr: 2,
            filter: 'brightness(0) invert(1)',
          }}
        />

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {responsive.isMobile ? 'Material Dashboard' : 'Material Distribution Dashboard'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: { xs: 0.5, sm: 1 } }}>
          {/* Menampilkan username yang login */}
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <PersonIcon />
          </Avatar>

          {!responsive.isMobile && (
            <Typography variant="body2" sx={{ ml: 1, color: 'white' }}> {/* Tambahkan color: 'white' agar teks terlihat */}
              {user?.username || 'User'} {/* Menggunakan user.username */}
            </Typography>
          )}

          {/* Tombol Logout */}
          <Button
            color="inherit" // Menggunakan warna inherit agar sesuai dengan AppBar
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
              display: { xs: 'none', sm: 'flex' } // Tampilkan di desktop/tablet, sembunyikan di mobile jika perlu ruang
            }}
          >
            {!responsive.isMobile && "Logout"} {/* Tampilkan teks "Logout" hanya di non-mobile */}
          </Button>

          {/* Jika ingin tombol logout hanya ikon di mobile */}
          {responsive.isMobile && (
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;