import React, { useState } from 'react';
import { Box, Container, Fab, Tooltip, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Import komponen-komponen partial
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

// Pastikan path ke auth utility ini benar
import { getCurrentUser } from '../../utils/auth';

const Layout = ({ activeTab, setActiveTab, onAddButtonClick, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getCurrentUser();
  const theme = useTheme();

  // Konstanta untuk ukuran sidebar dan footer
  const sidebarWidth = 260;
  const footerHeight = 64;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'background.default', 
        minHeight: '100vh'
      }}
    >
      {/* Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      {/* Area Konten Utama */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: '80px', sm: '100px' },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: 'margin 0.3s ease-in-out',
          pb: `${footerHeight + theme.spacing(3)}px`,
        }}
      >
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          {children}
        </Container>
      </Box>

      {/* Floating Action Button */}
      <Tooltip title="Permintaan Baru">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: footerHeight + 24, // Posisi di atas footer
            right: 24,
            display: { xs: 'flex', md: 'none' },
            zIndex: (theme) => theme.zIndex.speedDial,
          }}
          onClick={onAddButtonClick}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Footer - Diperbaiki agar tidak terpotong sidebar */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, md: `${sidebarWidth}px` }, // Menyesuaikan dengan sidebar
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` }, // Lebar disesuaikan dengan sidebar
          height: footerHeight,
          zIndex: theme.zIndex.appBar,
          backgroundColor: 'background.paper',
          boxShadow: '0 -4px 12px 0 rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out', // Animasi halus
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;