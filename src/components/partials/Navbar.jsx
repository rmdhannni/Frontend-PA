import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Navbar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would implement actual theme switching functionality
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        backgroundColor: darkMode ? '#333' : '#fff',
        color: darkMode ? '#fff' : '#333',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {title || 'Dashboard'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{ mx: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: 'primary.main'
                }}
              >
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 200,
            mt: 1.5,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Admin User</Typography>
          <Typography variant="body2" color="text.secondary">admin@example.com</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;