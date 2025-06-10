// src/pages/DistribusiAdmin.jsx (atau path yang sesuai)
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth'; // Pastikan path ini benar
import Layout from '../components/partials/Layout'; // Pastikan path ini benar
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  Chip, CircularProgress, FormControl, Select, MenuItem, TextField,
  IconButton, Tooltip, Alert, Grid, Card, CardContent, Divider,
  Container, useTheme, Snackbar, TablePagination, InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CategoryIcon from '@mui/icons-material/Category';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print'; // Sudah diimpor

const BASE_URL = 'http://localhost:3000';
const POLLING_INTERVAL = 60000;

// ... (api, api.interceptors, STATUS_CONFIG tetap sama) ...
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending' },
  diproses: { color: 'info', label: 'Diproses User' },
  terdistribusi: { color: 'primary', label: 'Terdistribusi User' },
  disetujui: { color: 'success', label: 'Disetujui Admin' },
  ditolak: { color: 'error', label: 'Ditolak Admin' }
};


function DistribusiAdminContent() {
  const theme = useTheme();
  
  const [distribusi, setDistribusi] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '', Jenis_distribusi: '' });

  const [platOptions, setPlatOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [loading, setLoading] = useState({
    table: false,
    platOptions: false,
    lokasiOptions: false,
    userOptions: false,
    submit: false,
    platCheckLoading: false,
    confirmation: false,
  });

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [jenisFilter, setJenisFilter] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [optionsLoaded, setOptionsLoaded] = useState({ plat: false, lokasi: false, user: false });
  const [connectionStatus, setConnectionStatus] = useState({ online: navigator.onLine, slow: false });
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [generatedQrCode, setGeneratedQrCode] = useState('');
  const [generatedDistribusiId, setGeneratedDistribusiId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, itemId: null, newStatus: '' });

  const componentRef = useRef(null); // Untuk referensi komponen yang akan di-print
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Definisikan triggerPrint menggunakan useReactToPrint
  const triggerPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: generatedDistribusiId ? `QR_Distribusi_${generatedDistribusiId}` : 'QR_Code_Distribusi',
    onBeforeGetContent: () => {
        // setIsPreparingPrint(true) mungkin tidak selalu dieksekusi jika content sync
        // Untuk memastikan, kita bisa return Promise
        return new Promise((resolve) => {
            setIsPreparingPrint(true);
            resolve();
        });
    },
    onAfterPrint: () => setIsPreparingPrint(false),
    // Anda bisa menambahkan @media print styles di sini jika perlu,
    // atau pastikan CSS global Anda sudah menghandle tampilan print.
    // pageStyle: `
    //   @page { size: auto; margin: 10mm; }
    //   @media print {
    //     body { -webkit-print-color-adjust: exact; color-adjust: exact; }
    //     .print-container { border: 2px solid #000 !important; box-shadow: none !important; padding: 20px !important; background: white !important; }
    //     .qr-title { font-size: 18px !important; font-weight: bold !important; margin-bottom: 15px !important; color: #333 !important; }
    //     .qr-code-canvas { display: block !important; margin: 0 auto 15px auto !important; }
    //     .qr-info { font-size: 12px !important; color: #666 !important; word-break: break-all !important; margin-top: 10px !important; }
    //     .no-print { display: none !important; }
    //   }
    // `,
  });

  // HAPUS ATAU KOMENTARI FUNGSI handlePrintQR YANG LAMA
  // const handlePrintQR = useCallback(() => {
  //   // ... implementasi lama ...
  // }, [generatedQrCode, generatedDistribusiId]);


  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbarOpen(false); };

  const stats = useMemo(() => ({
      total: distribusi.length,
      pending: distribusi.filter(d => d.Status === 'pending').length,
      diproses: distribusi.filter(d => d.Status === 'diproses').length,
      terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length,
      disetujui: distribusi.filter(d => d.Status === 'disetujui').length,
      ditolak: distribusi.filter(d => d.Status === 'ditolak').length
  }), [distribusi]);

  const fetchDistribusi = useCallback(async (isPoll = false, retryCount = 0) => {
    if (!isPoll && distribusi.length === 0) {
        setLoading(prev => ({ ...prev, table: true }));
    } else if (!isPoll) {
        setLoading(prev => ({ ...prev, table: true }));
    }
    if (!isPoll) setError('');
    let isRetrying = false;
    try {
      const res = await api.get('/api/distribusi', { timeout: 20000 });
      const rawData = res.data || [];
      const sortedData = [...rawData].sort((a, b) => Number(b.ID_Distribusi) - Number(a.ID_Distribusi));
      setDistribusi((prevDistribusi) => {
        if (JSON.stringify(sortedData) !== JSON.stringify(prevDistribusi)) return sortedData;
        return prevDistribusi;
      });
      if(isPoll && error) setError(null);
    } catch (e) {
      console.error('Error fetching distribusi:', e);
      if (!isPoll) {
        if (axios.isCancel(e)) setError('Permintaan data dibatalkan karena timeout.');
        else if (e.code === 'ECONNABORTED' && retryCount < 2) {
          setError('Koneksi lambat, mencoba kembali mengambil data distribusi...'); isRetrying = true;
          setTimeout(() => fetchDistribusi(isPoll, retryCount + 1), 3000); return;
        } else setError('Gagal memuat data distribusi: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
      } else console.warn('Polling data distribusi gagal:', e.message);
    } finally {
      if (!isPoll || (isPoll && loading.table)) {
          if (!isRetrying) setLoading(prev => ({ ...prev, table: false }));
      }
    }
  }, [distribusi.length, error, loading.table]); // Tambahkan dependensi yang sesuai jika ada

  const processedDistribusi = useMemo(() => {
    let tempDistribusi = [...distribusi];
    if (statusFilter !== 'all') { tempDistribusi = tempDistribusi.filter(d => d.Status === statusFilter); }
    if (jenisFilter !== 'all') { tempDistribusi = tempDistribusi.filter(d => d.Jenis_distribusi === jenisFilter); }
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      tempDistribusi = tempDistribusi.filter(d => {
        const statusLabel = STATUS_CONFIG[d.Status]?.label || d.Status;
        const lokasiDisplay = d.Jenis_distribusi === 'keluar' ? (d.Nama_Lokasi || '') : (d.Nama_Lokasi_Plat_Default || '');
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
        return [
          d.ID_Distribusi?.toString(),
          d.Jenis_distribusi,
          d.Nama_plat,
          lokasiDisplay,
          d.Jumlah?.toString(),
          d.Username_Distribusi,
          statusLabel,
          formatDate(d.Tanggal_permintaan),
          formatDate(d.Tanggal_distribusi),
          formatDate(d.Tanggal_validasi),
          d.qr_code
        ].some(field => field && field.toLowerCase().includes(lowerSearchTerm));
      });
    }
    return tempDistribusi;
  }, [distribusi, statusFilter, jenisFilter, searchTerm]);

  const paginatedDistribusi = useMemo(() => processedDistribusi.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [processedDistribusi, page, rowsPerPage]);

  const fetchOptions = useCallback(async ( endpoint, stateSetter, loadingKey, loadedFlag, params = {}, retryCount = 0 ) => { setLoading(prev => ({ ...prev, [loadingKey]: true })); try { const res = await api.get(endpoint, { params, timeout:15000}); if(res.data){ stateSetter(res.data); setOptionsLoaded(prev => ({...prev, [loadedFlag]:true})); return true;} return false; } catch(err){ console.error(`Error fetching ${loadingKey}:`, err); if(!axios.isCancel(err) && err.code === 'ECONNABORTED' && retryCount < 2){ await new Promise(r => setTimeout(r, 2000)); return fetchOptions(endpoint, stateSetter, loadingKey, loadedFlag, params, retryCount+1);}
  let detailedError = `Gagal memuat ${loadingKey.replace('Options','')} (${endpoint}).`;
  if (err.response) {
    detailedError += ` Status: ${err.response.status}. Detail: ${err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data) || ''}`;
  } else if (err.request) {
    detailedError += ' Tidak ada respons dari server.';
  } else {
    detailedError += ` Kesalahan: ${err.message}`;
  }
  setFormError(prev => prev ? `${prev}\n${detailedError}` : detailedError); return false; } finally { setLoading(prev => ({ ...prev, [loadingKey]: false }));} }, []);

  const fetchPlatOptions = useCallback(() => fetchOptions('/api/plat', setPlatOptions, 'platOptions', 'plat'), [fetchOptions]);
  const fetchLokasiOptions = useCallback(() => fetchOptions('/api/lokasi', setLokasiOptions, 'lokasiOptions', 'lokasi'), [fetchOptions]);

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
        // Consider setting a formError or snackbar here if user options are critical for the form
         setFormError(prev => {
          const userError = 'Gagal memuat opsi user. ';
          return prev ? `${prev}\n${userError}` : userError;
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, userOptions: false }));
    }
  }, [optionsLoaded.user, userOptions.length]); // Removed api from dependencies as it's stable

  useEffect(() => { const handleOnline = () => setConnectionStatus(prev => ({ ...prev, online: true, slow: false })); const handleOffline = () => setConnectionStatus(prev => ({ ...prev, online: false })); window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline); return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); }; }, []);
  
  // Initial fetch logic
  useEffect(() => {
    const startTime = performance.now();
    setLoading(prev => ({ ...prev, table: true })); // Ensure loading state is true initially
    fetchDistribusi(false).finally(() => {
        const loadTime = performance.now() - startTime;
        setConnectionStatus(prev => ({ ...prev, slow: loadTime > 5000 && prev.online }));
        // setLoading(prev => ({ ...prev, table: false })); // Moved table loading false to fetchDistribusi
    });
  }, [fetchDistribusi]); // fetchDistribusi is memoized

  // Polling logic
  useEffect(() => {
    if (connectionStatus.online) {
        const intervalId = setInterval(() => {
            // Do not set table loading to true for polling, fetchDistribusi handles this if needed (e.g., on error retry)
            fetchDistribusi(true);
        }, POLLING_INTERVAL);
        return () => clearInterval(intervalId);
    }
  }, [fetchDistribusi, connectionStatus.online]);

  useEffect(() => { setPage(0); }, [searchTerm, statusFilter, jenisFilter]);

  const handleOpen = async () => {
    setFormError(''); 
    setForm({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '', UserID: '', Jenis_distribusi: '' });
    // Reset options loaded state if you want them to refetch every time dialog opens
    // setOptionsLoaded({ plat: false, lokasi: false, user: false }); 
    setOpen(true);
    try {
      // Fetch options if not already loaded or if they need to be fresh
      const promises = [];
      if (!optionsLoaded.plat || platOptions.length === 0) {
          promises.push(fetchPlatOptions());
      }
      if (!optionsLoaded.lokasi || lokasiOptions.length === 0) {
          promises.push(fetchLokasiOptions());
      }
      if (!optionsLoaded.user || userOptions.length === 0) {
          promises.push(fetchUserOptions());
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading one or more dialog options:', err);
      // Form error is set within fetchOptions/fetchUserOptions if an individual fetch fails
    }
  };

  const handleClose = () => setOpen(false);
  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    if (isPreparingPrint) { // Reset if print was in preparation but dialog closed
        setIsPreparingPrint(false);
    }
  };
  const handleChange = e => { setFormError(''); setForm(f => ({ ...f, [e.target.name]: e.target.value })); };

  const validateForm = async () => {
      if (!form.Jenis_distribusi) { setFormError('Pilih jenis distribusi.'); return false; }
      if (!form.ID_Plat) { setFormError('Pilih plat.'); return false; }
      if (!form.UserID) { setFormError(form.Jenis_distribusi === 'masuk' ? 'Pilih user PIC Gudang.' : 'Pilih user penerima.'); return false; }
      if (form.Jenis_distribusi === 'keluar' && !form.ID_Lokasi_tujuan) { setFormError('Pilih lokasi tujuan.'); return false; }
      if (!form.Jumlah || String(form.Jumlah).trim() === '') { setFormError('Masukkan jumlah.'); return false; }
      const jumlah = parseInt(form.Jumlah);
      if (isNaN(jumlah) || jumlah <= 0) { setFormError('Jumlah harus angka positif.'); return false; }

      if (form.Jenis_distribusi === 'keluar') {
          setLoading(prev => ({ ...prev, platCheckLoading: true }));
          try {
              const response = await api.get(`/api/plat/${form.ID_Plat}`);
              const selectedPlat = response.data;
              if (!selectedPlat) { setFormError('Plat tidak ditemukan.'); return false; }
              if (selectedPlat.Status && selectedPlat.Status.toLowerCase() === 'tidak tersedia') { setFormError(`Plat "${selectedPlat.Nama_plat}" tidak tersedia.`); return false; }
              if (selectedPlat.stok !== undefined && jumlah > selectedPlat.stok) { setFormError(`Jumlah (${jumlah}) melebihi stok (${selectedPlat.stok}).`); return false; }
          } catch (error) {
              console.error('Error checking plat:', error);
              setFormError('Gagal memeriksa plat: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
              return false;
          } finally {
              setLoading(prev => ({ ...prev, platCheckLoading: false }));
          }
      }
      return true;
  };

  const handleSubmit = async (retryCount = 0) => {
      const isValid = await validateForm();
      if (!isValid) { if(loading.submit) setLoading(prev => ({ ...prev, submit: false })); return; }
      setLoading(prev => ({ ...prev, submit: true }));
      setFormError('');
      let isRetrying = false;
      try {
          const distribusiData = {
              ID_Plat: form.ID_Plat,
              Jumlah: parseInt(form.Jumlah),
              UserID: form.UserID,
              Jenis_distribusi: form.Jenis_distribusi,
              ID_Lokasi_tujuan: form.Jenis_distribusi === 'keluar' ? form.ID_Lokasi_tujuan : null,
              Status: 'pending', // Status awal
          };
          const res = await api.post('/api/distribusi', distribusiData, { timeout: 25000 });
          handleClose();
          await fetchDistribusi(false); 
          if (res.data && res.data.qr_code) {
              setGeneratedQrCode(res.data.qr_code);
              setGeneratedDistribusiId(res.data.id); // Assuming 'id' is ID_Distribusi
              setOpenQrDialog(true);
              setSnackbarMessage('Distribusi berhasil ditambahkan & QR Code dibuat!');
          } else {
              setSnackbarMessage('Distribusi berhasil ditambahkan!');
          }
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
      } catch (e) {
          console.error('Error submitting form:', e);
          const errorMsg = e.response?.data?.message || e.response?.data?.error || e.message || 'Terjadi kesalahan.';
          if (axios.isCancel(e)) setFormError('Permintaan timeout. Coba lagi.');
          else if (e.code === 'ECONNABORTED' && retryCount < 2) { setFormError('Koneksi lambat, mencoba lagi...'); isRetrying = true; setTimeout(() => handleSubmit(retryCount + 1), 2000); return; }
          else setFormError('Gagal menyimpan: ' + errorMsg);
      } finally {
          if (!isRetrying) setLoading(prev => ({ ...prev, submit: false }));
      }
  };

  const openConfirmationDialog = (id, newStatus, namaPlat, jenisDistribusi) => { const actionText = newStatus === 'disetujui' ? 'menyetujui' : 'menolak'; const itemTypeText = jenisDistribusi === 'keluar' ? 'distribusi keluar' : (jenisDistribusi === 'masuk' ? 'penerimaan masuk' : 'item'); setConfirmDialog({ isOpen: true, title: `Konfirmasi ${actionText}`, message: `Anda yakin ingin ${actionText} ${itemTypeText} untuk plat "${namaPlat}" (ID: ${id})? Aksi ini akan mempengaruhi stok.`, onConfirm: () => executeValidationChange(id, newStatus), itemId: id, newStatus: newStatus }); };
  const closeConfirmationDialog = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

  const executeValidationChange = async (id, newStatus, retryCount = 0) => {
      closeConfirmationDialog();
      setLoading(prev => ({ ...prev, confirmation: true, table: true })); // Set table loading true
      let isRetrying = false;
      try {
          await api.put(`/api/distribusi/validate/${id}`, { status: newStatus }, { timeout: 20000 });
          await fetchDistribusi(false); // Refetch all data
          if (newStatus === 'disetujui') await fetchPlatOptions(); // Refresh plat options if approved
          setSnackbarMessage(`Distribusi ID ${id} telah ${newStatus}. ${(newStatus === 'disetujui' ? 'Stok telah diperbarui.' : '')}`);
          setSnackbarSeverity('success');
      } catch (e) {
          console.error('Error validating distribution:', e);
          const errorMsg = e.response?.data?.error || e.response?.data?.message || e.message || 'Kesalahan server.';
          if (axios.isCancel(e)) { setSnackbarMessage('Validasi timeout.'); setSnackbarSeverity('error'); }
          else if (e.code === 'ECONNABORTED' && retryCount < 2) { setSnackbarMessage('Koneksi lambat, mencoba validasi...'); setSnackbarSeverity('warning'); isRetrying = true; setTimeout(() => executeValidationChange(id, newStatus, retryCount + 1), 2000); return; }
          else { setSnackbarMessage('Gagal validasi: ' + errorMsg); setSnackbarSeverity('error'); }
      } finally {
          setSnackbarOpen(true);
          if (!isRetrying) setLoading(prev => ({ ...prev, confirmation: false, table: false })); // Set table loading false after operation
      }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleClearSearch = () => setSearchTerm('');

  const renderChip = status => { const config = STATUS_CONFIG[status] || { color: 'default', label: status }; return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 500 }} />; };

  const renderActionButtons = (row) => {
      if (row.Status === 'terdistribusi') {
          return (
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                  <Tooltip title={row.Jenis_distribusi === 'keluar' ? "Setujui Distribusi (Stok akan berkurang)" : (row.Jenis_distribusi === 'masuk' ? "Setujui Penerimaan (Stok akan bertambah)" : "Setujui")}>
                      <span> {/* Span for Tooltip when IconButton is disabled */}
                          <IconButton color="success" onClick={() => openConfirmationDialog(row.ID_Distribusi, 'disetujui', row.Nama_plat, row.Jenis_distribusi)} size="small" disabled={loading.table || loading.confirmation} >
                              <CheckCircleIcon fontSize="small" />
                          </IconButton>
                      </span>
                  </Tooltip>
                  <Tooltip title={row.Jenis_distribusi === 'keluar' ? "Tolak Distribusi" : (row.Jenis_distribusi === 'masuk' ? "Tolak Penerimaan" : "Tolak")}>
                      <span> {/* Span for Tooltip */}
                          <IconButton color="error" onClick={() => openConfirmationDialog(row.ID_Distribusi, 'ditolak', row.Nama_plat, row.Jenis_distribusi)} size="small" disabled={loading.table || loading.confirmation} >
                              <CancelIcon fontSize="small" />
                          </IconButton>
                      </span>
                  </Tooltip>
              </Box>
          );
      }
      if (row.Status === 'disetujui' || row.Status === 'ditolak') return ( <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}> Telah Divalidasi </Typography> );
      if (row.Status === 'pending' || row.Status === 'diproses') return <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Menunggu Scan User</Typography>;
      return '-';
  };

  const renderTableContent = () => {
      const showInitialLoading = loading.table && distribusi.length === 0 && !loading.confirmation && !error; // Initial load
      const showSkeleton = loading.table && paginatedDistribusi.length === 0 && !showInitialLoading && !error; // Loading during filtering/pagination if data becomes empty temporarily
      const showNoDataMessage = !loading.table && !loading.confirmation && paginatedDistribusi.length === 0 && !error;

      if (showInitialLoading) {
          return ( <Box textAlign="center" py={4}> <CircularProgress /> <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}> {connectionStatus.slow ? "Koneksi lambat. Memuat data..." : "Memuat data..."} </Typography> </Box> );
      }
      return (
          <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: '8px', overflow: 'auto', '& .MuiTableHead-root': { backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[100], position: 'sticky', top: 0, zIndex: 1 } }} >
                  <Table sx={{ minWidth: 1200 }} stickyHeader>
                      <TableHead>
                          <TableRow>
                              <TableCell align="center" sx={{width: '3%', fontWeight: 'bold', fontSize: '0.9rem'}}>No.</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '100px'}}>Jenis</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '150px'}}>Plat</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '200px'}}>Lokasi Tujuan / Asal Plat</TableCell>
                              <TableCell align="right" sx={{fontWeight: 'bold', fontSize: '0.9rem'}}>Jumlah</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '150px'}}>User (Penerima/PIC)</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '120px'}}>Tgl Permintaan</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '140px'}}>Tgl Diterima User</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '140px'}}>Tgl Validasi Admin</TableCell>
                              <TableCell sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '120px'}}>Status</TableCell>
                              <TableCell align="center" sx={{fontWeight: 'bold', fontSize: '0.9rem'}}>QR</TableCell>
                              <TableCell align="center" sx={{fontWeight: 'bold', fontSize: '0.9rem', minWidth: '100px'}}>Aksi Admin</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {showSkeleton ? ( Array(rowsPerPage > 0 ? rowsPerPage : 5).fill(null).map((_, skeletonIndex) => ( <TableRow key={`skeleton-${skeletonIndex}`}> <TableCell colSpan={12}> <Box sx={{ height: 40, bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200', borderRadius: 1, animation: 'pulse 1.5s infinite ease-in-out', my: 0.5 }} /> </TableCell> </TableRow> )) ) : paginatedDistribusi.length > 0 ? ( paginatedDistribusi.map((row, index) => ( <TableRow key={row.ID_Distribusi} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover }, '& td, & th': { whiteSpace: 'nowrap', fontSize: '0.85rem' } }} >
                              <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                              <TableCell sx={{textTransform: 'capitalize'}}>{row.Jenis_distribusi || '-'}</TableCell>
                              <TableCell>{row.Nama_plat || '-'}</TableCell>
                              <TableCell>
                                  {row.Jenis_distribusi === 'keluar'
                                      ? (row.Nama_Lokasi || '-')
                                      : (row.Nama_Lokasi_Plat_Default || '-')
                                  }
                              </TableCell>
                              <TableCell align="right">{row.Jumlah}</TableCell>
                              <TableCell>{row.Username_Distribusi || '-'}</TableCell>
                              <TableCell>{row.Tanggal_permintaan ? new Date(row.Tanggal_permintaan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}</TableCell>
                              <TableCell>{row.Tanggal_distribusi ? new Date(row.Tanggal_distribusi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}</TableCell>
                              <TableCell>{row.Tanggal_validasi ? new Date(row.Tanggal_validasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}</TableCell>
                              <TableCell>{renderChip(row.Status)}</TableCell>
                              <TableCell align="center"> {row.qr_code ? ( <Tooltip title={`Buka QR: ${row.qr_code}`}> <IconButton onClick={() => { setGeneratedQrCode(row.qr_code); setGeneratedDistribusiId(row.ID_Distribusi); setOpenQrDialog(true); }} size="small" > <QRCodeCanvas size={20} value={row.qr_code} level="L" /> </IconButton> </Tooltip> ) : ('-')} </TableCell>
                              <TableCell align="center">{renderActionButtons(row)}</TableCell>
                          </TableRow> )) ) : null}
                          {showNoDataMessage && ( <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4 }}>{searchTerm ? `Tidak ada data distribusi untuk pencarian "${searchTerm}".` : (statusFilter === 'all' && jenisFilter === 'all' ? 'Tidak ada data distribusi.' : 'Tidak ada data distribusi dengan filter yang dipilih.')}{searchTerm && <Button size="small" onClick={handleClearSearch} sx={{ ml: 1 }}> Hapus Filter Pencarian </Button>}</TableCell></TableRow> )}
                          {error && !loading.table && !showInitialLoading && ( <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4, color: 'error.main' }}> Gagal memuat data: {error}. Coba refresh halaman. </TableCell></TableRow> )}
                      </TableBody>
                  </Table>
              </TableContainer>
              {paginatedDistribusi.length > 0 && !showSkeleton && ( <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={processedDistribusi.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Data per halaman:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`} sx={{ mt: 2, mr: -1 }} /> )}
          </>
      );
  };

  const renderFormField = (label, name, options, loadingState, placeholder) => {
      return (<><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography><FormControl fullWidth sx={{ mb: 2 }}>{loadingState ? ( <Box display="flex" alignItems="center" my={1} sx={{ color: 'text.secondary' }}> <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" /> <Typography variant="body2">Memuat {label.replace('*','').trim().toLowerCase()}...</Typography> </Box>) : (<Select name={name} value={form[name]} onChange={handleChange} displayEmpty disabled={loading.submit || loading.platCheckLoading} size="small" sx={{ borderRadius: '8px' }} MenuProps={{ PaperProps: { sx: { maxHeight: 250 }}}} required={label.includes('*')} ><MenuItem value="" disabled><em>{placeholder}</em></MenuItem>{options.length === 0 && !loadingState && ( <MenuItem value="" disabled><em>Tidak ada data {label.replace('*','').trim().toLowerCase()}</em></MenuItem> )}{options.map(option => (<MenuItem key={option.ID_User || option.ID_Plat || option.ID_Lokasi || option.id} value={option.ID_User || option.ID_Plat || option.ID_Lokasi || option.id} >{option.Username || option.Nama_plat || option.Nama_Lokasi || option.name}
      {name === "ID_Plat" && (option.Status || option.stok !== undefined) ? ` (${option.Status ? `Status: ${option.Status}` : ''}${option.Status && option.stok !== undefined ? ', ' : ''}${option.stok !== undefined ? `Stok: ${option.stok}` : ''})` : ''}</MenuItem>))}</Select>)}</FormControl></>);
  };

  const renderStatCard = (title, value, color, bgColor) => { return ( <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2}> <Card elevation={2} sx={{ backgroundColor: bgColor, borderRadius: '12px', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] }, height: '100%', display: 'flex', flexDirection: 'column' }} > <CardContent sx={{ flexGrow: 1, p: {xs: 1.5, sm:2} }}> <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography> <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color, mt: 0.5, mb: 0 }}>{value}</Typography> </CardContent> </Card> </Grid> ); };

  // ... (JSX lainnya tetap sama) ...

  return (
    <Container maxWidth={false} disableGutters sx={{p: { xs: 1, sm: 2 }}}>
      <Box mb={{xs: 2, sm: 3}}>
        <Box display="flex" alignItems="center" mb={1}> <DashboardIcon color="primary" sx={{ mr: 1 }} /> <Typography variant="body2" color="text.secondary"> Dashboard / Distribusi </Typography> </Box>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main"> Manajemen Distribusi </Typography>
      </Box>

      {!connectionStatus.online && ( <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}> Anda sedang offline. Fungsi mungkin terbatas. </Alert> )}
      {connectionStatus.online && connectionStatus.slow && !loading.table && !error && ( <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}> Koneksi lambat terdeteksi. Pemuatan data mungkin lebih lama. </Alert> )}

      <Card elevation={0} sx={{ mb: {xs:2, sm:3}, p: {xs: 1.5, sm: 2}, borderRadius: '12px', bgcolor: 'transparent' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.primary' }}> <DashboardIcon sx={{ mr: 1 }} fontSize="inherit" /> Ringkasan Status </Typography>
        <Grid container spacing={{xs: 1.5, sm: 2}}>
          {renderStatCard('Total', stats.total, theme.palette.text.primary, theme.palette.background.paper)}
          {renderStatCard('Pending', stats.pending, theme.palette.warning.main, theme.palette.background.paper)}
          {renderStatCard('Diproses User', stats.diproses, theme.palette.info.main, theme.palette.background.paper)}
          {renderStatCard('Terdistribusi User', stats.terdistribusi, theme.palette.primary.main, theme.palette.background.paper)}
          {renderStatCard('Disetujui Admin', stats.disetujui, theme.palette.success.main, theme.palette.background.paper)}
          {renderStatCard('Ditolak Admin', stats.ditolak, theme.palette.error.main, theme.palette.background.paper)}
        </Grid>
      </Card>

      <Paper elevation={1} sx={{p: {xs: 1.5, sm: 2}, mb: {xs:2, sm:3}, borderRadius: '12px'}}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} lg={7}>
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={{xs:1, sm:2}}>
                    <Box display="flex" alignItems="center" gap={0.5}> <FilterListIcon color="primary" /> <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Status:</Typography> <FormControl size="small" variant="outlined" sx={{ minWidth: {xs: 120, sm:150}, borderRadius: '8px' }}> <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 250 }}}} > <MenuItem value="all">Semua Status</MenuItem> {Object.entries(STATUS_CONFIG).map(([value, { label }]) => ( <MenuItem key={value} value={value}>{label}</MenuItem> ))} </Select> </FormControl> </Box>
                    <Box display="flex" alignItems="center" gap={0.5}> <CategoryIcon color="primary" /> <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Jenis:</Typography> <FormControl size="small" variant="outlined" sx={{ minWidth: {xs: 120, sm:150}, borderRadius: '8px' }}> <Select value={jenisFilter} onChange={(e) => setJenisFilter(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 250 }}}} > <MenuItem value="all">Semua Jenis</MenuItem> <MenuItem value="masuk">Masuk</MenuItem> <MenuItem value="keluar">Keluar</MenuItem> </Select> </FormControl> </Box>
                </Box>
            </Grid>
            <Grid item xs={12} lg={5}> <TextField fullWidth variant="outlined" size="small" placeholder="Cari (ID, jenis, plat, lokasi, user, QR)..." value={searchTerm} onChange={handleSearchChange} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon color="action" /> </InputAdornment> ), endAdornment: searchTerm && ( <InputAdornment position="end"> <Tooltip title="Hapus pencarian" arrow> <IconButton size="small" onClick={handleClearSearch} > <ClearIcon fontSize="small" /> </IconButton> </Tooltip> </InputAdornment> ), sx: { borderRadius: '8px' } }} /> </Grid>
            <Grid item xs={12}> <Box display="flex" gap={1} flexWrap="wrap" justifyContent={{xs: 'center', sm: 'flex-end'}}> <Button variant="contained" onClick={handleOpen} disabled={!connectionStatus.online || loading.table || loading.confirmation} startIcon={<AddCircleOutlineIcon />} color="primary" size="medium" sx={{ borderRadius: '8px' }} > Tambah Distribusi </Button> </Box> </Grid>
        </Grid>
      </Paper>

      {renderTableContent()}

      <Dialog open={open} onClose={loading.submit || loading.platCheckLoading ? undefined : handleClose} fullWidth maxWidth="sm" disableEscapeKeyDown={loading.submit || loading.platCheckLoading} PaperProps={{ sx: { borderRadius: '12px', m: { xs: 1, sm: 2 } } }} >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, py: 1.5, px:2 }}> <Typography variant="h6">Tambah Distribusi Baru</Typography> </DialogTitle>
        <DialogContent sx={{ p: {xs: 2, sm:3}, mt: 1 }}>
          {formError && (
            <Alert
              severity="error"
              onClose={() => setFormError('')}
              sx={{ mb: 2, borderRadius: '8px', whiteSpace: 'pre-wrap' }}
            >
              {formError}
            </Alert>
          )}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Jenis Distribusi *</Typography> <FormControl fullWidth sx={{ mb: 2 }}> <Select name="Jenis_distribusi" value={form.Jenis_distribusi} onChange={handleChange} displayEmpty disabled={loading.submit || loading.platCheckLoading } size="small" sx={{ borderRadius: '8px' }} required > <MenuItem value="" disabled><em>Pilih Jenis Distribusi</em></MenuItem> <MenuItem value="masuk">Masuk (Barang ke Gudang)</MenuItem> <MenuItem value="keluar">Keluar (Barang dari Gudang)</MenuItem> </Select> </FormControl> {renderFormField('Plat *', 'ID_Plat', platOptions, loading.platOptions, 'Pilih Plat')} {renderFormField( form.Jenis_distribusi === 'masuk' ? 'User PIC Gudang *' : 'User Penerima *', 'UserID', userOptions, loading.userOptions, form.Jenis_distribusi === 'masuk' ? 'Pilih User PIC Gudang' : 'Pilih User Penerima' )} {form.Jenis_distribusi === 'keluar' && ( renderFormField('Lokasi Tujuan *', 'ID_Lokasi_tujuan', lokasiOptions, loading.lokasiOptions, 'Pilih Lokasi Tujuan') )} <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Jumlah *</Typography> <TextField name="Jumlah" type="number" value={form.Jumlah} onChange={handleChange} fullWidth placeholder="0" inputProps={{ min: 1 }} disabled={loading.submit || loading.platCheckLoading} size="small" required InputProps={{ sx: { borderRadius: '8px' } }} /> </DialogContent>
        <Divider />
        <DialogActions sx={{ px: {xs:2, sm:3}, py: 1.5, bgcolor: theme.palette.background.default }}> <Button onClick={handleClose} disabled={loading.submit || loading.platCheckLoading} variant="text" sx={{ borderRadius: '8px' }} > Batal </Button> <Button onClick={handleSubmit} variant="contained" disabled={ loading.submit || loading.platOptions || loading.lokasiOptions || loading.userOptions || loading.platCheckLoading || !form.Jenis_distribusi || !form.ID_Plat || !form.UserID || !form.Jumlah || (form.Jenis_distribusi === 'keluar' && !form.ID_Lokasi_tujuan) } sx={{ borderRadius: '8px' }} > {loading.submit || loading.platCheckLoading ? ( <> <CircularProgress size={18} sx={{ mr: 1 }} color="inherit" /> {loading.submit ? 'Menyimpan...' : (loading.platCheckLoading ? 'Memeriksa Plat...' : 'Memproses...')} </> ) : (connectionStatus.slow ? 'Simpan (Lambat)' : 'Simpan Distribusi')} </Button> </DialogActions>
      </Dialog>

      <Dialog
        open={openQrDialog}
        onClose={handleCloseQrDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', m: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.success.dark, color: theme.palette.success.contrastText, py: 1.5, px:2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
          <Typography variant="h6">QR Code Distribusi</Typography>
          <IconButton onClick={handleCloseQrDialog} sx={{color: theme.palette.success.contrastText}} > <ClearIcon/> </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: {xs:2, sm:3}, textAlign: 'center' }}>
          {generatedQrCode ? (
            // Konten yang akan dicetak direferensikan oleh componentRef
            <Box 
                ref={componentRef} // Referensi untuk useReactToPrint
                className="print-container" // Kelas untuk styling print khusus jika diperlukan
                sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: '8px', 
                    mt:1, 
                    background: 'white' // Pastikan background putih untuk print
                }}
            >
              <Typography variant="h6" className="print-qr-id" sx={{ mb: 1, color: 'black' /* Pastikan teks hitam */ }}> 
                ID Distribusi: <strong>{generatedDistribusiId}</strong> 
              </Typography>
              <Box display="flex" justifyContent="center" my={2}>
                <QRCodeCanvas // Ini akan menjadi bagian dari componentRef
                  key={generatedQrCode} // Re-render jika QR berubah
                  value={generatedQrCode}
                  size={Math.min(250, typeof window !== 'undefined' ? window.innerWidth - 140 : 250)} // Ukuran dinamis
                  level="H" // Error correction level tinggi
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  className="qr-code-canvas" // Kelas untuk styling print khusus jika diperlukan
                />
              </Box>
              <Typography variant="caption" className="print-qr-code-value" color="text.secondary" sx={{ wordBreak: 'break-all', fontSize: '0.7rem', color: 'black' /* Pastikan teks hitam */ }}> 
                Kode: {generatedQrCode} 
              </Typography>
            </Box>
          ) : (
            <Typography>QR Code tidak dapat ditampilkan. Kode tidak tersedia.</Typography>
          )}
        </DialogContent>
        <Divider className="no-print"/>
        <DialogActions sx={{ px: {xs:2, sm:3}, py: 1.5, bgcolor: theme.palette.background.default, justifyContent: 'space-between' }} className="no-print">
          <Button onClick={handleCloseQrDialog} variant="outlined" color="primary" sx={{ borderRadius: '8px' }} > Tutup </Button>
          <Button
            onClick={triggerPrint} // Menggunakan fungsi dari useReactToPrint
            variant="contained"
            color="primary"
            startIcon={isPreparingPrint ? <CircularProgress size={20} color="inherit"/> : <PrintIcon />}
            sx={{ borderRadius: '8px' }}
            disabled={!generatedQrCode || loading.table || isPreparingPrint} // isPreparingPrint dikontrol oleh useReactToPrint
          >
            {isPreparingPrint ? 'Menyiapkan...' : 'Print QR'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog.isOpen} onClose={loading.confirmation ? undefined : closeConfirmationDialog} disableEscapeKeyDown={loading.confirmation} PaperProps={{ sx: { borderRadius: '12px', m: { xs: 1, sm: 2 } } }} maxWidth="xs" fullWidth >
        <DialogTitle sx={{bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, py: 1.5, px:2 }}> <Typography variant="h6">{confirmDialog.title}</Typography> </DialogTitle>
        <DialogContent sx={{ p: {xs: 2, sm:3}, mt:1 }}> <Typography>{confirmDialog.message}</Typography> </DialogContent>
        <Divider />
        <DialogActions sx={{ px: {xs:2, sm:3}, py: 1.5, bgcolor: theme.palette.background.default }}> <Button onClick={closeConfirmationDialog} disabled={loading.confirmation} variant="text" sx={{ borderRadius: '8px' }}> Batal </Button> <Button onClick={confirmDialog.onConfirm} color="primary" variant="contained" disabled={loading.confirmation} sx={{ borderRadius: '8px' }} > {loading.confirmation ? <CircularProgress size={20} color="inherit" sx={{mr:1}}/> : 'Ya, Lanjutkan'} </Button> </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled"> {snackbarMessage} </Alert>
      </Snackbar>
    </Container>
  );
}

export default function DistribusiAdminPage() {
  return (
    <Layout title="Manajemen Distribusi">
      <DistribusiAdminContent />
    </Layout>
  );
}