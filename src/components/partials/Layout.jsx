import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const drawerWidth = 260;

const Layout = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <Navbar title={title} onMenuClick={handleDrawerToggle} />
      
      {/* Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mt: '64px', // Height of navbar
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)', // Ensures content takes full height minus navbar
          bgcolor: '#f5f5f5'
        }}
      >
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {children}
        </Box>
        
        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;