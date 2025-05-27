import React from 'react';
import { Box, Typography, Container, Link, Divider, Grid, useTheme, useMediaQuery } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        height: '100%', // Menggunakan tinggi penuh dari container
        backgroundColor: '#000',
        color: 'white',
        display: 'flex',
        alignItems: 'center', // Pusatkan konten secara vertikal
        py: 1, // Padding vertikal yang lebih kecil
        px: 2, // Padding horizontal
      }}
    >
      <Container maxWidth="lg" sx={{ py: 0 }}>
        {isMobile ? (
          // Layout mobile yang lebih kompak
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 1 }}>
              © {currentYear} Yusuf Rahmadhani A PENS
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                <GitHubIcon sx={{ fontSize: 18 }} />
              </Link>
              <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                <LinkedInIcon sx={{ fontSize: 18 }} />
              </Link>
              <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                <TwitterIcon sx={{ fontSize: 18 }} />
              </Link>
            </Box>
          </Box>
        ) : (
          // Layout desktop
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                © {currentYear} Yusuf Rahmadhani A PENS. All rights reserved.
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                    <GitHubIcon sx={{ fontSize: 20 }} />
                  </Link>
                  <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                    <LinkedInIcon sx={{ fontSize: 20 }} />
                  </Link>
                  <Link href="#" color="inherit" sx={{ display: 'flex' }}>
                    <TwitterIcon sx={{ fontSize: 20 }} />
                  </Link>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Link href="#" color="inherit" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Typography variant="caption">Privacy</Typography>
                  </Link>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>•</Typography>
                  <Link href="#" color="inherit" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Typography variant="caption">Terms</Typography>
                  </Link>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>•</Typography>
                  <Link href="#" color="inherit" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Typography variant="caption">Contact</Typography>
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Footer;