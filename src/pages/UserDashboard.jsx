import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  Select, MenuItem, TextField, Chip, Card, CardContent, Grid,
  LinearProgress, Alert, AlertTitle, Skeleton, Tooltip, Fade, Grow, Zoom
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon,
  TrendingUp as TrendingUpIcon, LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon, Schedule as ScheduleIcon,
  MapOutlined as MapIcon, History as HistoryIcon, Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { getCurrentUser } from '../utils/auth';
import { createTheme, ThemeProvider, useTheme, useMediaQuery } from '@mui/material/styles';

// Import Layout component
import Layout from '../components/partialsUser/Layout';

const BASE_URL = 'http://localhost:3000';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Main blue
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

// Constants for optimization
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

// Fix Leaflet marker icons
if (!L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
}

// Hook for geolocation
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

// StatCard Component
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

// MapComponent
const MapComponent = React.memo(({ lotData, loading }) => {
  const mapRef = useRef();
  const { location: userLocation, error: locationError } = useGeolocation();

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;
    map.setView([userLocation.lat, userLocation.lng], 15);
    map.setMaxBounds(SURABAYA_BOUNDS);
    map.setMinZoom(12);
    map.setMaxZoom(19);
  }, [userLocation]);

  // ✨ useEffect untuk menggambar rute telah diperbaiki di sini ✨
  useEffect(() => {
    // Jika tidak ada data lokasi material atau lokasi user, jangan lakukan apa-apa
    if (!lotData || !userLocation || !mapRef.current) return;

    // Dapatkan instance map dari ref
    const map = mapRef.current;

    // Buat kontrol routing baru
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
      addWaypoints: false
    }).addTo(map);

    // Sesuaikan view peta agar kedua titik terlihat
    map.fitBounds([
      [userLocation.lat, userLocation.lng],
      [lotData.latitude, lotData.longitude]
    ]);

    // Kembalikan fungsi cleanup.
    // Fungsi ini akan otomatis dijalankan oleh React sebelum useEffect berjalan lagi
    // (misalnya saat lotData berubah) atau saat komponen di-unmount.
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [lotData, userLocation]); // Efek ini bergantung pada lotData dan userLocation

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

