import React, { useEffect, useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Layout from '../components/partials/Layout';
import { getAllPlat, deletePlat } from '../services/platService';
import { getAllLokasi } from '../services/lokasiService';

const Plat = () => {
  const [plat, setPlat] = useState([]);
  const [filteredPlat, setFilteredPlat] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter data whenever search term changes
    if (plat.length > 0) {
      const filtered = plat.filter(item => 
        item.Nama_plat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Lot_Batch_Number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ID_Plat.toString().includes(searchTerm.toLowerCase()) ||
        getLokasiName(item.ID_Lokasi).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlat(filtered);
      setPage(0); // Reset to first page when filtering
    }
  }, [searchTerm, plat]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get data from service functions
      const platData = await getAllPlat();
      setPlat(platData);
      setFilteredPlat(platData);
      
      try {
        const lokasiData = await getAllLokasi();
        setLokasi(lokasiData);
      } catch (locErr) {
        console.error('Error fetching lokasi data:', locErr);
        // Continue even if location data fetch fails
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal mengambil data. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        setDeleteLoading(true);
        await deletePlat(id);
        // Refresh data after delete
        fetchData();
      } catch (err) {
        console.error('Error deleting plat:', err);
        setError('Gagal menghapus data. Silakan coba lagi.');
        setDeleteLoading(false);
      }
    }
  };

  // Function to get location name based on ID_Lokasi
  const getLokasiName = (idLokasi) => {
    if (!lokasi || lokasi.length === 0) {
      return idLokasi; // If location data isn't available yet
    }
    const lokasiItem = lokasi.find(loc => loc.ID_Lokasi === idLokasi);
    return lokasiItem ? lokasiItem.Nama_Lokasi : idLokasi;
  };

  // Get status chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'success';
      case 'Tidak Tersedia':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ready':
        return <CheckCircleIcon fontSize="small" />;
      case 'Tidak Tersedia':
        return <WarningIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Memuat Data...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  return (
    <Layout title="Data Plat">
      <Container maxWidth="xl">
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8
          }}
        >
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                color: 'white'
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <StorageIcon fontSize="large" />
                </Grid>
                <Grid item>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Data Plat
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <CardContent>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  variant="filled"
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/plat/add')}
                        startIcon={<AddIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          boxShadow: 3
                        }}
                      >
                        Tambahkan Data Plat
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={fetchData}
                        startIcon={<RefreshIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1
                        }}
                      >
                        Refresh
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Cari berdasarkan nama, lot, ID, atau lokasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            &times;
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
              </Grid>
              
              {filteredPlat.length === 0 ? (
                <Alert 
                  severity="info"
                  variant="outlined"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: 2
                  }}
                >
                  {searchTerm ? 'Tidak ada data plat yang sesuai dengan pencarian' : 'Tidak ada data plat yang tersedia'}
                </Alert>
              ) : (
                <>
                  <TableContainer
                    component={Paper}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: 2,
                      mb: 2
                    }}
                  >
                    <Table sx={{ minWidth: 1100 }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>ID</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Nama Plat</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Lot/Batch</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Kuantitas</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Lokasi</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPlat
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((item) => (
                          <TableRow 
                            key={item.ID_Plat}
                            sx={{ 
                              '&:hover': { bgcolor: '#f0f7ff' },
                              bgcolor: hoveredRow === item.ID_Plat ? '#f0f7ff' : 'inherit',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={() => setHoveredRow(item.ID_Plat)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <TableCell 
                              align="center" 
                              sx={{ 
                                fontSize: '0.9rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {item.ID_Plat}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.9rem' }}>{item.Nama_plat}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.9rem' }}>{item.Lot_Batch_Number}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.9rem' }}>{item.Kuantitas}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.9rem' }}>
                              <Chip 
                                label={getLokasiName(item.ID_Lokasi)}
                                color="info"
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.9rem' }}>
                              <Chip 
                                icon={getStatusIcon(item.Status)}
                                label={item.Status}
                                color={getStatusColor(item.Status)}
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Edit Data" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                <IconButton
                                  color="primary"
                                  onClick={() => navigate(`/plat/update/${item.ID_Plat}`)}
                                  sx={{ 
                                    mx: 0.5,
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                      transform: 'scale(1.1)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus Data" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(item.ID_Plat)}
                                  disabled={deleteLoading}
                                  sx={{ 
                                    mx: 0.5,
                                    '&:hover': {
                                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                      transform: 'scale(1.1)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
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
                Total data: {filteredPlat.length} {searchTerm && `(filter aktif: "${searchTerm}")`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
      
      {/* Background overlay during delete operation */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={deleteLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Menghapus data...
          </Typography>
        </Box>
      </Backdrop>
    </Layout>
  );
};

export default Plat;