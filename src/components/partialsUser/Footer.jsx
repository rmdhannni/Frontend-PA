import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        p: 3,
        mt: 'auto', // Pushes the footer to the bottom
        bgcolor: 'primary.dark',
        color: 'white',
        textAlign: 'center',
        // Menghilangkan border-radius agar konsisten dengan Navbar
        borderRadius: 0, // <--- Tambahkan properti ini
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Material Distribution. All rights reserved.
      </Typography>
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        Developed by <Link href="#" color="inherit" underline="hover">Your Team Name</Link>
      </Typography>
    </Box>
  );
};

export default Footer;