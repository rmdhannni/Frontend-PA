import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky', // Membuat footer tetap di posisi bawah
        bottom: 0, // Menempel di bagian bawah viewport
        p: 3,
        bgcolor: 'primary.dark',
        color: 'white',
        textAlign: 'center',
        borderRadius: 0,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.appBar - 1, // Memastikan footer di bawah navbar tapi di atas konten
        width: '100%', // Memastikan footer memenuhi lebar layar
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Material Distribution. All rights reserved.
      </Typography>
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        Developed by <Link href="#" color="inherit" underline="hover">YUSUF RAHMADHANI ASY'ARI PENS 22</Link>
      </Typography>
    </Box>
  );
};

export default Footer;