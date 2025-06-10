// src/pages/UpdatePlat.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tooltip // Tambahkan Tooltip
} from '@mui/material';
import Layout from '../components/partials/Layout';
import { getAllLokasi } from '../services/lokasiService'; // Asumsi path benar

const UpdatePlat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Nama_plat: '',
    Lot_Batch_Number: '',
    // Kuantitas: '', // Kuantitas akan disimpan terpisah untuk logika disable stok
    stok: '',       // Field utama untuk update stok
    ID_Lokasi: '',
    Status: ''
  });
  
  const [initialKuantitas, setInitialKuantitas] = useState(null); // Untuk menyimpan Kuantitas awal
  const [isStokEditable, setIsStokEditable] = useState(true); // Default stok bisa diedit

  const [lokasi, setLokasi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading saat submit
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(''); // Error spesifik untuk form

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setFormError('');
      try {
        const platResponse = await axios.get(`http://localhost:3000/api/plat/${id}`);
        const platData = platResponse.data;

        setFormData({
          Nama_plat: platData.Nama_plat || '',
          Lot_Batch_Number: platData.Lot_Batch_Number || '',
          stok: platData.stok !== undefined ? String(platData.stok) : '', // Pastikan stok adalah string untuk TextField
          ID_Lokasi: platData.ID_Lokasi || '',
          Status: platData.Status || ''
        });
        
        setInitialKuantitas(platData.Kuantitas); // Simpan Kuantitas awal dari database

        // Logika untuk menentukan apakah field stok bisa diedit:
        // Asumsi sederhana: jika Kuantitas (awal) berbeda dari stok saat ini, ATAU jika Kuantitas tidak ada maka anggap sudah ada transaksi
        // Anda mungkin perlu logika yang lebih baik dari backend (misal, flag `isDistributed`)
        if (platData.Kuantitas !== undefined && platData.stok !== undefined) {
          if (platData.Kuantitas !== platData.stok) {
            setIsStokEditable(false);
          } else {
            // Jika sama, periksa apakah ada di tabel distribusi (ini idealnya dari backend)
            // Untuk frontend, kita bisa biarkan editable jika Kuantitas === stok
            // atau default ke non-editable jika ingin lebih aman tanpa info backend
            // setIsStokEditable(false); // Pilihan lebih aman jika tidak ada info `isDistributed`
            setIsStokEditable(true); // Untuk saat ini, biarkan editable jika sama
          }
        } else {
          // Jika Kuantitas atau stok tidak ada, anggap sudah terdistribusi (lebih aman)
          // atau berdasarkan kebutuhan bisnis Anda.
          // Untuk contoh ini, jika Kuantitas tidak ada, kita anggap stok tidak bisa diubah sembarangan
          // Ini bisa berarti plat ini dibuat dengan sistem lama yang hanya punya stok, atau sudah ada transaksi.
           setIsStokEditable(platData.Kuantitas === undefined);
        }
        
        // Idealnya, backend mengirim flag seperti `platData.hasBeenDistributed`
        // if (platData.hasBeenDistributed) {
        //   setIsStokEditable(false);
        // }


        const lokasiData = await getAllLokasi();
        setLokasi(lokasiData || []);
        
      } catch (err) {
        console.error('Failed to fetch plat data:', err);
        setError('Gagal mengambil data plat. ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormError(''); // Clear error on change
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validasi frontend sederhana
    if (!formData.Nama_plat || !formData.Lot_Batch_Number || formData.stok === '' || !formData.ID_Lokasi || !formData.Status) {
      setFormError('Semua field wajib diisi.');
      return;
    }
    const stokValue = Number(formData.stok);
    if (isNaN(stokValue) || stokValue < 0) {
      setFormError('Stok harus berupa angka numerik positif atau nol.');
      return;
    }

    setIsSubmitting(true); // Mulai loading submit
    setError(null);

    // Data yang akan dikirim ke backend.
    // Backend harus tahu bahwa 'stok' yang dikirim adalah nilai baru untuk kolom 'stok'.
    // Jika 'Kuantitas' juga perlu diupdate saat 'stok' diupdate di form ini (dan editable),
    // maka sertakan juga 'Kuantitas' di payload.
    // Sesuai permintaan, jika stok tidak editable, kita tidak mengirim perubahannya.
    const payload = {
      Nama_plat: formData.Nama_plat,
      Lot_Batch_Number: formData.Lot_Batch_Number,
      ID_Lokasi: formData.ID_Lokasi,
      Status: formData.Status,
      // Hanya kirim stok jika editable, atau selalu kirim formData.stok dan biarkan backend yang memvalidasi
      stok: stokValue, 
      // Jika Kuantitas juga ingin diupdate bersamaan dengan stok (ketika stok editable):
      // Kuantitas: isStokEditable ? stokValue : initialKuantitas, 
      // ATAU, jika Kuantitas tidak pernah diubah dari form update ini setelah transaksi:
      Kuantitas: initialKuantitas // Kirim Kuantitas awal agar tidak ter-overwrite jadi null/undefined jika backend mengharapkannya
    };

    // Hapus field stok dari payload jika tidak editable, agar tidak terupdate di backend
    if (!isStokEditable) {
      delete payload.stok; 
      // Juga, jika Kuantitas tidak boleh diubah setelah transaksi, pastikan backend tidak mengupdatenya
      // atau kirim nilai Kuantitas awal agar tidak ter-overwrite jika payload SET ? digunakan di backend.
      // payload.Kuantitas = initialKuantitas; // (sudah ditambahkan di atas)
    }


    try {
      await axios.put(`http://localhost:3000/api/plat/${id}`, payload);
      alert('Data plat berhasil diperbarui!'); // Ganti dengan Snackbar jika diinginkan
      navigate('/plat');
    } catch (err) {
      console.error('Failed to update plat data:', err);
      setError('Gagal memperbarui data plat. ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false); // Selesai loading submit
    }
  };

  const handleCancel = () => {
    navigate('/plat');
  };

  if (isLoading) {
    return (
      <Layout title="Edit Data Plat...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
          <CircularProgress />
          <Typography sx={{ml: 2}}>Memuat data plat...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Plat - ${formData.Nama_plat || 'ID: ' + id}`}>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, px:2 }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, borderRadius: 2, overflow:'hidden' }}>
          <Box sx={{ p: {xs:2, sm:3}, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', color: 'white' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Edit Data Plat
            </Typography>
          </Box>

          <Box sx={{ p: {xs:2, sm:4} }}>
            {error && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> )}
            {formError && ( <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setFormError('')}>{formError}</Alert> )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                label="Nama Plat"
                name="Nama_plat"
                value={formData.Nama_plat}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="Lot / Batch Number"
                name="Lot_Batch_Number"
                value={formData.Lot_Batch_Number}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <Tooltip 
                title={!isStokEditable ? "Stok tidak dapat diubah jika plat sudah pernah didistribusikan atau Kuantitas awalnya berbeda." : ""}
                arrow 
                placement="top-start"
              >
                <span> {/* Wrapper diperlukan untuk Tooltip pada component yang disabled */}
                  <TextField
                    label="Stok Saat Ini" // Label diubah
                    name="stok"         // Name diubah
                    value={formData.stok}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    margin="normal"
                    required
                    disabled={!isStokEditable} // Logika disable
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                </span>
              </Tooltip>
              
              <TextField
                select
                label="Lokasi"
                name="ID_Lokasi"
                value={formData.ID_Lokasi}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value=""><em>Pilih Lokasi</em></MenuItem>
                {lokasi.length > 0 ? (
                  lokasi.map((loc) => (
                    <MenuItem key={loc.ID_Lokasi} value={loc.ID_Lokasi}>
                      {loc.Nama_Lokasi}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={formData.ID_Lokasi || ""} disabled>
                    {formData.ID_Lokasi ? `Lokasi ID: ${formData.ID_Lokasi}` : "Memuat lokasi..."}
                  </MenuItem>
                )}
              </TextField>
              
              <TextField
                select
                label="Status"
                name="Status"
                value={formData.Status}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              >
                 <MenuItem value=""><em>Pilih Status</em></MenuItem>
                <MenuItem value="Ready">Ready</MenuItem>
                <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
              </TextField>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap:2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  sx={{ px: 3 }}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={isSubmitting || isLoading} // Disable juga jika data awal masih loading
                  sx={{ px: 3 }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Simpan Perubahan'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default UpdatePlat;