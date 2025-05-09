import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const BASE_URL = 'http://localhost:3000';

const AdminValidasiPage = () => {
  const [distribusi, setDistribusi] = useState([]);
  const [report, setReport] = useState(null);

  const fetchDistribusi = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/distribusi`);
      setDistribusi(res.data);
    } catch (err) {
      console.error('Gagal mengambil data distribusi:', err);
    }
  };

  const handleValidasi = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/distribusi/validate/${id}`, { status: 'divalidasi' });
      fetchDistribusi();
    } catch (err) {
      console.error('Gagal memvalidasi distribusi:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/distribusi/report`);
      setReport(res.data);
    } catch (err) {
      console.error('Gagal mengambil laporan:', err);
    }
  };

  useEffect(() => {
    fetchDistribusi();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Halaman Validasi Admin</Typography>

      <Button variant="outlined" color="secondary" onClick={handleGenerateReport} sx={{ mb: 2 }}>
        Generate Report
      </Button>

      {report && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Laporan Distribusi:</Typography>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ mt: 3 }}>
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
                <TableCell>{row?.ID_Distribusi || 'N/A'}</TableCell>
                <TableCell>{row?.Nama_plat || 'N/A'}</TableCell>
                <TableCell>{row?.Nama_Lokasi || 'N/A'}</TableCell>
                <TableCell>{row?.Jumlah || 'N/A'}</TableCell>
                <TableCell>{row?.Tanggal_permintaan ? new Date(row.Tanggal_permintaan).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{row?.Status || 'N/A'}</TableCell>
                <TableCell>
                  {row.Status === 'disetujui' && (
                    <Button onClick={() => handleValidasi(row.ID_Distribusi)} color="success" variant="contained">
                      Validasi Selesai
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminValidasiPage;
