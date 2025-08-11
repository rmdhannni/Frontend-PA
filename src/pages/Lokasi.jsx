import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Fade,
  Tooltip,
  Alert,
  Snackbar,
  // --- BARU: Import untuk Dialog, List, dan Stack ---
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Ikon
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // --- BARU: Ikon untuk tombol panduan

// Asumsi Anda memiliki komponen Layout
import Layout from '../components/partials/Layout'; 

const Lokasi = () => {
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // --- BARU: State untuk mengontrol visibilitas dialog panduan ---
  const [openGuide, setOpenGuide] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/lokasi');
        setLokasiList(response.data);
      } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        setSnackbar({ open: true, message: 'Gagal memuat data lokasi.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchLokasi();
  }, []);

  const handleDelete = async (idLokasi) => {
    // ... (Fungsi handleDelete tidak berubah)
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/lokasi/${idLokasi}`);
      setLokasiList((prev) => prev.filter((lokasi) => lokasi.ID_Lokasi !== idLokasi));
      setSnackbar({ open: true, message: 'Lokasi berhasil dihapus', severity: 'success' });
    } catch (error) {
      console.error('Gagal menghapus lokasi:', error);
      setSnackbar({ open: true, message: 'Gagal menghapus lokasi', severity: 'error' });
    }
  };

  const formatCoordinates = (latitude, longitude) => `${latitude}, ${longitude}`;
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // --- BARU: Fungsi untuk membuka dan menutup dialog panduan ---
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);


  return (
    <Layout title="Data Lokasi">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }}>
        <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <CardContent sx={{ py: 4, color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <MapIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" align="center" sx={{ fontSize: {xs: '1.5rem', md: '2.2rem'}, fontWeight: 'bold' }}>
                Data Lokasi
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* --- DIUBAH: Kelompokkan tombol-tombol aksi --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', alignSelf: 'center' }}>
            Kelola semua informasi lokasi pada sistem
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<HelpOutlineIcon />} onClick={handleOpenGuide}>
              Panduan
            </Button>
            <Button variant="contained" startIcon={<AddLocationIcon />} onClick={() => navigate('/lokasi/add')} sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', '&:hover': { background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)' } }}>
              Tambahkan Lokasi
            </Button>
          </Stack>
        </Box>

        {/* --- DIUBAH: Logika render konten utama --- */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography>Memuat data...</Typography>
          </Box>
        ) : (
          <Fade in={!loading} timeout={500}>
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nama Lokasi</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Latitude</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Longitude</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lokasiList.length > 0 ? (
                      lokasiList.map((lokasi) => (
                        <TableRow key={lokasi.ID_Lokasi} sx={{ '&:hover': { backgroundColor: '#f1f8fe' } }}>
                          <TableCell align="center"><Chip label={lokasi.ID_Lokasi} size="small" color="primary" variant="outlined"/></TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />{lokasi.Nama_Lokasi}</Box></TableCell>
                          <TableCell align="center">{lokasi.latitude}</TableCell>
                          <TableCell align="center">{lokasi.longitude}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Hapus lokasi" arrow>
                              <IconButton color="error" onClick={() => handleDelete(lokasi.ID_Lokasi)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // DIUBAH: Pesan saat data kosong, ditampilkan di dalam tabel
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                          <Typography color="text.secondary">
                            Tidak ada data lokasi yang tersedia.
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Klik tombol "Tambahkan Lokasi" untuk membuat data baru.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Fade>
        )}
      </Box>

      {/* --- BARU: Komponen Dialog untuk Panduan --- */}
      <Dialog open={openGuide} onClose={handleCloseGuide} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          Panduan Penggunaan Halaman Lokasi
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Halaman ini berfungsi untuk mengelola data semua lokasi yang akan digunakan dalam sistem. Berikut adalah beberapa hal yang bisa Anda lakukan:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><AddLocationIcon color="success" /></ListItemIcon>
              <ListItemText 
                primary="Menambahkan Lokasi Baru" 
                secondary="Klik tombol 'Tambahkan Lokasi' untuk membuka formulir penambahan lokasi baru, lalu buka web open street map, pilih lokasi yang ditempatkan, pencet plik kanan, pilih 'copy latitude, longitude', dan masukkan koordinat tersebut ke dalam formulir." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="Menghapus Lokasi" 
                secondary="Pada setiap baris data di tabel, terdapat ikon tong sampah. Klik ikon tersebut untuk menghapus data lokasi yang tidak lagi diperlukan." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MapIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Melihat Data Lokasi" 
                secondary="Semua lokasi yang tersimpan akan ditampilkan dalam bentuk tabel di halaman ini, lengkap dengan ID, nama, dan koordinatnya." 
              />
            </ListItem>
          </List>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 2 }}>
            Pastikan data koordinat (latitude dan longitude) yang Anda masukkan akurat untuk fungsionalitas peta yang benar.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGuide} color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Lokasi;