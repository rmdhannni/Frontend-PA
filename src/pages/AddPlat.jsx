// src/pages/AddPlat.jsx (atau path yang sesuai)

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    CardContent, 
    TextField, 
    MenuItem, 
    Button, 
    Typography, 
    Paper,
    Alert // <-- Alert sudah diimpor di sini
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Layout from '../components/partials/Layout';
// import { createPlat } from '../services/platService'; // Jika Anda menggunakan service
// import { getAllLokasi } from '../services/lokasiService'; // Jika Anda menggunakan service

const AddPlat = () => {
  const [formData, setFormData] = useState({
    nama_plat: '',
    lot_batch_number: '',
    stok: '', 
    id_lokasi: '',
    status: '',
  });
  const [lokasiList, setLokasiList] = useState([]);
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/lokasi');
        setLokasiList(response.data || []);
      } catch (error) {
        console.error('Error mengambil data lokasi:', error);
        setError('Gagal memuat data lokasi.');
      }
    };
    fetchLokasi();
  }, []);

  const handleChange = (e) => {
    setError(''); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    if (!formData.nama_plat || !formData.lot_batch_number || !formData.stok || !formData.id_lokasi || !formData.status) {
      setError('Semua field wajib diisi.');
      return;
    }

    const stokValue = Number(formData.stok);
    if (isNaN(stokValue) || stokValue < 0) {
        setError('Stok harus berupa angka positif atau nol.');
        return;
    }

    // Sesuaikan nama field di payload dengan yang diharapkan backend (termasuk kapitalisasi)
    // Berdasarkan model platModels.js dari file yang Anda berikan, field di DB menggunakan kapitalisasi PascalCase
    // untuk beberapa field seperti Lot_Batch_Number, Nama_plat, ID_Lokasi, Status.
    // Namun, saat INSERT menggunakan 'INSERT INTO plat SET ?', nama properti objek payload harus cocok dengan nama kolom.
    // Mari kita asumsikan backend mengharapkan nama kolom persis seperti di DB.
    const payload = {
      Nama_plat: formData.nama_plat, // Sesuai kolom DB
      Lot_Batch_Number: formData.lot_batch_number, // Sesuai kolom DB
      stok: stokValue,       
      ID_Lokasi: formData.id_lokasi, // Sesuai kolom DB
      Status: formData.status,     // Sesuai kolom DB
      // Jika kolom Kuantitas masih ada di tabel plat dan ingin diisi sama dengan stok awal:
      // Kuantitas: stokValue 
    };

    console.log('Data yang akan dikirim:', payload);

    try {
      await axios.post('http://localhost:3000/api/plat', payload, {
        headers: {
          // Authorization: `Bearer ${getToken()}`, // Aktifkan jika perlu
        }
      });
      alert('Data plat berhasil ditambahkan'); 
      navigate('/plat');
    } catch (error) {
      console.error('Error mengirim data plat:', error.response?.data || error.message);
      setError(`Gagal menambahkan data: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Layout title="Tambah Data Plat">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start', 
        minHeight: 'calc(100vh - 64px - 48px)', 
        py: 4,
        px: 2
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
          }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Formulir Tambah Data Plat
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {error && ( // Ini adalah baris sekitar 111
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Nama Plat"
                name="nama_plat" 
                value={formData.nama_plat}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Lot / Batch Number"
                name="lot_batch_number" 
                value={formData.lot_batch_number}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Stok Awal" 
                type="number"
                name="stok" 
                value={formData.stok}
                onChange={handleChange}
                margin="normal"
                required
                inputProps={{ min: 0 }} 
              />
              <TextField
                select
                fullWidth
                label="Lokasi"
                name="id_lokasi" 
                value={formData.id_lokasi}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="" disabled>
                  <em>Pilih Lokasi</em>
                </MenuItem>
                {lokasiList.length > 0 ? (
                  lokasiList.map((lokasi) => (
                    <MenuItem key={lokasi.ID_Lokasi} value={lokasi.ID_Lokasi}>
                      {lokasi.Nama_Lokasi}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Memuat lokasi...</MenuItem>
                )}
              </TextField>
              <TextField
                select
                fullWidth
                label="Status"
                name="status" 
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                required
              >
                 <MenuItem value="" disabled>
                  <em>Pilih Status</em>
                </MenuItem>
                <MenuItem value="Ready">Ready</MenuItem>
                <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
              </TextField>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/plat')}
                  sx={{ px: 3 }}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ px: 3 }}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AddPlat;