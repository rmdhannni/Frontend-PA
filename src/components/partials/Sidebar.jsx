import React, { useState } from 'react';
import { 
  Drawer, 
  Box,
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 260; // Define the width of the sidebar drawer

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location for active tab highlighting
  const theme = useTheme(); // Access the Material-UI theme
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Check if current screen size is mobile (less than 'md' breakpoint)

  // Define navigation items for the sidebar
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin'
    },
    {
      text: 'Plat Data',
      icon: <SettingsIcon />,
      path: '/plat'
    },
    {
      text: 'Lokasi',
      icon: <LocationOnIcon />,
      path: '/lokasi'
    },
    {
      text: 'Distribusi',
      icon: <LocalShippingIcon />,
      path: '/distribusi'
    }
  ];

  // Helper function to check if the current route matches the item's path
  const isCurrentRoute = (path) => {
    return location.pathname === path;
  };

  // Content to be rendered inside the drawer (sidebar)
  const drawerContent = (
    <>
      {/* Toolbar section at the top of the sidebar */}
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: isMobile ? 'space-between' : 'center', // Adjust alignment based on mobile/desktop
        alignItems: 'center',
        px: [1, 2], // Horizontal padding
        py: 2, // Vertical padding
        minHeight: '64px !important' // Ensure minimum height
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ 
              color: 'inherit', 
              textAlign: 'center',
              overflow: 'hidden', // Hide overflowing text
              textOverflow: 'ellipsis', // Add ellipsis for overflowing text
              whiteSpace: 'nowrap' // Prevent text from wrapping
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        {isMobile && (
          // Close button for mobile sidebar
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} /> {/* Divider below the header */}
      
      {/* List of navigation items */}
      <List component="nav" sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', my: 0.5 }}>
            <ListItemButton
              sx={{
                minHeight: 48, // Minimum height for list item button
                px: 2.5, // Horizontal padding
                py: 1.2, // Vertical padding
                borderRadius: 2, // Rounded corners
                // Highlight background if it's the current route
                backgroundColor: isCurrentRoute(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Hover effect
                },
              }}
              onClick={() => navigate(item.path)} // Navigate to the path on click
            >
              <ListItemIcon
                sx={{
                  minWidth: 0, // Remove minimum width for icon
                  mr: 2, // Right margin for icon
                  justifyContent: 'center',
                  color: 'inherit' // Inherit color from parent
                }}
              >
                {item.icon} {/* Display the icon */}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} // Display the text
                primaryTypographyProps={{ 
                  fontSize: '0.95rem', // Font size for text
                  fontWeight: isCurrentRoute(item.path) ? 'bold' : 'normal' // Bold text if active
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push content to the bottom */}
      
      {/* System Version information at the bottom of the sidebar */}
      <Box sx={{ p: 2, mt: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.1)', // Background color
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
            System Version
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            v1.2.0
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {isMobile ? (
        // Temporary Drawer for mobile screens
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' }, // Display only on extra-small to medium screens
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, // Set drawer width
              backgroundColor: '#1976d2', // Background color
              color: 'white', // Text color
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Permanent Drawer for desktop screens
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth, // Set drawer width
            flexShrink: 0, // Prevent drawer from shrinking
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRight: 0, // Remove right border
            },
          }}
          open // Always open for permanent drawer
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
