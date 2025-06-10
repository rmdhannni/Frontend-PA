// src/pages/Plat.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Fade,
  Divider,
  Grid,
  Backdrop,
  Container,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Layout from '../components/partials/Layout';
import { getAllPlat, deletePlat } from '../services/platService';
import { getAllLokasi } from '../services/lokasiService';

const Plat = () => {
  const [plat, setPlat] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [selectedPlats, setSelectedPlats] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();

  const getLokasiName = useCallback((idLokasi) => {
    if (!lokasi || lokasi.length === 0) {
      return `ID: ${idLokasi}`;
    }
    const lokasiItem = lokasi.find(loc => loc.ID_Lokasi === idLokasi);
    return lokasiItem ? lokasiItem.Nama_Lokasi : `ID: ${idLokasi}`;
  }, [lokasi]);

  const filteredPlat = useMemo(() => {
    if (!plat || plat.length === 0) return [];
    if (!searchTerm || searchTerm.trim() === '') return plat;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    return plat.filter(item => {
      const namaPlat = (item.Nama_plat || '').toLowerCase();
      const lotBatch = (item.Lot_Batch_Number || '').toLowerCase();
      const idPlat = (item.ID_Plat || '').toString();
      const lokasiName = getLokasiName(item.ID_Lokasi).toLowerCase();
      const status = (item.Status || '').toLowerCase();
      const stok = (item.stok || '').toString();

      return (
        namaPlat.includes(lowerCaseSearchTerm) ||
        lotBatch.includes(lowerCaseSearchTerm) ||
        idPlat.includes(lowerCaseSearchTerm) ||
        lokasiName.includes(lowerCaseSearchTerm) ||
        stok.includes(lowerCaseSearchTerm) ||
        status.includes(lowerCaseSearchTerm)
      );
    });
  }, [plat, searchTerm, getLokasiName]);

  const currentPagePlats = useMemo(() => {
    return filteredPlat.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPlat, page, rowsPerPage]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh && plat.length === 0) setLoading(true);
    else if (isRefresh) setLoading(true);

    setError(null);
    try {
      const [platData, lokasiData] = await Promise.all([
        getAllPlat(),
        getAllLokasi().catch(err => {
          console.error('Error fetching lokasi data:', err);
          setError(prev => (prev ? prev + "\n" : "") + 'Gagal memuat data lokasi.');
          return [];
        })
      ]);
      setPlat((platData || []).slice().reverse());
      setLokasi(lokasiData || []);
    } catch (err) {
      console.error('Error fetching data plat utama:', err);
      setError('Gagal mengambil data plat. Silakan coba lagi nanti.');
      setPlat([]);
    } finally {
      setLoading(false);
      setSelectedPlats([]);
      setSelectAll(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleFocus = () => {
      fetchData(true);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData]);

  useEffect(() => {
    setPage(0);
    setSelectAll(false);
  }, [searchTerm]);

  const handleDeleteClick = (id, name) => setDeleteDialog({ open: true, id, name });
  const handleDeleteCancel = () => setDeleteDialog({ open: false, id: null, name: '' });

  const handleDeleteConfirm = async () => {
    const { id } = deleteDialog;
    setDeleteLoading(true);
    setError(null);
    try {
      await deletePlat(id);
      await fetchData(true);
      setDeleteDialog({ open: false, id: null, name: '' });
    } catch (err) {
      console.error('Error deleting plat:', err);
      let errorMessage = 'Gagal menghapus data. ';
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        switch (status) {
          case 404: errorMessage += 'Data tidak ditemukan.'; break;
          case 403: errorMessage += 'Tidak memiliki izin.'; break;
          case 409: errorMessage += 'Data masih digunakan oleh entitas lain.'; break;
          case 500: errorMessage += 'Kesalahan server.'; break;
          default: errorMessage += data?.message || `Error ${status}.`;
        }
      } else if (err.request) {
        errorMessage += 'Server tidak merespon.';
      } else {
        errorMessage += err.message || 'Kesalahan tidak diketahui.';
      }
      setError(errorMessage);
      setDeleteDialog({ open: false, id: null, name: '' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearSearch = () => setSearchTerm('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready': return 'success';
      case 'Tidak Tersedia': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ready': return <CheckCircleIcon fontSize="small" />;
      case 'Tidak Tersedia': return <WarningIcon fontSize="small" />;
      default: return null;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectAll(false);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectAll(false);
  };

  const handleSelectPlat = (id) => {
    setSelectedPlats(prev => 
      prev.includes(id) 
        ? prev.filter(platId => platId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = currentPagePlats.map(item => item.ID_Plat);
      setSelectedPlats(allIds);
      setSelectAll(true);
    } else {
      setSelectedPlats([]);
      setSelectAll(false);
    }
  };

  const handlePrintSelected = () => {
    if (selectedPlats.length === 0) {
      setError('Pilih setidaknya satu plat untuk dicetak');
      return;
    }
    
    const selectedPlatData = plat.filter(item => selectedPlats.includes(item.ID_Plat));
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar Plat Terpilih</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1976d2; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 20px; font-size: 12px; text-align: right; }
            .status-ready { color: #2e7d32; font-weight: bold; }
            .status-tidak-tersedia { color: #d32f2f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Data Plat</h1>
            <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>Jumlah Plat: ${selectedPlats.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Plat</th>
                <th>Lot/Batch</th>
                <th>Stok</th>
                <th>Lokasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPlatData.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.Nama_plat || '-'}</td>
                  <td>${item.Lot_Batch_Number || '-'}</td>
                  <td>${item.stok || '0'}</td>
                  <td>${getLokasiName(item.ID_Lokasi) || '-'}</td>
                  <td class="${item.Status === 'Ready' ? 'status-ready' : 'status-tidak-tersedia'}">
                    ${item.Status || '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Dicetak oleh Sistem Manajemen Plat</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    };
  };

  if (loading && plat.length === 0 && !error) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}> Memuat Data Plat... </Typography>
        </Box>
      </Backdrop>
    );
  }

  return (
    <Layout title="Data Plat">
      <Container maxWidth="xl">
        <Box component="main" sx={{ flexGrow: 1, pt: 0, pb: 4 }} >
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }} >
            <Box sx={{ p: 3, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', color: 'white' }} >
              <Grid container alignItems="center" spacing={2}>
                <Grid item> <StorageIcon fontSize="large" /> </Grid>
                <Grid item> <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Data Plat </Typography> </Grid>
              </Grid>
            </Box>
            <Divider />
            <CardContent>
              {error && ( <Alert severity="error" sx={{ mb: 3 }} variant="filled" onClose={() => setError(null)} > {error} </Alert> )}

              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12} sm="auto">
                  <Button variant="contained" color="primary" onClick={() => navigate('/plat/add')} startIcon={<AddIcon />} sx={{ borderRadius: 2, px: 3, py: 1, boxShadow: 3, width: {xs: '100%', sm: 'auto'} }} >
                    Tambahkan Data Plat
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button variant="outlined" color="primary" onClick={() => fetchData(true)} startIcon={<RefreshIcon />} disabled={loading} sx={{ borderRadius: 2, px: 3, py: 1, width: {xs: '100%', sm: 'auto'} }} >
                    {loading && plat.length > 0 ? <CircularProgress size={20} sx={{mr:1}} /> : null} Refresh
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handlePrintSelected} 
                    startIcon={<PrintIcon />}
                    disabled={selectedPlats.length === 0}
                    sx={{ borderRadius: 2, px: 3, py: 1, boxShadow: 3, width: {xs: '100%', sm: 'auto'} }}
                  >
                    Cetak ({selectedPlats.length})
                  </Button>
                </Grid>
                <Grid item xs={12} sm>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Cari plat (nama, lot, ID, lokasi, status, stok)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: ( <InputAdornment position="start"> <SearchIcon color="action" /> </InputAdornment> ),
                      endAdornment: searchTerm && ( <InputAdornment position="end"> <Tooltip title="Hapus pencarian" arrow> <IconButton size="small" onClick={handleClearSearch} > <ClearIcon fontSize="small" /> </IconButton> </Tooltip> </InputAdornment> ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
              </Grid>

              {searchTerm && ( <Alert severity="info" sx={{ mb: 2 }} variant="outlined" > Menampilkan {filteredPlat.length} hasil untuk "{searchTerm}" </Alert> )}

              {filteredPlat.length === 0 && !loading ? (
                <Alert severity="info" variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2 }} >
                  {searchTerm ? <> Tidak ada data plat sesuai "{searchTerm}". <Button size="small" onClick={handleClearSearch} sx={{ ml: 1 }} > Hapus Filter </Button> </> : 'Tidak ada data plat tersedia.' }
                </Alert>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', boxShadow: 2, mb: 2 }} >
                    <Table sx={{ minWidth: 900 }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              indeterminate={selectedPlats.length > 0 && selectedPlats.length < currentPagePlats.length}
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: '5%' }}>No.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nama Plat</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Lot/Batch</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Stok</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Lokasi</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(loading && plat.length > 0 ? Array(rowsPerPage).fill(null) : currentPagePlats)
                          .map((item, index) => (
                            loading && plat.length > 0 ? (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell colSpan={8}><Box sx={{height: 40, bgcolor: 'grey.200', animation: 'pulse 1.5s infinite ease-in-out'}} /></TableCell>
                                </TableRow>
                            ) : (
                            <TableRow
                              key={item.ID_Plat}
                              sx={{ '&:hover': { bgcolor: '#f0f7ff' }, bgcolor: hoveredRow === item.ID_Plat ? '#f0f7ff' : 'inherit', transition: 'background-color 0.2s ease' }}
                              onMouseEnter={() => setHoveredRow(item.ID_Plat)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="primary"
                                  checked={selectedPlats.includes(item.ID_Plat)}
                                  onChange={() => handleSelectPlat(item.ID_Plat)}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 'medium' }}> {(page * rowsPerPage) + index + 1} </TableCell>
                              <TableCell sx={{ fontSize: '0.85rem' }}>{item.Nama_plat}</TableCell>
                              <TableCell sx={{ fontSize: '0.85rem' }}>{item.Lot_Batch_Number}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.stok}</TableCell>
                              <TableCell sx={{ fontSize: '0.85rem' }}> <Chip label={getLokasiName(item.ID_Lokasi)} color="info" variant="outlined" size="small" sx={{ fontWeight: 'medium' }} /> </TableCell>
                              <TableCell align="center" sx={{ fontSize: '0.85rem' }}> <Chip icon={getStatusIcon(item.Status)} label={item.Status} color={getStatusColor(item.Status)} variant="filled" size="small" sx={{ fontWeight: 'medium' }} /> </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit Data" arrow TransitionComponent={Fade}>
                                  <IconButton color="primary" onClick={() => navigate(`/plat/update/${item.ID_Plat}`)} sx={{ mx: 0.5, '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)', transform: 'scale(1.1)', transition: 'transform 0.2s' } }} > <EditIcon fontSize="small"/> </IconButton>
                                </Tooltip>
                                <Tooltip title="Hapus Data" arrow TransitionComponent={Fade}>
                                  <IconButton color="error" onClick={() => handleDeleteClick(item.ID_Plat, item.Nama_plat)} disabled={deleteLoading} sx={{ mx: 0.5, '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)', transform: 'scale(1.1)', transition: 'transform 0.2s' } }} > <DeleteIcon fontSize="small"/> </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            )
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination 
                    rowsPerPageOptions={[5, 10, 25, 50]} 
                    component="div" 
                    count={filteredPlat.length} 
                    rowsPerPage={rowsPerPage} 
                    page={page} 
                    onPageChange={handleChangePage} 
                    onRowsPerPageChange={handleChangeRowsPerPage} 
                    labelRowsPerPage="Data per halaman:" 
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`} 
                  />
                </>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                 Total Data Plat: {plat.length} {searchTerm && `(Hasil filter: ${filteredPlat.length})`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} aria-labelledby="delete-dialog-title" maxWidth="sm" fullWidth >
          <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}> <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <WarningIcon /> Konfirmasi Hapus </Box> </DialogTitle>
          <DialogContent> <DialogContentText> Apakah Anda yakin ingin menghapus "<strong>{deleteDialog.name}</strong>" (ID: {deleteDialog.id})? <br /><br /> <em>Tindakan ini tidak dapat dibatalkan.</em> </DialogContentText> </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleDeleteCancel} variant="outlined" disabled={deleteLoading} > Batal </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading} startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />} > {deleteLoading ? 'Menghapus...' : 'Hapus'} </Button>
          </DialogActions>
        </Dialog>

        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={deleteLoading || (loading && plat.length === 0 && !error)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress color="inherit" />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {deleteLoading ? 'Menghapus data...' : (loading && plat.length === 0 && !error ? 'Memuat Data Plat...' : '')}
            </Typography>
          </Box>
        </Backdrop>
      </Container>
    </Layout>
  );
};

export default Plat;