import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Container, 
  Alert, 
  CircularProgress,
  Divider,
  Paper,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import Layout from '../components/partials/Layout';

// Mock data - replace with actual API calls in production
const mockStats = {
  totalMaterial: 1024,
  materialPending: 345,
  materialDistribusi: 45,
  materialDisetujui: 89,
  materialDitolak: 12,
  activeUsers: 78
};

const mockActivity = [
  { id: 1, action: 'Permintaan distribusi baru (ID: #3245)', actor: 'Budi Santoso', time: '5 menit yang lalu', status: 'pending' },
  { id: 2, action: 'Distribusi disetujui (ID: #3240)', actor: 'Admin Pusat', time: '15 menit yang lalu', status: 'disetujui' },
  { id: 3, action: 'Distribusi ditolak (ID: #3238)', actor: 'Admin Pusat', time: '30 menit yang lalu', status: 'ditolak' },
  { id: 4, action: 'Material baru ditambahkan', actor: 'Dian Permata', time: '1 jam yang lalu', status: 'info' },
  { id: 5, action: 'User baru terdaftar', actor: 'Ahmad Rizki', time: '2 jam yang lalu', status: 'info' }
];

function AdminDashboardContent() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState({
    online: navigator.onLine,
    slow: false
  });

  // Simulate data loading
  useEffect(() => {
    const startTime = performance.now();
    
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Set mock data (replace with actual API calls)
        setStats(mockStats);
        setRecentActivity(mockActivity);
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard. Silakan coba lagi.');
      } finally {
        setLoading(false);
        
        const loadTime = performance.now() - startTime;
        if (loadTime > 3000) {
          setConnectionStatus(prev => ({ ...prev, slow: true }));
        }
      }
    };
    
    fetchData();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setConnectionStatus(prev => ({ ...prev, online: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handler for refresh button
  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate refresh with timeout
    setTimeout(() => {
      setStats(mockStats);
      setRecentActivity(mockActivity);
      setLoading(false);
    }, 1000);
  };

  // Render status icon for activity items
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'disetujui':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'ditolak':
        return <CancelIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  // Render stats card
  const renderStatCard = (title, value, icon, color, bgColor) => (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <Card 
        elevation={1}
        sx={{ 
          backgroundColor: bgColor,
          borderRadius: '12px',
          transition: 'transform 0.2s',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, my: 1 }}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  // If loading, display loading state
  if (loading) {
    return (
      <Container maxWidth="xl" disableGutters>
        <Box mb={3}>
          <Box display="flex" alignItems="center" mb={1}>
            <DashboardIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Dashboard / Overview
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Dashboard Admin
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              {connectionStatus.slow 
                ? "Koneksi lambat terdeteksi. Sedang memuat data..." 
                : "Memuat data dashboard..."}
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header with Breadcrumb */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <DashboardIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Dashboard / Overview
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold" color="primary">
            Dashboard Admin
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Connection Status */}
      {!connectionStatus.online && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
          Anda sedang offline. Beberapa fitur mungkin tidak berfungsi dengan baik.
        </Alert>
      )}
      
      {connectionStatus.online && connectionStatus.slow && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
          Koneksi lambat terdeteksi. Data mungkin membutuhkan waktu lebih lama untuk dimuat.
        </Alert>
      )}

      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Card elevation={0} sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: 'background.default' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
          Ringkasan Status
        </Typography>
        <Grid container spacing={2}>
          {renderStatCard('Total Material', stats?.totalMaterial || 0, 
            <InventoryIcon sx={{ color: theme.palette.primary.main }} />, 
            theme.palette.text.primary, '#f5f5f5')}
          
          {renderStatCard('Pending', stats?.materialPending || 0, 
            <WarningIcon sx={{ color: '#ed6c02' }} />, 
            '#ed6c02', '#fff9c4')}
          
          {renderStatCard('Distribusi', stats?.materialDistribusi || 0, 
            <LocalShippingIcon sx={{ color: '#0288d1' }} />, 
            '#0288d1', '#bbdefb')}
          
          {renderStatCard('Disetujui', stats?.materialDisetujui || 0, 
            <CheckCircleIcon sx={{ color: '#2e7d32' }} />, 
            '#2e7d32', '#c8e6c9')}
          
          {renderStatCard('Ditolak', stats?.materialDitolak || 0, 
            <CancelIcon sx={{ color: '#d32f2f' }} />, 
            '#d32f2f', '#ffcdd2')}
          
          {renderStatCard('Pengguna Aktif', stats?.activeUsers || 0, 
            <PeopleIcon sx={{ color: '#9c27b0' }} />, 
            '#9c27b0', '#e1bee7')}
        </Grid>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '12px', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} fontSize="small" color="primary" />
                Aktivitas Terbaru
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recentActivity.length > 0 ? (
                <List disablePadding>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem 
                        sx={{ 
                          py: 1.5,
                          px: 2,
                          '&:hover': { 
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            borderRadius: '8px'
                          }
                        }}
                      >
                        <Box sx={{ mr: 1 }}>
                          {renderStatusIcon(activity.status)}
                        </Box>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              {activity.action}
                            </Typography>
                          } 
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary" component="span">
                                Oleh: {activity.actor} • {activity.time}
                              </Typography>
                            </>
                          } 
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="textSecondary">
                    Tidak ada aktivitas terbaru
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} fontSize="small" color="primary" />
                Pengguna Aktif
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* User Activity Chart Placeholder */}
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'background.default', 
                  height: 200, 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Grafik Aktivitas Pengguna
                </Typography>
              </Paper>
              
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Distribusi Pengguna
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1, borderRadius: '8px', bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="textSecondary">Admin</Typography>
                      <Typography variant="body1" fontWeight="bold">12</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1, borderRadius: '8px', bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="textSecondary">Staff</Typography>
                      <Typography variant="body1" fontWeight="bold">66</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

// Wrap the content with Layout component
export default function AdminDashboard() {
  return (
    <Layout title="Dashboard Admin">
      <AdminDashboardContent />
    </Layout>
  );
}