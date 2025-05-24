import React, { useState } from 'react';
import { Box, Container, Fab, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Import komponen-komponen partial
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

// Pastikan path ke auth utility ini benar
import { getCurrentUser } from '../../utils/auth';

const Layout = ({ activeTab, setActiveTab, onAddButtonClick, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getCurrentUser(); // Mendapatkan data user yang sedang login

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user} // Meneruskan prop user ke Sidebar
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Memungkinkan area konten utama untuk mengisi ruang yang tersedia
          p: 3, // Padding di sekitar konten utama
          // Menyesuaikan margin-top agar konten tidak tertutup Navbar yang lebih tinggi
          // Nilai ini harus cocok atau sedikit lebih besar dari height Navbar
          mt: { xs: '80px', sm: '100px' }, // Contoh: Sesuaikan dengan tinggi Navbar baru (xs: mobile, sm: desktop)
          width: { xs: '100%', md: 'calc(100% - 250px)' }, // Mengatur lebar konten utama (dikurangi lebar sidebar di desktop)
          ml: { xs: 0, md: '250px' }, // Mengatur margin-left agar konten bergeser jika sidebar permanen
          transition: 'margin 0.3s ease-in-out', // Animasi halus saat sidebar buka/tutup
        }}
      >
        <Container maxWidth="xl" sx={{ mb: 4 }}> {/* Memberikan lebar maksimum dan margin bawah sebelum footer */}
          {children} {/* Ini adalah konten dinamis dari halaman (misal: Dashboard, Tracking, History) */}
        </Container>
      </Box>

      {/* Floating Action Button (hanya terlihat di mobile untuk permintaan baru) */}
      <Tooltip title="Permintaan Baru">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', md: 'none' }, // Hanya tampil di layar kecil
            zIndex: (theme) => theme.zIndex.speedDial, // Memastikan FAB di atas elemen lain
          }}
          onClick={onAddButtonClick}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Layout;