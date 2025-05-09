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
        backgroundColor: '#000',
        color: 'white',
        mt: 'auto', // Push the footer to the bottom when content doesn't fill page
        pt: 2,
        pb: 2,
        zIndex: (theme) => theme.zIndex.drawer - 1, // Ensure footer stays below drawer
        position: 'relative', // Changed from fixed to relative
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent={isMobile ? 'center' : 'space-between'} alignItems="center">
          <Grid item xs={12} sm={6} textAlign={isMobile ? 'center' : 'left'}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, color: 'rgba(255,255,255,0.6)' }}>
              Powerful admin interface for data management
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} textAlign={isMobile ? 'center' : 'right'}>
            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', mb: 2 }}>
              <Link href="#" color="inherit" sx={{ mx: 1 }}>
                <GitHubIcon sx={{ fontSize: 24 }} />
              </Link>
              <Link href="#" color="inherit" sx={{ mx: 1 }}>
                <LinkedInIcon sx={{ fontSize: 24 }} />
              </Link>
              <Link href="#" color="inherit" sx={{ mx: 1 }}>
                <TwitterIcon sx={{ fontSize: 24 }} />
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6} textAlign={isMobile ? 'center' : 'left'}>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              © {currentYear} Admin Dashboard. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} textAlign={isMobile ? 'center' : 'right'}>
            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', flexWrap: 'wrap' }}>
              <Link href="#" color="inherit" underline="hover" sx={{ mx: 1, color: 'rgba(255,255,255,0.6)' }}>
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ mx: 1, color: 'rgba(255,255,255,0.6)' }}>
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ mx: 1, color: 'rgba(255,255,255,0.6)' }}>
                <Typography variant="body2">Contact Us</Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;