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
  Checkbox,
  // --- BARU: Import untuk panduan ---
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
// --- BARU: Ikon untuk tombol panduan ---
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Layout from '../components/partials/Layout';
import { getAllPlat, deletePlat } from '../services/platService';
import { getAllLokasi } from '../services/lokasiService';

// Import logos
import logoBumn from '../assets/logo-bumn.png';
import logoDefendId from '../assets/logo-defendid.png';
import logoPtPal from '../assets/logo-pt-pal-biru.png';


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
  // --- BARU: State untuk dialog panduan ---
  const [openGuide, setOpenGuide] = useState(false);

  const navigate = useNavigate();

  // --- BARU: Handler untuk membuka dan menutup dialog panduan ---
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);

  // ... (semua fungsi dan hook lainnya tetap sama)
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
  }, [plat.length]);

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
    setSelectedPlats([]);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectAll(false);
    setSelectedPlats([]);
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
    
    const tableRows = selectedPlatData.map((item, index) => `
        <tr>
            <td style="text-align: center; padding: 5px;">${index + 1}</td>
            <td style="padding: 5px;">${item.Nama_plat || '-'}</td>
            <td style="padding: 5px;">${item.Lot_Batch_Number || '-'}</td>
            <td style="text-align: right; padding: 5px;">${item.stok || '0'}</td>
            <td style="padding: 5px;">${getLokasiName(item.ID_Lokasi) || '-'}</td>
            <td style="text-align: center; padding: 5px;">${item.Status || '-'}</td>
        </tr>
    `).join('');
    
    const printContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MEMORANDUM - PT PAL INDONESIA</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                html, body {
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 11pt;
                }
                .page-wrapper {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 0.7in 0.5in 0.5in 0.5in;
                    box-sizing: border-box;
                }
                .header {
                    text-align: center;
                }
                .header h1 {
                    margin: 20px 0;
                    font-weight: bold;
                    font-size: 14pt;
                    letter-spacing: 4px;
                }
                .logo-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .logo-left {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .logo-container img {
                    max-height: 180px;
                    width: 180px;
                }
                .main-content {
                    flex-grow: 1;
                    padding-top: 20px;
                    font-size: 12pt;
                    line-height: 1.5;
                }
                .footer {
                    text-align: center;
                    font-size: 9pt;
                    color: black;
                    padding-top: 10px;
                    border-top: 2px solid black;
                }
                .footer p {
                    margin: 2px 0;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 10pt;
                }
                .data-table th, .data-table td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }
                .data-table th {
                    background-color: #e0e0e0;
                    font-weight: bold;
                    text-align: center;
                }
                @media print {
                    body {
                        background-color: white;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-wrapper">
                <header class="header">
                    <div class="logo-container">
                        <div class="logo-left">
                            <img src="${logoBumn}" alt="Logo BUMN">
                            <img src="${logoDefendId}" alt="Logo Defend ID">
                        </div>
                        <img src="${logoPtPal}" alt="Logo PT PAL Indonesia">
                    </div>
                    <h1>M E M O R A N D U M</h1> 
                </header>

                <main class="main-content">
                    <p><strong>Perihal:</strong> Laporan Data Plat Material</p>
                    <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>Dengan hormat,</p>
                    <p>Berikut ini adalah laporan data plat material yang telah dipilih dari sistem manajemen inventaris:</p>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Nama Plat</th>
                                <th>Lot/Batch Number</th>
                                <th>Stok</th>
                                <th>Lokasi</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    
                    <p style="margin-top: 20px;">Demikian memorandum ini dibuat untuk dapat dipergunakan sebagaimana mestinya. Atas perhatiannya, kami ucapkan terima kasih.</p>
                    
                    <div style="margin-top: 50px; text-align: right; page-break-inside: avoid;">
                        <p>Surabaya, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>Kepala Biro Dukungan Dan Pergudangan,</p>
                        <br/><br/><br/><br/>
                        <p><strong>(________________________)</strong></p>
                        <p><em>Muslich Hardian</em></p>
                    </div>
                </main>

                <footer class="footer">
                    <p>Kantor Pusat : PT PAL INDONESIA, UJUNG SURABAYA PO. BOX. 1134 INDONESIA. Web Site : http://www.pal.co.id</p>
                    <p>Telp. +62-31-3292275 (Hunting) Fax : +62-31-3292530, 3292493, 3292516, E-Mail : headoffice@pal.co.id</p> 
                    <p>Kantor Perwakilan : Jl. TANAH ABANG II / 27 JAKARTA 10160, PHONE +62-21-3846833 , Fax : +62-21-3843717, E-Mail : jakartabranch@pal.co.id</p> 
                </footer>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
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

              {/* DIUBAH: Menggunakan Stack untuk merapikan grup tombol */}
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12} md="auto">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button variant="contained" color="primary" onClick={() => navigate('/plat/add')} startIcon={<AddIcon />} sx={{ borderRadius: 2, px: 3, py: 1 }} >
                      Tambahkan Data Plat
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => fetchData(true)} startIcon={<RefreshIcon />} disabled={loading} sx={{ borderRadius: 2, px: 3, py: 1 }} >
                      {loading && plat.length > 0 ? <CircularProgress size={20} sx={{mr:1}} /> : null} Refresh
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handlePrintSelected} startIcon={<PrintIcon />} disabled={selectedPlats.length === 0} sx={{ borderRadius: 2, px: 3, py: 1 }} >
                      Cetak ({selectedPlats.length})
                    </Button>
                    {/* --- BARU: Tombol untuk membuka panduan --- */}
                    <Button variant="outlined" color="info" onClick={handleOpenGuide} startIcon={<HelpOutlineIcon />} sx={{ borderRadius: 2, px: 3, py: 1 }} >
                      Panduan
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md>
                  <TextField fullWidth variant="outlined" placeholder="Cari plat (nama, lot, ID, lokasi, status, stok)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
                <Alert severity="warning" variant="outlined" sx={{ p: 3, borderRadius: 2 }} >
                  {searchTerm ? <> Tidak ada data plat sesuai "{searchTerm}". <Button size="small" onClick={handleClearSearch} sx={{ ml: 1 }} > Hapus Filter </Button> </> : 'Tidak ada data plat tersedia.' }
                </Alert>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', boxShadow: 2, mb: 2 }} >
                    <Table sx={{ minWidth: 900 }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell padding="checkbox">
                            <Checkbox color="primary" indeterminate={selectedPlats.length > 0 && selectedPlats.length < currentPagePlats.length} checked={selectAll} onChange={handleSelectAll} />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>No.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nama Plat</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lot/Batch</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stok</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
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
                              <TableRow key={item.ID_Plat} hover onMouseEnter={() => setHoveredRow(item.ID_Plat)} onMouseLeave={() => setHoveredRow(null)} >
                                <TableCell padding="checkbox">
                                  <Checkbox color="primary" checked={selectedPlats.includes(item.ID_Plat)} onChange={() => handleSelectPlat(item.ID_Plat)} />
                                </TableCell>
                                <TableCell align="center"> {(page * rowsPerPage) + index + 1} </TableCell>
                                <TableCell>{item.Nama_plat}</TableCell>
                                <TableCell>{item.Lot_Batch_Number}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.stok}</TableCell>
                                <TableCell> <Chip label={getLokasiName(item.ID_Lokasi)} color="info" variant="outlined" size="small" /> </TableCell>
                                <TableCell align="center"> <Chip icon={getStatusIcon(item.Status)} label={item.Status} color={getStatusColor(item.Status)} size="small" /> </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Edit Data" arrow>
                                    <IconButton size="small" color="primary" onClick={() => navigate(`/plat/update/${item.ID_Plat}`)} > <EditIcon /> </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Hapus Data" arrow>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(item.ID_Plat, item.Nama_plat)} disabled={deleteLoading} > <DeleteIcon /> </IconButton>
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
        
        {/* --- BARU: Dialog untuk panduan penggunaan --- */}
        <Dialog open={openGuide} onClose={handleCloseGuide} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <HelpOutlineIcon sx={{ mr: 1 }} />
                Panduan Halaman Data Plat
            </DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>
                    Halaman ini digunakan untuk mengelola data inventaris plat material. Berikut adalah fungsi utama yang tersedia:
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemIcon><AddIcon color="primary"/></ListItemIcon>
                        <ListItemText primary="Menambah Data Plat" secondary="Gunakan tombol 'Tambahkan Data Plat' untuk masuk ke halaman formulir dan membuat data plat baru."/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><SearchIcon color="action"/></ListItemIcon>
                        <ListItemText primary="Mencari Data" secondary="Ketik kata kunci pada kolom pencarian untuk memfilter data berdasarkan nama, lot/batch, ID, lokasi, status, atau stok."/>
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><Checkbox checked readOnly color="primary" size="small" sx={{ml:0.5}} /></ListItemIcon>
                        <ListItemText primary="Memilih Data" secondary="Centang kotak pada setiap baris untuk memilih satu atau lebih data. Gunakan checkbox di header tabel untuk memilih semua data pada halaman yang sedang aktif."/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><PrintIcon color="secondary"/></ListItemIcon>
                        <ListItemText primary="Mencetak Memorandum" secondary="Setelah memilih data, tombol 'Cetak' akan aktif. Klik tombol ini untuk menghasilkan dokumen memorandum resmi dalam format A4 yang siap untuk dicetak."/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><EditIcon color="action"/></ListItemIcon>
                        <ListItemText primary="Mengedit Data" secondary="Klik ikon pensil pada kolom 'Aksi' untuk mengubah detail dari data plat yang bersangkutan."/>
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><DeleteIcon color="error"/></ListItemIcon>
                        <ListItemText primary="Menghapus Data" secondary="Klik ikon tong sampah untuk menghapus data. Anda akan diminta untuk melakukan konfirmasi sebelum data dihapus secara permanen."/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><RefreshIcon color="primary"/></ListItemIcon>
                        <ListItemText primary="Refresh Data" secondary="Klik tombol 'Refresh' untuk memuat ulang data terbaru dari server. Ini juga berguna jika Anda ingin menyinkronkan data setelah ada perubahan di tab lain."/>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseGuide}>Tutup</Button>
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