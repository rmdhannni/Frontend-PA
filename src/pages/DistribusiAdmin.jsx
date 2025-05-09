import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  Chip, CircularProgress, FormControl, Select, MenuItem, TextField,
  IconButton, Tooltip, Alert, Grid, Card, CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';

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

export default function DistribusiAdminPage() {
  // Main state
  const [distribusi, setDistribusi] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '' });
  
  // Options for dropdowns - load once and cache
  const [platOptions, setPlatOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  
  // More granular loading states
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
  
  // Options loaded flag to prevent redundant fetching
  const [optionsLoaded, setOptionsLoaded] = useState({
    plat: false,
    lokasi: false,
    user: false
  });

  // Calculate stats from distribusi data
  const stats = {
    total: distribusi.length,
    pending: distribusi.filter(d => d.Status === 'pending').length,
    diproses: distribusi.filter(d => d.Status === 'diproses').length,
    terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length,
    disetujui: distribusi.filter(d => d.Status === 'disetujui').length,
    ditolak: distribusi.filter(d => d.Status === 'ditolak').length
  };

  // Fetch distribusi data with improved error handling
  const fetchDistribusi = useCallback(async (retryCount = 0) => {
    setLoading(prev => ({ ...prev, table: true }));
    setError('');
    
    try {
      const res = await api.get('/api/distribusi', {
        // Don't use signal here to prevent cancellation issues
        timeout: 30000 // Override timeout for this request
      });
      
      setDistribusi(res.data || []);
    } catch (e) {
      console.error('Error fetching distribusi:', e);
      
      // Check if it's a network error or timeout
      if (axios.isCancel(e)) {
        setError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retry attempt ${retryCount + 1} for distribusi data`);
        setError('Koneksi lambat, mencoba kembali...');
        
        // Wait before retrying
        setTimeout(() => fetchDistribusi(retryCount + 1), 1000);
        return;
      } else {
        setError('Gagal memuat data distribusi: ' + (e.response?.data?.message || e.message));
      }
    } finally {
      setLoading(prev => ({ ...prev, table: false }));
    }
  }, []);

  // Improved fetch options function without signal/abort controller
  const fetchOptions = useCallback(async (
    endpoint, 
    stateSetter, 
    loadingSetter, 
    loadedFlag,
    params = {},
    retryCount = 0
  ) => {
    if (retryCount === 0) {
      loadingSetter(true);
    }
    
    try {
      // Add cache-busting parameter for retries
      const queryParams = retryCount > 0 
        ? { ...params, _t: new Date().getTime() } 
        : params;
      
      const res = await api.get(endpoint, {
        params: queryParams,
        timeout: 15000 // Override timeout for options fetching
      });
      
      if (res.data) {
        stateSetter(res.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      
      // Check if it's a cancellation, timeout, or network error
      if (axios.isCancel(err)) {
        console.log(`Request to ${endpoint} was cancelled`);
      } else if (err.code === 'ECONNABORTED' && retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} for ${endpoint}`);
        
        // Exponential backoff
        const delay = 1000 * Math.pow(1.5, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Recursive retry
        return fetchOptions(endpoint, stateSetter, loadingSetter, loadedFlag, params, retryCount + 1);
      }
      
      return false;
    } finally {
      if (retryCount === 0 || retryCount === 3) {
        loadingSetter(false);
      }
    }
  }, []);

  // Specialized option fetchers with improved error handling
  const fetchPlatOptions = useCallback(async () => {
    if (optionsLoaded.plat && platOptions.length > 0) return;
    
    const success = await fetchOptions(
      '/api/plat',
      setPlatOptions,
      (value) => setLoading(prev => ({ ...prev, platOptions: value })),
      'plat'
    );
    
    if (success) {
      setOptionsLoaded(prev => ({ ...prev, plat: true }));
    }
  }, [fetchOptions, optionsLoaded.plat, platOptions.length]);

  const fetchLokasiOptions = useCallback(async () => {
    if (optionsLoaded.lokasi && lokasiOptions.length > 0) return;
    
    const success = await fetchOptions(
      '/api/lokasi',
      setLokasiOptions,
      (value) => setLoading(prev => ({ ...prev, lokasiOptions: value })),
      'lokasi'
    );
    
    if (success) {
      setOptionsLoaded(prev => ({ ...prev, lokasi: true }));
    }
  }, [fetchOptions, optionsLoaded.lokasi, lokasiOptions.length]);

  // Fixed user options fetching - filters for users with Role '2' only
  const fetchUserOptions = useCallback(async () => {
    if (optionsLoaded.user && userOptions.length > 0) return;
    
    setLoading(prev => ({ ...prev, userOptions: true }));
    
    try {
      // Try to get users with role '2' specifically
      const res = await api.get('/api/user', {
        timeout: 20000
      });
      
      if (res.data && Array.isArray(res.data)) {
        // Filter users with Role '2' only
        const filteredUsers = res.data.filter(user => user.Role === '2' || user.Role === 2);
        setUserOptions(filteredUsers);
        setOptionsLoaded(prev => ({ ...prev, user: true }));
      } else {
        console.log('No user data returned or invalid format');
      }
    } catch (err) {
      console.error('Error fetching user options:', err);
      
      // Fallback approach
      try {
        console.log('Primary user endpoint failed, trying fallback');
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

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState({
    online: navigator.onLine,
    slow: false
  });

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

  // Initial data loading with connection feedback
  useEffect(() => {
    // Setup performance measurement
    const startTime = performance.now();
    
    fetchDistribusi().finally(() => {
      const loadTime = performance.now() - startTime;
      // If loading takes more than 3 seconds, mark connection as slow
      if (loadTime > 3000) {
        setConnectionStatus(prev => ({ ...prev, slow: true }));
      }
    });
  }, [fetchDistribusi]);

  // Open dialog handler with sequential loading of options to reduce race conditions
  const handleOpen = async () => {
    setFormError('');
    setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '' });
    setOpen(true);
    
    // Sequential loading with proper error handling
    try {
      // First load plat options
      await fetchPlatOptions();
      
      // Then load location options
      await fetchLokasiOptions();
      
      // Finally load user options
      await fetchUserOptions();
    } catch (err) {
      console.error('Error loading dialog options:', err);
      setFormError('Terjadi kesalahan saat memuat data. Silakan tutup dan coba lagi.');
    }
  };
  
  const handleClose = () => setOpen(false);
  
  const handleChange = e => {
    setFormError(''); // Clear form errors on change
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Fixed validateForm function - handle ID values correctly
  const validateForm = () => {
    // Check if ID_Plat is empty or undefined
    if (!form.ID_Plat) {
      setFormError('Silakan pilih plat terlebih dahulu');
      return false;
    }
    
    // Check if ID_Lokasi_tujuan is empty or undefined
    if (!form.ID_Lokasi_tujuan) {
      setFormError('Silakan pilih lokasi terlebih dahulu');
      return false;
    }
    
    // Check if UserID is empty or undefined
    if (!form.UserID) {
      setFormError('Silakan pilih user terlebih dahulu');
      return false;
    }
    
    // Check if Jumlah is empty
    if (!form.Jumlah || form.Jumlah === '') {
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

  // Improved submit handler without AbortController
  const handleSubmit = async (retryCount = 0) => {
    // Form validation
    if (!validateForm()) return;

    setLoading(prev => ({ ...prev, submit: true }));
    setFormError('');
    
    try {
      const distribusiData = { 
        ...form, 
        Status: 'pending', 
        Tanggal_permintaan: new Date().toISOString() 
      };
      
      await api.post('/api/distribusi', distribusiData, {
        timeout: 25000 // Extended timeout for form submission
      });
      
      handleClose();
      
      // After successful submit, reload the distribusi data
      await fetchDistribusi();
      
      // Show success message through browser alert
      setTimeout(() => alert('Distribusi berhasil ditambahkan!'), 300);
    } catch (e) {
      console.error('Error submitting form:', e);
      
      // Handle different error types
      if (axios.isCancel(e)) {
        setFormError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retry attempt ${retryCount + 1} for form submission`);
        setFormError('Koneksi lambat, mencoba kembali...');
        
        // Wait before retrying
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

  // Improved status change handler
  const handleStatusChange = async (id, newStatus, retryCount = 0) => {
    try {
      await api.put(`/api/distribusi/status/${id}`, 
        { status: newStatus },
        { timeout: 15000 } // Set specific timeout
      );
      
      fetchDistribusi();
    } catch (e) {
      console.error('Error changing status:', e);
      
      // Handle different error types
      if (axios.isCancel(e)) {
        setError('Permintaan dibatalkan karena timeout. Silakan coba lagi.');
      } else if (e.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retry attempt ${retryCount + 1} for status change`);
        
        // Wait before retrying
        setTimeout(() => handleStatusChange(id, newStatus, retryCount + 1), 1000);
        return;
      } else {
        setError('Gagal mengubah status: ' + (e.response?.data?.message || e.message));
      }
    }
  };

  const renderChip = status => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      diproses: { color: 'info', label: 'Diproses' },
      terdistribusi: { color: 'primary', label: 'Terdistribusi' },
      disetujui: { color: 'success', label: 'Disetujui' },
      ditolak: { color: 'error', label: 'Ditolak' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} />;
  };

  const renderActionButtons = (row) => {
    if (row.Status === 'terdistribusi') {
      return (
        <Box>
          <Tooltip title="Setujui">
            <IconButton 
              color="success" 
              onClick={() => handleStatusChange(row.ID_Distribusi, 'disetujui')}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tolak">
            <IconButton 
              color="error" 
              onClick={() => handleStatusChange(row.ID_Distribusi, 'ditolak')}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return '-';
  };

  // Apply filters
  const filteredDistribusi = statusFilter === 'all' 
    ? distribusi 
    : distribusi.filter(d => d.Status === statusFilter);

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Manajemen Distribusi</Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={() => fetchDistribusi()} 
            disabled={loading.table}
            sx={{ mr: 1 }}
          >
            Muat Ulang
          </Button>
          <Button 
            variant="contained" 
            onClick={handleOpen}
            disabled={!connectionStatus.online || loading.table}
          >
            Tambah Distribusi
          </Button>
        </Box>
      </Box>

      {/* Connection Status */}
      {!connectionStatus.online && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Anda sedang offline. Beberapa fitur mungkin tidak berfungsi dengan baik.
        </Alert>
      )}
      
      {connectionStatus.online && connectionStatus.slow && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Koneksi lambat terdeteksi. Data mungkin membutuhkan waktu lebih lama untuk dimuat.
        </Alert>
      )}

      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle2">Total</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#fff9c4' }}>
            <CardContent>
              <Typography variant="subtitle2">Pending</Typography>
              <Typography variant="h4">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#bbdefb' }}>
            <CardContent>
              <Typography variant="subtitle2">Diproses</Typography>
              <Typography variant="h4">{stats.diproses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#e1f5fe' }}>
            <CardContent>
              <Typography variant="subtitle2">Terdistribusi</Typography>
              <Typography variant="h4">{stats.terdistribusi}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#c8e6c9' }}>
            <CardContent>
              <Typography variant="subtitle2">Disetujui</Typography>
              <Typography variant="h4">{stats.disetujui}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ backgroundColor: '#ffcdd2' }}>
            <CardContent>
              <Typography variant="subtitle2">Ditolak</Typography>
              <Typography variant="h4">{stats.ditolak}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Box mb={2} display="flex" alignItems="center">
        <Typography variant="subtitle1" sx={{ mr: 2 }}>Filter Status:</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Semua</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="diproses">Diproses</MenuItem>
            <MenuItem value="terdistribusi">Terdistribusi</MenuItem>
            <MenuItem value="disetujui">Disetujui</MenuItem>
            <MenuItem value="ditolak">Ditolak</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      {loading.table ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {connectionStatus.slow 
              ? "Koneksi lambat terdeteksi. Sedang memuat data..." 
              : "Memuat data..."}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Plat</TableCell>
                <TableCell>Lokasi</TableCell>
                <TableCell>Jumlah</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDistribusi.length > 0 ? filteredDistribusi.map(row => (
                <TableRow key={row.ID_Distribusi}>
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
                  <TableCell colSpan={8} align="center">
                    {statusFilter === 'all' ? 'Tidak ada data' : 'Tidak ada data dengan status tersebut'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Distribution Dialog */}
      <Dialog 
        open={open} 
        onClose={loading.submit ? undefined : handleClose}
        fullWidth 
        maxWidth="sm"
        disableEscapeKeyDown={loading.submit}
      >
        <DialogTitle>Tambah Distribusi</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>User</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            {loading.userOptions ? (
              <Box display="flex" alignItems="center" my={1}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Memuat data user...</Typography>
              </Box>
            ) : (
              <Select
                name="UserID"
                value={form.UserID}
                onChange={handleChange}
                displayEmpty
                disabled={loading.submit}
              >
                <MenuItem value="" disabled>Pilih User</MenuItem>
                {userOptions.map(u => (
                  <MenuItem key={u.ID_User} value={u.ID_User}>
                    {u.Username} {u.Role === '2' ? '(User)' : ''}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Plat</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            {loading.platOptions ? (
              <Box display="flex" alignItems="center" my={1}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Memuat data plat...</Typography>
              </Box>
            ) : (
              <Select
                name="ID_Plat"
                value={form.ID_Plat}
                onChange={handleChange}
                displayEmpty
                disabled={loading.submit}
              >
                <MenuItem value="" disabled>Pilih Plat</MenuItem>
                {platOptions.map(p => (
                  <MenuItem key={p.ID_Plat} value={p.ID_Plat}>{p.Nama_plat}</MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Lokasi</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            {loading.lokasiOptions ? (
              <Box display="flex" alignItems="center" my={1}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Memuat data lokasi...</Typography>
              </Box>
            ) : (
              <Select
                name="ID_Lokasi_tujuan"
                value={form.ID_Lokasi_tujuan}
                onChange={handleChange}
                displayEmpty
                disabled={loading.submit}
              >
                <MenuItem value="" disabled>Pilih Lokasi</MenuItem>
                {lokasiOptions.map(l => (
                  <MenuItem key={l.ID_Lokasi} value={l.ID_Lokasi}>{l.Nama_Lokasi}</MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Jumlah</Typography>
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
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading.submit}
          >
            Batal
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            variant="contained" 
            disabled={loading.submit || loading.platOptions || loading.lokasiOptions || loading.userOptions}
          >
            {loading.submit ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Menyimpan...
              </>
            ) : connectionStatus.slow ? 'Simpan (Koneksi Lambat)' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}