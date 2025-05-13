import React, { useState } from 'react';
import {
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography,
  Paper,
  Grid,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/partials/Layout';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreIcon from '@mui/icons-material/Explore';
import CancelIcon from '@mui/icons-material/Cancel';
import NorthIcon from '@mui/icons-material/North';
import EastIcon from '@mui/icons-material/East';
import { addLokasi } from '../services/lokasiService'; // Import the service

const AddLokasi = () => {
  const [formData, setFormData] = useState({
    nama_lokasi: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama_lokasi.trim()) {
      newErrors.nama_lokasi = 'Nama lokasi tidak boleh kosong';
    }
    
    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitude tidak boleh kosong';
    } else if (!/^-?\d+(\.\d+)?$/.test(formData.latitude)) {
      newErrors.latitude = 'Format latitude harus berupa angka (contoh: -6.123456)';
    }
    
    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitude tidak boleh kosong';
    } else if (!/^-?\d+(\.\d+)?$/.test(formData.longitude)) {
      newErrors.longitude = 'Format longitude harus berupa angka (contoh: 106.123456)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Using the service function instead of direct axios call
      const response = await addLokasi(formData);
      console.log('Lokasi berhasil ditambahkan:', response);
      setSnackbar({
        open: true,
        message: 'Lokasi berhasil ditambahkan',
        severity: 'success'
      });
      
      // Wait a moment to show success message before redirecting
      setTimeout(() => {
        navigate('/lokasi');
      }, 1500);
    } catch (error) {
      console.error('Gagal menambahkan lokasi:', error);
      setSnackbar({
        open: true,
        message: 'Terjadi kesalahan saat menyimpan lokasi',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout title="Tambah Lokasi">
      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 3,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'transparent'
          }}
        >
          <Tooltip title="Kembali ke daftar lokasi">
            <IconButton 
              onClick={() => navigate('/lokasi')}
              sx={{ 
                mr: 2,
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.15)' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight="medium">
            Formulir Tambah Lokasi
          </Typography>
        </Paper>

        <Card 
          elevation={3}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #26A69A 30%, #4DB6AC 90%)',
              color: 'white'
            }}
          >
            <AddLocationAltIcon sx={{ fontSize: 28, mr: 2 }} />
            <Typography variant="h6">
              Data Lokasi Baru
            </Typography>
          </Box>
          
          <Divider />
          
          <CardContent sx={{ py: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Nama Lokasi
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      placeholder="Masukkan nama lokasi"
                      name="nama_lokasi"
                      value={formData.nama_lokasi}
                      onChange={handleChange}
                      variant="outlined"
                      error={!!errors.nama_lokasi}
                      helperText={errors.nama_lokasi}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NorthIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Latitude
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      placeholder="Masukkan latitude (mis: -6.123456)"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      variant="outlined"
                      error={!!errors.latitude}
                      helperText={errors.latitude}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EastIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Longitude
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      placeholder="Masukkan longitude (mis: 106.123456)"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      variant="outlined"
                      error={!!errors.longitude}
                      helperText={errors.longitude}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/lokasi')}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    background: 'linear-gradient(45deg, #26A69A 30%, #4DB6AC 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #00897B 30%, #26A69A 90%)',
                    }
                  }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default AddLokasi;