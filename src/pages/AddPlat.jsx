import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, MenuItem, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/partials/Layout';

const AddPlat = () => {
  const [formData, setFormData] = useState({
    nama_plat: '',
    lot_batch_number: '',
    kuantitas: '',
    id_lokasi: '',
    status: '',
  });
  const [lokasiList, setLokasiList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/lokasi');
        console.log('Data Lokasi:', response.data);
        setLokasiList(response.data);
      } catch (error) {
        console.error('Error mengambil data lokasi:', error);
      }
    };

    fetchLokasi();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_plat || !formData.lot_batch_number || !formData.kuantitas || !formData.id_lokasi || !formData.status) {
      alert('Semua field wajib diisi.');
      return;
    }

    const payload = {
      ...formData,
      kuantitas: Number(formData.kuantitas),
    };

    console.log('Data yang akan dikirim:', payload);

    try {
      await axios.post('http://localhost:3000/api/plat', payload);
      alert('Data berhasil ditambahkan');
      navigate('/plat');
    } catch (error) {
      console.error('Error mengirim data:', error.response?.data || error.message);
      alert('Gagal menambahkan data. Periksa konsol untuk detail error.');
    }
  };

  return (
    <Layout title="Tambah Data Plat">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, borderRadius: 2 }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Formulir Tambah Data Plat
            </Typography>
          </Box>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nama Plat"
                name="nama_plat"
                value={formData.nama_plat}
                onChange={handleChange}
                margin="normal"
                required
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
                label="Kuantitas"
                type="number"
                name="kuantitas"
                value={formData.kuantitas}
                onChange={handleChange}
                margin="normal"
                required
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
                {lokasiList.map((lokasi) => (
                  <MenuItem key={lokasi.ID_Lokasi} value={lokasi.ID_Lokasi}>
                    {lokasi.Nama_Lokasi}
                  </MenuItem>
                ))}
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
                <MenuItem value="Ready">Ready</MenuItem>
                <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
              </TextField>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
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