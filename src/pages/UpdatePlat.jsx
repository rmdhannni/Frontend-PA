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
  Paper
} from '@mui/material';
import Layout from '../components/partials/Layout';
import { getAllLokasi } from '../services/lokasiService';

const UpdatePlat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    Nama_plat: '',
    Lot_Batch_Number: '',
    Kuantitas: '',
    ID_Lokasi: '',
    Status: ''
  });
  
  const [lokasi, setLokasi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plat data
        const platResponse = await axios.get(`http://localhost:3000/api/plat/${id}`);
        
        // Match the form field names exactly with the API response field names
        setFormData({
          Nama_plat: platResponse.data.Nama_plat || '',
          Lot_Batch_Number: platResponse.data.Lot_Batch_Number || '',
          Kuantitas: platResponse.data.Kuantitas || '',
          ID_Lokasi: platResponse.data.ID_Lokasi || '',
          Status: platResponse.data.Status || ''
        });
        
        // Fetch lokasi data for dropdown
        try {
          const lokasiData = await getAllLokasi();
          setLokasi(lokasiData);
        } catch (locErr) {
          console.error('Error fetching lokasi data:', locErr);
          // Continue even if lokasi data fetch fails
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch plat data:', err);
        setError('Gagal mengambil data plat. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update plat data
      await axios.put(`http://localhost:3000/api/plat/${id}`, formData);
      alert('Data plat berhasil diperbarui!');
      navigate('/plat'); // Redirect to plat list page
    } catch (err) {
      console.error('Failed to update plat data:', err);
      setError('Gagal memperbarui data plat. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/plat');
  };

  if (isLoading) {
    return (
      <Layout title="Edit Data Plat">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Data Plat">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        py: 4
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, borderRadius: 2 }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              Edit Data Plat
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Nama Plat"
                name="Nama_plat"
                value={formData.Nama_plat}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Lot / Batch Number"
                name="Lot_Batch_Number"
                value={formData.Lot_Batch_Number}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Kuantitas"
                name="Kuantitas"
                value={formData.Kuantitas}
                onChange={handleChange}
                type="number"
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                select
                label="Lokasi"
                name="ID_Lokasi"
                value={formData.ID_Lokasi}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              >
                {lokasi.length > 0 ? (
                  lokasi.map((loc) => (
                    <MenuItem key={loc.ID_Lokasi} value={loc.ID_Lokasi}>
                      {loc.Nama_Lokasi}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">
                    {formData.ID_Lokasi || "Tidak ada data lokasi"}
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
              >
                <MenuItem value="Ready">Ready</MenuItem>
                <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
              </TextField>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  sx={{ px: 3 }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={isLoading}
                  sx={{ px: 3 }}
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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