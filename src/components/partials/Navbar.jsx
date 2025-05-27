import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  // Button, // Not used, can be removed
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
// import NotificationsIcon from '@mui/icons-material/Notifications'; // Removed
// import SettingsIcon from '@mui/icons-material/Settings'; // Removed
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Navbar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Function to open the profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close the profile menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    navigate('/login'); // Redirect to login page
  };

  // Function to toggle dark mode (visual only, no actual theme implementation)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would implement actual theme switching functionality
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar is above the Drawer
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', // Subtle shadow for depth
        backgroundColor: darkMode ? '#333' : '#fff', // Dynamic background based on dark mode
        color: darkMode ? '#fff' : '#333', // Dynamic text color based on dark mode
      }}
    >
      <Toolbar>
        {isMobile && (
          // Menu icon for mobile view to open the sidebar
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
        
        {/* Title of the current page/dashboard */}
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
        
        {/* Right-aligned icons and profile menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Dark/Light Mode Toggle */}
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{ mx: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* Removed Notifications Icon */}
          {/* Removed Settings Icon */}
          
          {/* Profile Avatar and Menu Trigger */}
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
                  bgcolor: 'primary.main' // Use primary theme color for avatar background
                }}
              >
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      
      {/* Profile Menu */}
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
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))', // Shadow for menu
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)', // Arrow pointing to the avatar
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info in the Menu */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Admin User</Typography>
          <Typography variant="body2" color="text.secondary">admin@example.com</Typography>
        </Box>
        <Divider /> {/* Divider after user info */}
        
        {/* Profile Link */}
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        {/* Removed Settings Link */}
        {/* <MenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
          Settings
        </MenuItem> */}
        <Divider /> {/* Divider before logout */}
        
        {/* Logout Button */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
