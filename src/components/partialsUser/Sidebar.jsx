import React from 'react';
import { Drawer, Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Dashboard as DashboardIcon, LocationOn as LocationIcon, History as HistoryIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return { isMobile };
};

// Terima prop 'user' di sini
const Sidebar = ({ open, onClose, activeTab, setActiveTab, user }) => {
  const responsive = useResponsive();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tracking', label: 'Pelacakan', icon: <LocationIcon /> },
    { id: 'history', label: 'Riwayat', icon: <HistoryIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      {/* Mengganti "DISTRIBU.ME" dengan "Hi, [username]" */}
      <Box sx={{ p: 2, textAlign: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Hi, {user?.username || 'User'} {/* Menggunakan username dari prop user */}
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (responsive.isMobile) {
                onClose();
              }
            }}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              backgroundColor: activeTab === item.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ color: activeTab === item.id ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  color: activeTab === item.id ? 'primary.main' : 'text.primary',
                  fontWeight: activeTab === item.id ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={responsive.isMobile ? 'temporary' : 'permanent'}
      open={responsive.isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: responsive.isMobile ? 0 : 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          mt: { xs: '80px', sm: '100px' }, // Sesuaikan dengan tinggi Navbar baru
          borderRight: '1px solid rgba(25, 118, 210, 0.1)',
          backgroundColor: '#fafafa',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;