// Main Dashboard Component
const UserDashboard = () => {
  const [distribusi, setDistribusi] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' });
  const [platOptions, setPlatOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [searchLot, setSearchLot] = useState('');
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const user = getCurrentUser();
  const userId = user?.id;

  // API calls with better error handling
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
      setDistribusi(result.data);
    } else {
      alert(`Gagal memuat data distribusi: ${result.error}`);
    }
    setLoading(false);
  }, [userId, apiCall]);

  const fetchOptions = useCallback(async () => {
    const [platResult, lokasiResult] = await Promise.all([
      apiCall(`${BASE_URL}/api/plat`),
      apiCall(`${BASE_URL}/api/lokasi`)
    ]);

    if (platResult.success) setPlatOptions(platResult.data);
    if (lokasiResult.success) setLokasiOptions(lokasiResult.data);

    if (!platResult.success || !lokasiResult.success) {
      alert('Gagal memuat beberapa data. Silakan refresh halaman.');
    }
  }, [apiCall]);

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
      const processedData = {
        ...result.data.data,
        latitude: Number(result.data.data.latitude),
        longitude: Number(result.data.data.longitude),
        Kuantitas: parseInt(result.data.data.Kuantitas)
      };
      setLotData(processedData);
    } else {
      const message = result.data?.message || result.error || 'Material tidak ditemukan';
      alert(message);
      setLotData(null);
    }
    setLoading(false);
  }, [searchLot, apiCall]);

  const handleSubmit = useCallback(async () => {
    const { ID_Plat, ID_Lokasi_tujuan, Jumlah } = form;

    if (!ID_Plat || !ID_Lokasi_tujuan || !Jumlah) {
      alert('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);
    const payload = {
      ID_Plat: parseInt(ID_Plat),
      ID_Lokasi_tujuan: parseInt(ID_Lokasi_tujuan),
      Jumlah: parseInt(Jumlah),
      UserID: userId,
      Tanggal_permintaan: new Date().toISOString().split('T')[0]
    };

    const result = await apiCall(`${BASE_URL}/api/distribusi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: payload
    });

    if (result.success) {
      setOpen(false);
      setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' });
      await fetchDistribusi();
      alert('Permintaan distribusi berhasil dibuat');
    } else {
      alert(`Gagal membuat permintaan: ${result.error}`);
    }
    setLoading(false);
  }, [form, userId, apiCall, fetchDistribusi]);

  const handleDistribusiSelesai = useCallback(async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menandai distribusi ini sebagai selesai?')) {
      return;
    }

    setLoading(true);
    const payload = {
      status: 'terdistribusi',
      tanggal_distribusi: new Date().toISOString().split('T')[0]
    };

    const result = await apiCall(`${BASE_URL}/api/distribusi/status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: payload
    });

    if (result.success) {
      await fetchDistribusi();
      alert('Status distribusi berhasil diperbarui!');
    } else {
      alert(`Gagal memperbarui status: ${result.error}`);
    }
    setLoading(false);
  }, [apiCall, fetchDistribusi]);

  // Event handlers for dialog
  const handleOpen = useCallback(() => {
    setOpen(true);
    fetchOptions();
  }, [fetchOptions]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // Computed values with memoization
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

  // Effects
  useEffect(() => {
    fetchDistribusi();
  }, [fetchDistribusi]);

  // Render content based on active tab
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
                    sx={{ minWidth: 200 }}
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
                  Riwayat Distribusi
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleOpen}
                  disabled={loading}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  Permintaan Baru
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  }}>
                    <TableRow>
                      {['ID', 'Material', 'Lot Batch Number', 'Tujuan', 'Jumlah', 'Tanggal', 'Status', 'Aksi'].map((header) => (
                        <TableCell key={header} sx={{ color: 'white', fontWeight: 600 }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribusi.map((dist, index) => (
                      <Fade in timeout={300 + index * 100} key={dist.ID_Distribusi}>
                        <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.05)' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{dist.ID_Distribusi}</TableCell>
                          <TableCell>{dist.Nama_plat}</TableCell>
                          <TableCell>{dist.Lot_Batch_Number}</TableCell> {/* Added Lot_Batch_Number */}
                          <TableCell>{dist.Nama_Lokasi}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{dist.Jumlah?.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(dist.Tanggal_permintaan).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>{getStatusChip(dist.Status)}</TableCell>
                          <TableCell>
                            {dist.Status === 'pending' && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleDistribusiSelesai(dist.ID_Distribusi)}
                                disabled={loading}
                                startIcon={<CheckIcon />}
                              >
                                Selesai
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                    {distribusi.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}> {/* Updated colspan */}
                          <Typography color="text.secondary">
                            {loading ? 'Memuat data...' : 'Tidak ada data distribusi'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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

              {/* Statistik Cards */}
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

              {/* Quick Actions */}
              <Card sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Aksi Cepat
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpen}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Permintaan Distribusi
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
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
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => setActiveTab('history')}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Lihat Riwayat
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              {/* Recent Activity */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAddButtonClick={handleOpen}>
        {renderContent()}

        {/* Dialog Formulir */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AddIcon />
            Permintaan Distribusi Baru
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Select
                fullWidth
                name="ID_Plat"
                value={form.ID_Plat}
                onChange={handleChange}
                displayEmpty
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="" disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    Pilih Material
                  </Box>
                </MenuItem>
                {platOptions.map((plat) => (
                  <MenuItem key={plat.ID_Plat} value={plat.ID_Plat}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {plat.Nama_plat}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lot: {plat.Lot_Batch_Number}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>

              <Select
                fullWidth
                name="ID_Lokasi_tujuan"
                value={form.ID_Lokasi_tujuan}
                onChange={handleChange}
                displayEmpty
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="" disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    Pilih Lokasi Tujuan
                  </Box>
                </MenuItem>
                {lokasiOptions.map((lokasi) => (
                  <MenuItem key={lokasi.ID_Lokasi} value={lokasi.ID_Lokasi}>
                    {lokasi.Nama_Lokasi}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                fullWidth
                name="Jumlah"
                label="Jumlah"
                type="number"
                value={form.Jumlah}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !form.ID_Plat || !form.ID_Lokasi_tujuan || !form.Jumlah}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading Overlay */}
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