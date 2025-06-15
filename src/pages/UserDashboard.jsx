import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
  Select, MenuItem, TextField, Chip, Card, CardContent, Grid,
  LinearProgress, Alert, AlertTitle, Skeleton, Fade, Grow, Zoom,
  TablePagination, InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Clear as ClearIcon,
  TrendingUp as TrendingUpIcon, LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon, Schedule as ScheduleIcon,
  MapOutlined as MapIcon, History as HistoryIcon, Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { getCurrentUser } from '../utils/auth';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Layout from '../components/partialsUser/Layout';

const BASE_URL = 'http://localhost:3000';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1976d2',
    },
    h5: {
      fontWeight: 500,
      color: '#1976d2',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const SURABAYA_BOUNDS = L.latLngBounds(
  L.latLng(-7.35, 112.6),
  L.latLng(-7.1, 112.9)
);

const ICONS = {
  user: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  material: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning', icon: <ScheduleIcon fontSize="small" /> },
  diproses: { label: 'Diproses', color: 'info', icon: <TrendingUpIcon fontSize="small" /> },
  terdistribusi: { label: 'Terdistribusi', color: 'primary', icon: <ShippingIcon fontSize="small" /> },
  disetujui: { label: 'Disetujui', color: 'success', icon: <CheckIcon fontSize="small" /> },
  ditolak: { label: 'Ditolak', color: 'error', icon: <CancelIcon fontSize="small" /> }
};

// Fix for Leaflet's default icon path issue with module bundlers
if (typeof window !== 'undefined' && !L.Icon.Default.prototype._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}


const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolokasi');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError('Izin akses lokasi diperlukan');
        setLoading(false);
        console.error('Error geolokasi:', error);
      },
      options
    );
  }, []);
  return { location, error, loading };
};

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <Grow in timeout={500}>
      <Card sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
        border: `1px solid ${color}30`,
        position: 'relative',
        overflow: 'visible'
      }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
              {trend && (
                <Typography variant="caption" color="text.secondary">
                  {trend}
                </Typography>
              )}
            </Box>
            <Box sx={{
              bgcolor: color,
              borderRadius: '50%',
              p: 1.5,
              color: 'white',
              boxShadow: `0 4px 20px ${color}40`
            }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

const MapComponent = React.memo(({ lotData, loading }) => {
  const mapRef = useRef();
  const { location: userLocation, error: locationError } = useGeolocation();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && userLocation) {
        const map = mapRef.current;
        map.setView([userLocation.lat, userLocation.lng], 15);
        map.setMaxBounds(SURABAYA_BOUNDS);
        map.setMinZoom(12);
        map.setMaxZoom(19);
    }
  }, [userLocation]);


  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Clear previous route if it exists
    if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
    }

    if (lotData && userLocation) {
        const routingControl = L.Routing.control({
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'car'
            }),
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(lotData.latitude, lotData.longitude)
            ],
            lineOptions: {
                styles: [{ color: '#1976d2', weight: 6, opacity: 0.8 }]
            },
            show: false,
            addWaypoints: false,
            createMarker: () => null // Prevent default markers
        }).addTo(map);

        routingControlRef.current = routingControl;

        map.fitBounds([
            [userLocation.lat, userLocation.lng],
            [lotData.latitude, lotData.longitude]
        ], { padding: [50, 50] });
    }
  }, [lotData, userLocation]);


  if (locationError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error Lokasi</AlertTitle>
        {locationError}
      </Alert>
    );
  }

  if (!userLocation) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Typography>Mendeteksi lokasi Anda...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ overflow: 'hidden', position: 'relative' }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={ICONS.user}>
          <Popup>
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                📍 Lokasi Anda
              </Typography>
              <Typography variant="caption">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </Typography>
            </Box>
          </Popup>
        </Marker>

        {lotData && (
          <Marker position={[lotData.latitude, lotData.longitude]} icon={ICONS.material}>
            <Popup>
              <Box sx={{ p: 1.5, minWidth: 200 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  🏭 {lotData.Nama_plat}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Lot:</strong> {lotData.Lot_Batch_Number}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Lokasi:</strong> {lotData.Nama_Lokasi}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Kuantitas:</strong> {lotData.Kuantitas?.toLocaleString()} unit
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lotData.latitude.toFixed(6)}, {lotData.longitude.toFixed(6)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Card>
  );
});

MapComponent.displayName = 'MapComponent';

const UserDashboard = () => {
  const [distribusi, setDistribusi] = useState([]);
  const [searchLot, setSearchLot] = useState('');
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for data table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const user = getCurrentUser();
  const userId = user?.id;

  const apiCall = useCallback(async (url, options = {}) => {
    try {
      const response = await axios(url, options);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Terjadi kesalahan'
      };
    }
  }, []);

  const fetchDistribusi = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const result = await apiCall(`${BASE_URL}/api/distribusi/user/${userId}`);

    if (result.success) {
      setDistribusi(result.data.slice().reverse()); // Show newest first
    } else {
      alert(`Gagal memuat data distribusi: ${result.error}`);
    }
    setLoading(false);
  }, [userId, apiCall]);

  const handleSearchLot = useCallback(async () => {
    const trimmedLot = searchLot.trim();
    if (!trimmedLot) {
      alert('Mohon masukkan Lot Batch Number');
      return;
    }

    setLoading(true);
    const encodedLot = encodeURIComponent(trimmedLot);
    const result = await apiCall(`${BASE_URL}/api/plat/lot/${encodedLot}`);

    if (result.success && result.data.success) {
      // ...
   const processedData = {
     ...result.data.data,
     
     latitude: Number(result.data.data.latitude) || 0,
     longitude: Number(result.data.data.longitude) || 0,
     // --- PERBAIKAN DI SINI ---
     
     // Gunakan "Stok" dan pastikan datanya adalah angka yang valid.
     Stok: Number(result.data.data.Stok) || 0 
   };
   setLotData(processedData);
// ...
      setLotData(processedData);
    } else {
      const message = result.data?.message || result.error || 'Material tidak ditemukan';
      alert(message);
      setLotData(null);
    }
    setLoading(false);
  }, [searchLot, apiCall]);

  const countByStatus = useMemo(() => ({
    total: distribusi.length,
    pending: distribusi.filter(d => d.Status === 'pending').length,
    terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length,
    disetujui: distribusi.filter(d => d.Status === 'disetujui').length,
    ditolak: distribusi.filter(d => d.Status === 'ditolak').length
  }), [distribusi]);

  const getStatusChip = useCallback((status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'default', icon: null };
    return (
      <Chip
        label={config.label}
        color={config.color}
        icon={config.icon}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  }, []);

  const filteredDistribusi = useMemo(() => {
    if (!searchTerm) return distribusi;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return distribusi.filter(d => 
        (d.Nama_plat || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (d.Lot_Batch_Number || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (d.Nama_Lokasi || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (d.Status || '').toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [distribusi, searchTerm]);

  const currentPageData = useMemo(() => {
    return filteredDistribusi.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredDistribusi, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearSearch = () => setSearchTerm('');

  useEffect(() => {
    fetchDistribusi();
  }, [fetchDistribusi]);

  const renderContent = () => {
    switch (activeTab) {
      case 'tracking':
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapIcon color="primary" />
                Pelacakan Material
              </Typography>

              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    label="Cari Lot Batch Number"
                    variant="outlined"
                    value={searchLot}
                    onChange={(e) => setSearchLot(e.target.value)}
                    disabled={loading}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearchLot}
                    sx={{ minWidth: 150, height: 56 }}
                    disabled={loading}
                    startIcon={<SearchIcon />}
                  >
                    {loading ? 'Mencari...' : 'Cari'}
                  </Button>
                </Box>

                <MapComponent lotData={lotData} loading={loading} />
              </Card>
            </Box>
          </Fade>
        );
      case 'history':
        return (
          <Fade in timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" />
                  Data Tabel Distribusi
                </Typography>
                 <TextField
                  variant="outlined"
                  placeholder="Cari data distribusi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{minWidth: '300px'}}
                  InputProps={{
                    startAdornment: ( <InputAdornment position="start"> <SearchIcon color="action" /> </InputAdornment> ),
                    endAdornment: searchTerm && ( <InputAdornment position="end"> <Tooltip title="Hapus pencarian" arrow> <IconButton size="small" onClick={handleClearSearch} > <ClearIcon fontSize="small" /> </IconButton> </Tooltip> </InputAdornment> ),
                  }}
                 />
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{
                      '& th': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                      }
                    }}>
                      <TableCell align="center" sx={{width: '5%'}}>No.</TableCell>
                      {['Material', 'Lot Batch Number', 'Tujuan', 'Jumlah', 'Tanggal Permintaan', 'Status'].map((header) => (
                        <TableCell key={header}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPageData.map((dist, index) => (
                      <Fade in timeout={300 + index * 100} key={dist.ID_Distribusi}>
                        <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.05)' } }}>
                          <TableCell align="center" sx={{ fontWeight: 500 }}>{(page * rowsPerPage) + index + 1}</TableCell>
                          <TableCell>{dist.Nama_plat}</TableCell>
                          <TableCell>{dist.Lot_Batch_Number}</TableCell>
                          <TableCell>{dist.Nama_Lokasi}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{dist.Jumlah?.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(dist.Tanggal_permintaan).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}
                          </TableCell>
                          <TableCell>{getStatusChip(dist.Status)}</TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                    {filteredDistribusi.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Memuat data...' : 'Tidak ada data distribusi yang ditemukan.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
               <TablePagination 
                  rowsPerPageOptions={[5, 10, 25, 50]} 
                  component="div" 
                  count={filteredDistribusi.length} 
                  rowsPerPage={rowsPerPage} 
                  page={page} 
                  onPageChange={handleChangePage} 
                  onRowsPerPageChange={handleChangeRowsPerPage} 
                  labelRowsPerPage="Data per halaman:" 
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`} 
                />
            </Box>
          </Fade>
        );
      default: // dashboard
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon color="primary" />
                Dashboard Overview
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Distribusi"
                    value={countByStatus.total}
                    icon={<TrendingUpIcon />}
                    color="#1976d2"
                    trend="+12% dari bulan lalu"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Pending"
                    value={countByStatus.pending}
                    icon={<ScheduleIcon />}
                    color="#ff9800"
                    trend="Memerlukan tindakan"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Terdistribusi"
                    value={countByStatus.terdistribusi}
                    icon={<ShippingIcon />}
                    color="#2196f3"
                    trend="Dalam pengiriman"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Disetujui"
                    value={countByStatus.disetujui}
                    icon={<CheckIcon />}
                    color="#4caf50"
                    trend="Selesai"
                  />
                </Grid>
              </Grid>

              <Card sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Aksi Cepat
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MapIcon />}
                      onClick={() => setActiveTab('tracking')}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Lacak Material
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => setActiveTab('history')}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Lihat Data Tabel
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Aktivitas Terbaru
                </Typography>
                {distribusi.slice(0, 5).map((dist, index) => (
                  <Zoom in timeout={300 + index * 100} key={dist.ID_Distribusi}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        px: 2,
                        mb: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                        border: '1px solid rgba(25, 118, 210, 0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {dist.Nama_plat}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lot: {dist.Lot_Batch_Number} • {dist.Nama_Lokasi} • {new Date(dist.Tanggal_permintaan).toLocaleDateString('id-ID')}
                        </Typography>
                      </Box>
                      {getStatusChip(dist.Status)}
                    </Box>
                  </Zoom>
                ))}
                {distribusi.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      Belum ada aktivitas distribusi
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>
          </Fade>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}

        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 9999,
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2, width: 200 }} />
              <Typography>Memproses...</Typography>
            </Paper>
          </Box>
        )}
      </Layout>
    </ThemeProvider>
  );
};

export default UserDashboard;
