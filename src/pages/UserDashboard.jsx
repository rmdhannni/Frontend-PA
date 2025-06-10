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

if (!L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;
    map.setView([userLocation.lat, userLocation.lng], 15);
    map.setMaxBounds(SURABAYA_BOUNDS);
    map.setMinZoom(12);
    map.setMaxZoom(19);
  }, [userLocation]);

  useEffect(() => {
    if (!lotData || !userLocation || !mapRef.current) return;

    const map = mapRef.current;

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

    map.fitBounds([
      [userLocation.lat, userLocation.lng],
      [lotData.latitude, lotData.longitude]
    ]);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
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
    const result = await apiCall(`${BASE_URL}/api/distribusi/user/${userId}`); // [cite: 294]

    if (result.success) { // [cite: 294]
      setDistribusi(result.data); // [cite: 294]
    } else {
      alert(`Gagal memuat data distribusi: ${result.error}`); // [cite: 294]
    }
    setLoading(false); // [cite: 294]
  }, [userId, apiCall]);

  const fetchOptions = useCallback(async () => {
    const [platResult, lokasiResult] = await Promise.all([
      apiCall(`${BASE_URL}/api/plat`), // [cite: 295]
      apiCall(`${BASE_URL}/api/lokasi`) // [cite: 295]
    ]);

    if (platResult.success) setPlatOptions(platResult.data); // [cite: 295]
    if (lokasiResult.success) setLokasiOptions(lokasiResult.data); // [cite: 295]

    if (!platResult.success || !lokasiResult.success) { // [cite: 295]
      alert('Gagal memuat beberapa data. Silakan refresh halaman.'); // [cite: 295]
    }
  }, [apiCall]);

  const handleSearchLot = useCallback(async () => {
    const trimmedLot = searchLot.trim(); // [cite: 296]
    if (!trimmedLot) { // [cite: 296]
      alert('Mohon masukkan Lot Batch Number'); // [cite: 296]
      return;
    }

    setLoading(true); // [cite: 296]
    const encodedLot = encodeURIComponent(trimmedLot); // [cite: 296]
    const result = await apiCall(`${BASE_URL}/api/plat/lot/${encodedLot}`); // [cite: 296]

    if (result.success && result.data.success) { // [cite: 297]
      const processedData = {
        ...result.data.data,
        latitude: Number(result.data.data.latitude), // [cite: 297]
        longitude: Number(result.data.data.longitude), // [cite: 297]
        Kuantitas: parseInt(result.data.data.Kuantitas) // [cite: 297]
      };
      setLotData(processedData); // [cite: 297]
    } else {
      const message = result.data?.message || result.error || 'Material tidak ditemukan'; // [cite: 297]
      alert(message); // [cite: 297]
      setLotData(null); // [cite: 297]
    }
    setLoading(false); // [cite: 297]
  }, [searchLot, apiCall]);

  const handleSubmit = useCallback(async () => {
    const { ID_Plat, ID_Lokasi_tujuan, Jumlah } = form; // [cite: 298]

    if (!ID_Plat || !ID_Lokasi_tujuan || !Jumlah) { // [cite: 298]
      alert('Mohon lengkapi semua field'); // [cite: 298]
      return;
    }

    setLoading(true); // [cite: 298]
    const payload = {
      ID_Plat: parseInt(ID_Plat), // [cite: 298]
      ID_Lokasi_tujuan: parseInt(ID_Lokasi_tujuan), // [cite: 299]
      Jumlah: parseInt(Jumlah), // [cite: 299]
      UserID: userId, // [cite: 299]
      Tanggal_permintaan: new Date().toISOString().split('T')[0] // [cite: 299]
    };

    const result = await apiCall(`${BASE_URL}/api/distribusi`, { // [cite: 299]
      method: 'POST', // [cite: 299]
      headers: { 'Content-Type': 'application/json' }, // [cite: 299]
      data: payload // [cite: 299]
    });

    if (result.success) { // [cite: 299]
      setOpen(false); // [cite: 299]
      setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' }); // [cite: 299]
      await fetchDistribusi(); // [cite: 299]
      alert('Permintaan distribusi berhasil dibuat'); // [cite: 299]
    } else {
      alert(`Gagal membuat permintaan: ${result.error}`); // [cite: 300]
    }
    setLoading(false); // [cite: 300]
  }, [form, userId, apiCall, fetchDistribusi]);

  // handleDistribusiSelesai dihapus karena digantikan oleh scan QR code di mobile
  // const handleDistribusiSelesai = useCallback(async (id) => { ... });

  const handleOpen = useCallback(() => { // [cite: 302]
    setOpen(true); // [cite: 302]
    fetchOptions(); // [cite: 302]
  }, [fetchOptions]);

  const handleClose = useCallback(() => { // [cite: 303]
    setOpen(false); // [cite: 303]
    setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' }); // [cite: 303]
  }, []);

  const handleChange = useCallback((e) => { // [cite: 304]
    const { name, value } = e.target; // [cite: 304]
    setForm(prev => ({ ...prev, [name]: value })); // [cite: 304]
  }, []);

  const countByStatus = useMemo(() => ({ // [cite: 305]
    total: distribusi.length, // [cite: 305]
    pending: distribusi.filter(d => d.Status === 'pending').length, // [cite: 305]
    terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length, // [cite: 305]
    disetujui: distribusi.filter(d => d.Status === 'disetujui').length, // [cite: 305]
    ditolak: distribusi.filter(d => d.Status === 'ditolak').length // [cite: 305]
  }), [distribusi]);

  const getStatusChip = useCallback((status) => { // [cite: 306]
    const config = STATUS_CONFIG[status] || { label: status, color: 'default', icon: null }; // [cite: 306]
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

  useEffect(() => { // [cite: 307]
    fetchDistribusi(); // [cite: 307]
  }, [fetchDistribusi]);

  const renderContent = () => { // [cite: 308]
    switch (activeTab) {
      case 'tracking':
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapIcon color="primary" /> {/* [cite: 309] */}
                Pelacakan Material {/* [cite: 309] */}
              </Typography>

              <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth // [cite: 310]
                    label="Cari Lot Batch Number" // [cite: 310]
                    variant="outlined"
                    value={searchLot}
                    onChange={(e) => setSearchLot(e.target.value)} // [cite: 311]
                    disabled={loading} // [cite: 311]
                    sx={{ minWidth: 200 }} // [cite: 311]
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> // [cite: 312]
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearchLot} // [cite: 312]
                    sx={{ minWidth: 150, height: 56 }} // [cite: 313]
                    disabled={loading} // [cite: 313]
                    startIcon={<SearchIcon />} // [cite: 313]
                  >
                    {loading ? 'Mencari...' : 'Cari'} {/* [cite: 314] */}
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
                  <HistoryIcon color="primary" /> {/* [cite: 316] */}
                  Riwayat Distribusi {/* [cite: 316] */}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleOpen} // [cite: 316]
                  disabled={loading} // [cite: 317]
                  startIcon={<AddIcon />} // [cite: 317]
                  sx={{ borderRadius: 3 }}
                >
                  Permintaan Baru {/* [cite: 318] */}
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // [cite: 318, 319]
                  }}>
                    <TableRow>
                      {['ID', 'Material', 'Lot Batch Number', 'Tujuan', 'Jumlah', 'Tanggal', 'Status'].map((header) => ( // Removed 'Aksi'
                        <TableCell key={header} sx={{ color: 'white', fontWeight: 600 }}> {/* [cite: 319, 320] */}
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribusi.map((dist, index) => ( // [cite: 321]
                      <Fade in timeout={300 + index * 100} key={dist.ID_Distribusi}>
                        <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.05)' } }}> {/* [cite: 322] */}
                          <TableCell sx={{ fontWeight: 500 }}>{dist.ID_Distribusi}</TableCell> {/* [cite: 322] */}
                          <TableCell>{dist.Nama_plat}</TableCell> {/* [cite: 322] */}
                          <TableCell>{dist.Lot_Batch_Number}</TableCell> {/* [cite: 322] */}
                          <TableCell>{dist.Nama_Lokasi}</TableCell> {/* [cite: 323] */}
                          <TableCell sx={{ fontWeight: 500 }}>{dist.Jumlah?.toLocaleString()}</TableCell> {/* [cite: 323] */}
                          <TableCell>
                            {new Date(dist.Tanggal_permintaan).toLocaleDateString('id-ID')} {/* [cite: 324] */}
                          </TableCell>
                          <TableCell>{getStatusChip(dist.Status)}</TableCell> {/* [cite: 324] */}
                           {/* Action button (Selesai) removed for web, as it's replaced by mobile scan */}
                        </TableRow>
                      </Fade>
                    ))}
                    {distribusi.length === 0 && ( // [cite: 329]
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}> {/* Updated colspan */}
                          <Typography color="text.secondary">
                            {loading ? 'Memuat data...' : 'Tidak ada data distribusi'} {/* [cite: 330, 331] */}
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
                <DashboardIcon color="primary" /> {/* [cite: 333] */}
                Dashboard Overview {/* [cite: 334] */}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}> {/* [cite: 334] */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Distribusi" // [cite: 335]
                    value={countByStatus.total} // [cite: 335]
                    icon={<TrendingUpIcon />} // [cite: 335]
                    color="#1976d2" // [cite: 335]
                    trend="+12% dari bulan lalu" // [cite: 335]
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Pending" // [cite: 337]
                    value={countByStatus.pending} // [cite: 337]
                    icon={<ScheduleIcon />} // [cite: 337]
                    color="#ff9800" // [cite: 337]
                    trend="Memerlukan tindakan" // [cite: 337]
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Terdistribusi" // [cite: 338]
                    value={countByStatus.terdistribusi} // [cite: 338]
                    icon={<ShippingIcon />} // [cite: 338]
                    color="#2196f3" // [cite: 339]
                    trend="Dalam pengiriman" // [cite: 339]
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Disetujui" // [cite: 340]
                    value={countByStatus.disetujui} // [cite: 340]
                    icon={<CheckIcon />} // [cite: 340]
                    color="#4caf50" // [cite: 340]
                    trend="Selesai" // [cite: 341]
                  />
                </Grid>
              </Grid>

              <Card sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}> {/* [cite: 341, 342] */}
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* [cite: 342] */}
                  Aksi Cepat {/* [cite: 342] */}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}> {/* [cite: 343] */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />} // [cite: 344]
                      onClick={handleOpen} // [cite: 344]
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Permintaan Distribusi {/* [cite: 345] */}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined" // [cite: 346]
                      startIcon={<MapIcon />} // [cite: 346]
                      onClick={() => setActiveTab('tracking')} // [cite: 346]
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Lacak Material {/* [cite: 347] */}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined" // [cite: 348]
                      startIcon={<HistoryIcon />} // [cite: 348]
                      onClick={() => setActiveTab('history')} // [cite: 348]
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Lihat Riwayat {/* [cite: 349] */}
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* [cite: 351] */}
                  Aktivitas Terbaru {/* [cite: 351] */}
                </Typography>
                {distribusi.slice(0, 5).map((dist, index) => ( // [cite: 351]
                  <Zoom in timeout={300 + index * 100} key={dist.ID_Distribusi}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2, // [cite: 352]
                        px: 2, // [cite: 353]
                        mb: 1, // [cite: 353]
                        borderRadius: 2, // [cite: 353]
                        backgroundColor: 'rgba(25, 118, 210, 0.05)', // [cite: 354]
                        border: '1px solid rgba(25, 118, 210, 0.1)', // [cite: 354]
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> {/* [cite: 355] */}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {dist.Nama_plat} {/* [cite: 355] */}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lot: {dist.Lot_Batch_Number} • {dist.Nama_Lokasi} • {new Date(dist.Tanggal_permintaan).toLocaleDateString('id-ID')} {/* [cite: 356] */}
                        </Typography>
                      </Box>
                      {getStatusChip(dist.Status)} {/* [cite: 357] */}
                    </Box>
                  </Zoom>
                ))}
                {distribusi.length === 0 && ( // [cite: 358]
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      Belum ada aktivitas distribusi {/* [cite: 358] */}
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
          open={open} // [cite: 360]
          onClose={handleClose} // [cite: 360]
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 } // [cite: 361]
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // [cite: 361]
            color: 'white', // [cite: 362]
            display: 'flex', // [cite: 362]
            alignItems: 'center', // [cite: 362]
            gap: 1
          }}>
            <AddIcon /> {/* [cite: 362] */}
            Permintaan Distribusi Baru {/* [cite: 362] */}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Select
                fullWidth
                name="ID_Plat"
                value={form.ID_Plat}
                onChange={handleChange}
                displayEmpty
                disabled={loading} // [cite: 364]
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="" disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    Pilih Material {/* [cite: 365] */}
                  </Box>
                </MenuItem>
                {platOptions.map((plat) => ( // [cite: 365]
                  <MenuItem key={plat.ID_Plat} value={plat.ID_Plat}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {plat.Nama_plat} {/* [cite: 366] */}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lot: {plat.Lot_Batch_Number} {/* [cite: 367] */}
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
                displayEmpty // [cite: 369]
                disabled={loading} // [cite: 369]
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="" disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    Pilih Lokasi Tujuan {/* [cite: 370] */}
                  </Box>
                </MenuItem>
                {lokasiOptions.map((lokasi) => ( // [cite: 370]
                  <MenuItem key={lokasi.ID_Lokasi} value={lokasi.ID_Lokasi}>
                    {lokasi.Nama_Lokasi} {/* [cite: 371] */}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                fullWidth
                name="Jumlah" // [cite: 372]
                label="Jumlah" // [cite: 372]
                type="number"
                value={form.Jumlah}
                onChange={handleChange}
                inputProps={{ min: 1 }} // [cite: 372]
                disabled={loading} // [cite: 373]
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleClose} // [cite: 374]
              disabled={loading} // [cite: 374]
              sx={{ borderRadius: 2 }}
            >
              Batal {/* [cite: 374] */}
            </Button>
            <Button
              onClick={handleSubmit} // [cite: 375]
              variant="contained"
              disabled={loading || !form.ID_Plat || !form.ID_Lokasi_tujuan || !form.Jumlah} // [cite: 376]
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan'} {/* [cite: 377] */}
            </Button>
          </DialogActions>
        </Dialog>

        {loading && ( // [cite: 377]
          <Box
            sx={{
              position: 'fixed',
              top: 0, // [cite: 378]
              left: 0, // [cite: 378]
              right: 0, // [cite: 378]
              bottom: 0, // [cite: 378]
              display: 'flex', // [cite: 378]
              alignItems: 'center', // [cite: 378]
              justifyContent: 'center', // [cite: 379]
              backgroundColor: 'rgba(0, 0, 0, 0.1)', // [cite: 379]
              zIndex: 9999,
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2, width: 200 }} /> {/* [cite: 379, 380] */}
              <Typography>Memproses...</Typography> {/* [cite: 380] */}
            </Paper>
          </Box>
        )}
      </Layout>
    </ThemeProvider>
  );
};

export default UserDashboard;