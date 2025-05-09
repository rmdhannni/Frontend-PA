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
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BarChartIcon from '@mui/icons-material/BarChart';

const drawerWidth = 260;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openReports, setOpenReports] = useState(false);

  const handleReportsClick = () => {
    setOpenReports(!openReports);
  };

  // Define navigation items
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

  // Define submenu items for reports
  const reportItems = [
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics'
    },
    {
      text: 'Performance',
      icon: <SpeedIcon />,
      path: '/performance'
    },
    {
      text: 'Statistics',
      icon: <BarChartIcon />,
      path: '/statistics'
    }
  ];

  const isCurrentRoute = (path) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: isMobile ? 'space-between' : 'center',
        alignItems: 'center',
        px: [1, 2],
        py: 2,
        minHeight: '64px !important'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ 
              color: 'inherit', 
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
      
      <List component="nav" sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', my: 0.5 }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                px: 2.5,
                py: 1.2,
                borderRadius: 2,
                backgroundColor: isCurrentRoute(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                  color: 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontWeight: isCurrentRoute(item.path) ? 'bold' : 'normal'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding sx={{ display: 'block', my: 0.5 }}>
          <ListItemButton
            onClick={handleReportsClick}
            sx={{
              minHeight: 48,
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: 'inherit'
              }}
            >
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Reports" 
              primaryTypographyProps={{ fontSize: '0.95rem' }} 
            />
            {openReports ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={openReports} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportItems.map((item) => (
                <ListItemButton
                  key={item.text}
                  sx={{
                    pl: 6,
                    py: 1,
                    borderRadius: 2,
                    ml: 2,
                    backgroundColor: isCurrentRoute(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                      color: 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: isCurrentRoute(item.path) ? 'bold' : 'normal'
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </ListItem>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2, mt: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
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
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#1976d2',
              color: 'white',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRight: 0,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;