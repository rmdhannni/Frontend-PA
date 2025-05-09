import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  Select, MenuItem, TextField, Chip, Card, CardContent, Grid
} from '@mui/material';
import { getCurrentUser } from '../utils/auth';

const BASE_URL = 'http://localhost:3000';

const UserDashboard = () => {
  const [distribusi, setDistribusi] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ID_Plat: '', ID_Lokasi_tujuan: '', Jumlah: '' });
  const [platOptions, setPlatOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const user = getCurrentUser();
  const userId = user?.id;

  const fetchDistribusi = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/distribusi/user/${userId}`);
      setDistribusi(res.data);
    } catch (err) {
      console.error('Gagal mengambil data distribusi:', err);
    }
  };

  const fetchOptions = async () => {
    try {
      const [platRes, lokasiRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/plat`),
        axios.get(`${BASE_URL}/api/lokasi`)
      ]);
      setPlatOptions(platRes.data);
      setLokasiOptions(lokasiRes.data);
    } catch (err) {
      console.error('Gagal mengambil data plat/lokasi:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchOptions();
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${BASE_URL}/api/distribusi`, { ...form, UserID: userId });
      handleClose();
      fetchDistribusi();
    } catch (err) {
      console.error('Gagal menambahkan distribusi:', err);
      alert('Gagal menambahkan distribusi');
    }
  };

  // Fungsi untuk mengubah status distribusi menjadi "terdistribusi"
  const handleDistribusiSelesai = async (id) => {
    try {
      // Format tanggal untuk MySQL (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const tanggal_distribusi = now.getFullYear() + '-' + 
                                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(now.getDate()).padStart(2, '0') + ' ' + 
                                String(now.getHours()).padStart(2, '0') + ':' + 
                                String(now.getMinutes()).padStart(2, '0') + ':' + 
                                String(now.getSeconds()).padStart(2, '0');
      
      // Debug
      console.log('Mengirim data untuk ID:', id);
      console.log('Status: terdistribusi');
      console.log('Tanggal distribusi:', tanggal_distribusi);
      
      const response = await axios.put(`${BASE_URL}/api/distribusi/status/${id}`, { 
        status: 'terdistribusi',
        tanggal_distribusi: tanggal_distribusi
      });
      
      console.log('Response dari server:', response.data);
      fetchDistribusi();
      alert('Distribusi berhasil ditandai sebagai selesai!');
    } catch (err) {
      console.error('Gagal mengubah status distribusi:', err);
      if (err.response) {
        // Log detail respons error untuk debugging
        console.error('Detail error:', err.response.data);
        console.error('Status code:', err.response.status);
      }
      alert('Gagal mengubah status distribusi');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDistribusi();
    }
  }, [userId]);

  // Fungsi untuk mendapatkan chip warna berdasarkan status
  const getStatusChip = (status) => {
    switch(status) {
      case 'pending':
        return <Chip label="Pending" color="warning" />;
      case 'diproses':
        return <Chip label="Diproses" color="info" />;
      case 'terdistribusi':
        return <Chip label="Terdistribusi" color="primary" />;
      case 'disetujui':
        return <Chip label="Disetujui" color="success" />;
      case 'ditolak':
        return <Chip label="Ditolak" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Menghitung jumlah distribusi berdasarkan status
  const countByStatus = {
    total: distribusi.length,
    pending: distribusi.filter(d => d.Status === 'pending').length,
    terdistribusi: distribusi.filter(d => d.Status === 'terdistribusi').length,
    disetujui: distribusi.filter(d => d.Status === 'disetujui').length,
    ditolak: distribusi.filter(d => d.Status === 'ditolak').length
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Dashboard User</Typography>
      
      {/* Dashboard Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6">Total Tugas</Typography>
              <Typography variant="h3">{countByStatus.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff9c4' }}>
            <CardContent>
              <Typography variant="h6">Menunggu</Typography>
              <Typography variant="h3">{countByStatus.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#bbdefb' }}>
            <CardContent>
              <Typography variant="h6">Terdistribusi</Typography>
              <Typography variant="h3">{countByStatus.terdistribusi}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#c8e6c9' }}>
            <CardContent>
              <Typography variant="h6">Disetujui</Typography>
              <Typography variant="h3">{countByStatus.disetujui}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Daftar Tugas Distribusi</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpen}
        >
          Tambah Distribusi
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Plat</TableCell>
              <TableCell>Lokasi Tujuan</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distribusi.map((row) => (
              <TableRow key={row.ID_Distribusi}>
                <TableCell>{row.ID_Distribusi}</TableCell>
                <TableCell>{row.Nama_plat}</TableCell>
                <TableCell>{row.Nama_Lokasi}</TableCell>
                <TableCell>{row.Jumlah}</TableCell>
                <TableCell>{new Date(row.Tanggal_permintaan).toLocaleString()}</TableCell>
                <TableCell>{getStatusChip(row.Status)}</TableCell>
                <TableCell>
                  {row.Status === 'pending' && (
                    <Button 
                      onClick={() => handleDistribusiSelesai(row.ID_Distribusi)} 
                      variant="contained" 
                      color="primary"
                      size="small"
                    >
                      Tandai Selesai
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {distribusi.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Tidak ada tugas distribusi</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Tambah Distribusi</DialogTitle>
        <DialogContent>
          <Select name="ID_Plat" value={form.ID_Plat} onChange={handleChange} fullWidth displayEmpty sx={{ mb: 1, mt: 1 }}>
            <MenuItem value="" disabled>Pilih Plat</MenuItem>
            {platOptions.map(p => (
              <MenuItem key={p.ID_Plat} value={p.ID_Plat}>{p.Nama_plat}</MenuItem>
            ))}
          </Select>

          <Select name="ID_Lokasi_tujuan" value={form.ID_Lokasi_tujuan} onChange={handleChange} fullWidth displayEmpty sx={{ mb: 1, mt: 1 }}>
            <MenuItem value="" disabled>Pilih Lokasi Tujuan</MenuItem>
            {lokasiOptions.map(l => (
              <MenuItem key={l.ID_Lokasi} value={l.ID_Lokasi}>{l.Nama_Lokasi}</MenuItem>
            ))}
          </Select>

          <TextField 
            label="Jumlah" 
            name="Jumlah" 
            type="number" 
            value={form.Jumlah} 
            onChange={handleChange} 
            fullWidth 
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;