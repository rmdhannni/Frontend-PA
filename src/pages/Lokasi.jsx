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
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import Layout from '../components/partials/Layout';

const Lokasi = () => {
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/lokasi');
        console.log('Data Lokasi:', response.data);
        setLokasiList(response.data);
      } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        setSnackbar({
          open: true,
          message: 'Gagal memuat data lokasi',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLokasi();
  }, []);

  const handleDelete = async (idLokasi) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/lokasi/${idLokasi}`);
      setLokasiList((prev) => prev.filter((lokasi) => lokasi.ID_Lokasi !== idLokasi));
      setSnackbar({
        open: true,
        message: 'Lokasi berhasil dihapus',
        severity: 'success'
      });
    } catch (error) {
      console.error('Gagal menghapus lokasi:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menghapus lokasi',
        severity: 'error'
      });
    }
  };

  const formatCoordinates = (latitude, longitude) => {
    return `${latitude}, ${longitude}`;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout title="Data Lokasi">
      <Box sx={{ 
        maxWidth: 1200, 
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
        <Card 
          elevation={3}
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            mb: 4,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          }}
        >
          <CardContent sx={{ py: 4, color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <MapIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ 
                  fontSize: {xs: '1.5rem', md: '2.2rem'}, 
                  fontWeight: 'bold',
                  m: 0
                }}
              >
                Data Lokasi
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Kelola semua informasi lokasi pada sistem
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddLocationIcon />}
            onClick={() => navigate('/lokasi/add')}
            sx={{
              fontSize: '0.9rem',
              py: 1,
              px: 3,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
              }
            }}
          >
            Tambahkan Lokasi
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography>Memuat data...</Typography>
          </Box>
        ) : (
          <Fade in={!loading} timeout={500}>
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <Table sx={{ minWidth: { xs: 650, md: 1100 } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        ID Lokasi
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Nama Lokasi
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Latitude
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Longitude
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Koordinat
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lokasiList.length > 0 ? (
                      lokasiList.map((lokasi, index) => (
                        <TableRow 
                          key={lokasi.ID_Lokasi}
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '&:hover': { backgroundColor: '#f1f8fe' },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell align="center">
                            <Chip 
                              label={lokasi.ID_Lokasi} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              {lokasi.Nama_Lokasi}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{lokasi.latitude}</TableCell>
                          <TableCell align="center">{lokasi.longitude}</TableCell>
                          <TableCell align="center">{formatCoordinates(lokasi.latitude, lokasi.longitude)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Hapus lokasi" arrow>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(lokasi.ID_Lokasi)}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <MapIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                            <Typography variant="body1" color="text.secondary">
                              Tidak ada data lokasi yang tersedia
                            </Typography>
                            <Button 
                              variant="outlined" 
                              startIcon={<AddLocationIcon />}
                              onClick={() => navigate('/lokasi/add')}
                              size="small"
                            >
                              Tambah Lokasi Baru
                            </Button>
                          </Box>
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

export default Lokasi;