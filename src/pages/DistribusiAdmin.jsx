import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import Layout from '../components/partials/Layout'; // Import Layout component
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  Chip, CircularProgress, FormControl, Select, MenuItem, TextField,
  IconButton, Tooltip, Alert, Grid, Card, CardContent, Divider,
  Container, useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import DashboardIcon from '@mui/icons-material/Dashboard';

const BASE_URL = 'http://localhost:3000';

// Create axios instance with common config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for authentication
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Status configurations for reuse
const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending' },
  diproses: { color: 'info', label: 'Diproses' },
  terdistribusi: { color: 'primary', label: 'Terdistribusi' },
  disetujui: { color: 'success', label: 'Disetujui' },
  ditolak: { color: 'error', label: 'Ditolak' }
};

function DistribusiAdminContent() {
  const theme = useTheme();
  
  // Main state
  const [distribusi, setDistribusi] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '' });
  
  // Options for dropdowns - load once and cache
  const [platOptions, setPlatOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  
  // Loading states - consolidated to reduce state variables
  const [loading, setLoading] = useState({
    table: false,
    platOptions: false,
    lokasiOptions: false,
    userOptions: false,
    submit: false
  });
  
  // Error handling
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Options loaded flag
  const [optionsLoaded, setOptionsLoaded] = useState({
    plat: false,
    lokasi: false,
    user: false
  });

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState({
    online: navigator.onLine,
    slow: false
  });

  // Calculate stats from distribusi data using useMemo for optimization
  const stats = useMemo(() => ({
    total: distribusi.length,
    pending: distribusi.filter(d => d.Status === 'pending').length,
    diproses: distribusi.filter(d => d.Status === 'diproses').length,
    terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length,
    disetujui: distribusi.filter(d => d.Status === 'disetujui').length,
    ditolak: distribusi.filter(d => d.Status === 'ditolak').length
  }), [distribusi]);

  // Apply filters - using useMemo to optimize
  const filteredDistribusi = useMemo(() => 
    statusFilter === 'all' 
      ? distribusi 
      : distribusi.filter(d => d.Status === statusFilter),
    [distribusi, statusFilter]
  );

  // Fetch distribusi data with improved error handling
  const fetchDistribusi = useCallback(async (retryCount = 0) => {
    setLoading(prev => ({ ...prev, table: true }));
    setError('');
    
    try {
      const res = await api.get('/api/distribusi', { timeout: 30000 });
      setDistribusi(res.data || []);
    } catch (e) {
      console.error('Error fetching distribusi:', e);
      
      if (axios.isCancel(e)) {
        setError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        setError('Koneksi lambat, mencoba kembali...');
        setTimeout(() => fetchDistribusi(retryCount + 1), 1000);
        return;
      } else {
        setError('Gagal memuat data distribusi: ' + (e.response?.data?.message || e.message));
      }
    } finally {
      setLoading(prev => ({ ...prev, table: false }));
    }
  }, []);

  // Improved fetch options function
  const fetchOptions = useCallback(async (
    endpoint, 
    stateSetter, 
    loadingKey, 
    loadedFlag,
    params = {},
    retryCount = 0
  ) => {
    if (retryCount === 0) {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
    }
    
    try {
      const queryParams = retryCount > 0 
        ? { ...params, _t: Date.now() } 
        : params;
      
      const res = await api.get(endpoint, {
        params: queryParams,
        timeout: 15000
      });
      
      if (res.data) {
        stateSetter(res.data);
        setOptionsLoaded(prev => ({ ...prev, [loadedFlag]: true }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      
      if (!axios.isCancel(err) && err.code === 'ECONNABORTED' && retryCount < 3) {
        const delay = 1000 * Math.pow(1.5, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchOptions(endpoint, stateSetter, loadingKey, loadedFlag, params, retryCount + 1);
      }
      
      return false;
    } finally {
      if (retryCount === 0 || retryCount === 3) {
        setLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    }
  }, []);

  // Simplified option fetchers
  const fetchPlatOptions = useCallback(() => {
    if (optionsLoaded.plat && platOptions.length > 0) return Promise.resolve();
    return fetchOptions('/api/plat', setPlatOptions, 'platOptions', 'plat');
  }, [fetchOptions, optionsLoaded.plat, platOptions.length]);

  const fetchLokasiOptions = useCallback(() => {
    if (optionsLoaded.lokasi && lokasiOptions.length > 0) return Promise.resolve();
    return fetchOptions('/api/lokasi', setLokasiOptions, 'lokasiOptions', 'lokasi');
  }, [fetchOptions, optionsLoaded.lokasi, lokasiOptions.length]);

  const fetchUserOptions = useCallback(async () => {
    if (optionsLoaded.user && userOptions.length > 0) return Promise.resolve();
    
    setLoading(prev => ({ ...prev, userOptions: true }));
    
    try {
      const res = await api.get('/api/user', { timeout: 20000 });
      
      if (res.data && Array.isArray(res.data)) {
        const filteredUsers = res.data.filter(user => user.Role === '2' || user.Role === 2);
        setUserOptions(filteredUsers);
        setOptionsLoaded(prev => ({ ...prev, user: true }));
      }
    } catch (err) {
      console.error('Error fetching user options:', err);
      try {
        const fallbackRes = await api.get('/api/user/by-role', {
          params: { role: '2' },
          timeout: 20000
        });
        
        if (fallbackRes.data && Array.isArray(fallbackRes.data)) {
          setUserOptions(fallbackRes.data);
          setOptionsLoaded(prev => ({ ...prev, user: true }));
        }
      } catch (finalErr) {
        console.error('All user fetching attempts failed:', finalErr);
      }
    } finally {
      setLoading(prev => ({ ...prev, userOptions: false }));
    }
  }, [optionsLoaded.user, userOptions.length]);

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

  // Initial data loading
  useEffect(() => {
    const startTime = performance.now();
    
    fetchDistribusi().finally(() => {
      const loadTime = performance.now() - startTime;
      if (loadTime > 3000) {
        setConnectionStatus(prev => ({ ...prev, slow: true }));
      }
    });
  }, [fetchDistribusi]);

  // Dialog handlers
  const handleOpen = async () => {
    setFormError('');
    setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '' });
    setOpen(true);
    
    try {
      await Promise.all([
        fetchPlatOptions(),
        fetchLokasiOptions(),
        fetchUserOptions()
      ]);
    } catch (err) {
      console.error('Error loading dialog options:', err);
      setFormError('Terjadi kesalahan saat memuat data. Silakan tutup dan coba lagi.');
    }
  };
  
  const handleClose = () => setOpen(false);
  
  const handleChange = e => {
    setFormError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Form validation
  const validateForm = () => {
    if (!form.ID_Plat) {
      setFormError('Silakan pilih plat terlebih dahulu');
      return false;
    }
    
    if (!form.ID_Lokasi_tujuan) {
      setFormError('Silakan pilih lokasi terlebih dahulu');
      return false;
    }
    
    if (!form.UserID) {
      setFormError('Silakan pilih user terlebih dahulu');
      return false;
    }
    
    if (!form.Jumlah) {
      setFormError('Silakan masukkan jumlah');
      return false;
    }
    
    const jumlah = parseInt(form.Jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      setFormError('Jumlah harus berupa angka positif');
      return false;
    }
    
    return true;
  };

  // Form submission
  const handleSubmit = async (retryCount = 0) => {
    if (!validateForm()) return;

    setLoading(prev => ({ ...prev, submit: true }));
    setFormError('');
    
    try {
      const distribusiData = { 
        ...form, 
        Status: 'pending', 
        Tanggal_permintaan: new Date().toISOString() 
      };
      
      await api.post('/api/distribusi', distribusiData, { timeout: 25000 });
      handleClose();
      await fetchDistribusi();
      setTimeout(() => alert('Distribusi berhasil ditambahkan!'), 300);
    } catch (e) {
      console.error('Error submitting form:', e);
      
      if (axios.isCancel(e)) {
        setFormError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        setFormError('Koneksi lambat, mencoba kembali...');
        setTimeout(() => handleSubmit(retryCount + 1), 1000);
        return;
      } else {
        const errorMsg = e.response?.data?.message || e.message || 'Terjadi kesalahan server';
        setFormError('Gagal menyimpan data: ' + errorMsg);
      }
    } finally {
      if (retryCount === 0 || retryCount === 2) {
        setLoading(prev => ({ ...prev, submit: false }));
      }
    }
  };

  // Status change handler
  const handleStatusChange = async (id, newStatus, retryCount = 0) => {
    try {
      await api.put(`/api/distribusi/status/${id}`, 
        { status: newStatus },
        { timeout: 15000 }
      );
      
      fetchDistribusi();
    } catch (e) {
      console.error('Error changing status:', e);
      
      if (axios.isCancel(e)) {
        setError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        setTimeout(() => handleStatusChange(id, newStatus, retryCount + 1), 1000);
        return;
      } else {
        setError('Gagal mengubah status: ' + (e.response?.data?.message || e.message));
      }
    }
  };

  // Rendering helpers
  const renderChip = status => {
    const config = STATUS_CONFIG[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 500 }} />;
  };

  const renderActionButtons = (row) => {
    if (row.Status === 'terdistribusi') {
      return (
        <Box>
          <Tooltip title="Setujui">
            <IconButton 
              color="success" 
              onClick={() => handleStatusChange(row.ID_Distribusi, 'disetujui')}
              size="small"
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tolak">
            <IconButton 
              color="error" 
              onClick={() => handleStatusChange(row.ID_Distribusi, 'ditolak')}
              size="small"
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return '-';
  };

  // Render content based on loading state
  const renderTableContent = () => {
    if (loading.table) {
      return (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {connectionStatus.slow 
              ? "Koneksi lambat terdeteksi. Sedang memuat data..." 
              : "Memuat data..."}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{ 
          borderRadius: '8px',
          overflow: 'hidden',
          '& .MuiTableHead-root': {
            backgroundColor: theme.palette.primary.main + '15'
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Plat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Jumlah</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDistribusi.length > 0 ? filteredDistribusi.map(row => (
              <TableRow 
                key={row.ID_Distribusi}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>{row.ID_Distribusi}</TableCell>
                <TableCell>{row.Nama_plat}</TableCell>
                <TableCell>{row.Nama_Lokasi}</TableCell>
                <TableCell>{row.Jumlah}</TableCell>
                <TableCell>{row.Username}</TableCell>
                <TableCell>{new Date(row.Tanggal_permintaan).toLocaleString()}</TableCell>
                <TableCell>{renderChip(row.Status)}</TableCell>
                <TableCell>{renderActionButtons(row)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  {statusFilter === 'all' ? 'Tidak ada data distribusi' : 'Tidak ada data dengan status tersebut'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render forms options with loading state
  const renderFormField = (label, name, options, loadingState, placeholder) => (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        {loadingState ? (
          <Box display="flex" alignItems="center" my={1}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Memuat data {label.toLowerCase()}...</Typography>
          </Box>
        ) : (
          <Select
            name={name}
            value={form[name]}
            onChange={handleChange}
            displayEmpty
            disabled={loading.submit}
            size="small"
            sx={{ borderRadius: '8px' }}
          >
            <MenuItem value="" disabled>{placeholder}</MenuItem>
            {options.map(option => (
              <MenuItem 
                key={option.id || option.ID_User || option.ID_Plat || option.ID_Lokasi} 
                value={option.id || option.ID_User || option.ID_Plat || option.ID_Lokasi}
              >
                {option.name || option.Username || option.Nama_plat || option.Nama_Lokasi}
                {name === "UserID" && option.Role === '2' ? ' (User)' : ''}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </>
  );

  // Render stats card
  const renderStatCard = (title, value, color, bgColor) => (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      <Card 
        elevation={1}
        sx={{ 
          backgroundColor: bgColor,
          borderRadius: '12px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, my: 1 }}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header with Breadcrumb */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <DashboardIcon color="primary" sx={{ mr: 1 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            Dashboard / Distribusi
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Manajemen Distribusi
        </Typography>
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
          {renderStatCard('Total Distribusi', stats.total, theme.palette.text.primary, '#f5f5f5')}
          {renderStatCard('Pending', stats.pending, '#ed6c02', '#fff9c4')}
          {renderStatCard('Diproses', stats.diproses, '#0288d1', '#bbdefb')}
          {renderStatCard('Terdistribusi', stats.terdistribusi, '#2196f3', '#e1f5fe')}
          {renderStatCard('Disetujui', stats.disetujui, '#2e7d32', '#c8e6c9')}
          {renderStatCard('Ditolak', stats.ditolak, '#d32f2f', '#ffcdd2')}
        </Grid>
      </Card>

      {/* Action Bar */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        {/* Filter Controls */}
        <Box display="flex" alignItems="center">
          <FilterListIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>Filter Status:</Typography>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="all">Semua</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([value, {label}]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={1}>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={() => fetchDistribusi()} 
            disabled={loading.table}
            variant="outlined"
            color="primary"
            size="small"
            sx={{ borderRadius: '8px' }}
          >
            Muat Ulang
          </Button>
          <Button 
            variant="contained" 
            onClick={handleOpen}
            disabled={!connectionStatus.online || loading.table}
            startIcon={<AddCircleOutlineIcon />}
            color="primary"
            size="small"
            sx={{ borderRadius: '8px' }}
          >
            Tambah Distribusi
          </Button>
        </Box>
      </Box>

      {/* Table */}
      {renderTableContent()}

      {/* Add Distribution Dialog */}
      <Dialog 
        open={open} 
        onClose={loading.submit ? undefined : handleClose}
        fullWidth 
        maxWidth="sm"
        disableEscapeKeyDown={loading.submit}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: '#fff', py: 2 }}>
          Tambah Distribusi
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {formError && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{formError}</Alert>}
          
          {renderFormField('User', 'UserID', userOptions, loading.userOptions, 'Pilih User')}
          {renderFormField('Plat', 'ID_Plat', platOptions, loading.platOptions, 'Pilih Plat')}
          {renderFormField('Lokasi', 'ID_Lokasi_tujuan', lokasiOptions, loading.lokasiOptions, 'Pilih Lokasi')}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Jumlah</Typography>
          <TextField
            name="Jumlah"
            type="number"
            value={form.Jumlah}
            onChange={handleChange}
            fullWidth
            placeholder="Masukkan jumlah"
            inputProps={{ min: 1 }}
            sx={{ mb: 1 }}
            disabled={loading.submit}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleClose} 
            disabled={loading.submit}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Batal
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            variant="contained" 
            disabled={loading.submit || loading.platOptions || loading.lokasiOptions || loading.userOptions}
            sx={{ borderRadius: '8px' }}
          >
            {loading.submit ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                Menyimpan...
              </>
            ) : connectionStatus.slow ? 'Simpan (Koneksi Lambat)' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Wrap the content with Layout component
export default function DistribusiAdminPage() {
  return (
    <Layout title="Manajemen Distribusi">
      <DistribusiAdminContent />
    </Layout>
  );
}