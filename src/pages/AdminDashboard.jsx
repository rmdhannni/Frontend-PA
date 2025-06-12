import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Box, Grid, Card, CardContent, Typography, List, ListItem, ListItemText, Container,
    Alert, CircularProgress, Divider, Paper, useTheme, IconButton, Tooltip, Skeleton
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Layout from '../components/partials/Layout';
import { getToken } from '../utils/auth'; // Pastikan Anda memiliki fungsi untuk mengambil token

const BASE_URL = 'http://localhost:3000';

// Helper untuk memformat waktu relatif
const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
};

// Komponen Grafik
const DistributionChart = ({ data, loading }) => {
    const theme = useTheme();

    if (loading) {
        return (
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '12px' }}/>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography color="text.secondary">Data tidak cukup untuk menampilkan grafik.</Typography>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <RechartsTooltip contentStyle={{
                    borderRadius: '8px',
                    boxShadow: theme.shadows[2],
                    border: 'none'
                }} />
                <Legend wrapperStyle={{ fontSize: 14 }} />
                <Bar dataKey="masuk" fill={theme.palette.success.main} name="Material Masuk" radius={[4, 4, 0, 0]} />
                <Bar dataKey="keluar" fill={theme.palette.primary.main} name="Material Keluar" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};


function AdminDashboardContent() {
    const theme = useTheme();
    const [loading, setLoading] = useState({ data: true, users: true });
    const [error, setError] = useState({ data: '', users: '' });
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState({
        online: navigator.onLine,
        slow: false
    });

    const processDataForDashboard = useCallback((distribusiData, userData) => {
        if (!distribusiData) return;

        // Proses data untuk statistik 
        const newStats = {
            totalMaterial: distribusiData.length,
            materialPending: distribusiData.filter(d => d.Status === 'pending').length,
            materialDistribusi: distribusiData.filter(d => ['diproses', 'terdistribusi'].includes(d.Status)).length,
            materialDisetujui: distribusiData.filter(d => d.Status === 'disetujui').length,
            materialDitolak: distribusiData.filter(d => d.Status === 'ditolak').length,
            activeUsers: userData ? userData.length : 0,
        };
        setStats(newStats);

        // Proses data untuk aktivitas terbaru 
        const formattedActivity = distribusiData.slice(0, 5).map(d => ({
            id: d.ID_Distribusi,
            action: `Permintaan ${d.Jenis_distribusi} untuk '${d.Nama_plat}' (${d.Jumlah} unit).`,
            actor: d.Username_Distribusi || 'N/A',
            time: timeSince(d.Tanggal_permintaan),
            status: d.Status
        }));
        setRecentActivity(formattedActivity);

        // Proses data untuk grafik 
        const monthlyData = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

        distribusiData.forEach(d => {
            const date = new Date(d.Tanggal_permintaan);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    name: `${monthNames[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`,
                    masuk: 0,
                    keluar: 0,
                    timestamp: date.getTime()
                };
            }
            if (d.Jenis_distribusi === 'masuk') {
                monthlyData[monthKey].masuk += d.Jumlah;
            } else if (d.Jenis_distribusi === 'keluar') {
                monthlyData[monthKey].keluar += d.Jumlah;
            }
        });

        const sortedChartData = Object.values(monthlyData).sort((a, b) => a.timestamp - b.timestamp);
        setChartData(sortedChartData);

    }, []);

    const fetchData = useCallback(async () => {
        setLoading({ data: true, users: true });
        setError({ data: '', users: '' });
        const token = getToken();
        if (!token) {
            setError({ data: "Akses ditolak. Silakan login kembali.", users: "Akses ditolak." });
            setLoading({ data: false, users: false });
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Memanggil API backend 
            const [distribusiResponse, usersResponse] = await Promise.all([
                axios.get(`${BASE_URL}/api/distribusi`, { headers }),
                axios.get(`${BASE_URL}/api/user`, { headers })
            ]);
            processDataForDashboard(distribusiResponse.data, usersResponse.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            const errorMessage = err.response?.data?.error || err.message || "Gagal memuat data.";
            setError({ data: errorMessage, users: errorMessage });
        } finally {
            setLoading({ data: false, users: false });
        }
    }, [processDataForDashboard]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleOnline = () => setConnectionStatus(prev => ({ ...prev, online: true }));
        const handleOffline = () => setConnectionStatus(prev => ({ ...prev, online: false }));
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRefresh = () => fetchData();

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
            case 'disetujui': return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
            case 'ditolak': return <CancelIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
            case 'terdistribusi': return <LocalShippingIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />;
            default: return <NotificationsIcon fontSize="small" color="action" />;
        }
    };
    
    const renderStatCard = (title, value, icon, color, bgColor, isLoading) => (
        <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
                elevation={1}
                sx={{
                    backgroundColor: bgColor,
                    borderRadius: '12px',
                    transition: 'transform 0.2s, box-shadow 0.3s',
                    height: '100%',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    {isLoading ? (
                        <>
                            <Skeleton variant="text" width="80%" height={24} />
                            <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }}/>
                        </>
                    ) : (
                        <>
                            <Box display="flex" alignItems="center" mb={1}>{icon}</Box>
                            <Typography variant="body2" color="text.secondary">{title}</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, my: 1 }}>
                                {value ?? 0}
                            </Typography>
                        </>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );

    return (
        <Container maxWidth="xl" disableGutters sx={{p: 2}}>
            <Box mb={3}>
                <Box display="flex" alignItems="center" mb={1}>
                    <DashboardIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Dashboard / Overview</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight="bold" color="primary">Dashboard Admin</Typography>
                    <Tooltip title="Refresh Data">
                        <span>
                            <IconButton onClick={handleRefresh} color="primary" disabled={loading.data || loading.users}>
                                {loading.data || loading.users ? <CircularProgress size={24} /> : <RefreshIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {!connectionStatus.online && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>Anda sedang offline. Data yang ditampilkan mungkin tidak akurat.</Alert>}
            {(error.data || error.users) && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error.data || error.users}</Alert>}

            <Card elevation={0} sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: 'background.default' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DashboardIcon sx={{ mr: 1 }} fontSize="small" />Ringkasan Status
                </Typography>
                <Grid container spacing={2}>
                    {renderStatCard('Total Permintaan', stats.totalMaterial, <InventoryIcon sx={{ color: theme.palette.primary.main }} />, theme.palette.text.primary, '#f5f5f5', loading.data)}
                    {renderStatCard('Pending', stats.materialPending, <WarningIcon sx={{ color: '#ed6c02' }} />, '#ed6c02', '#fff9c4', loading.data)}
                    {renderStatCard('Dalam Proses', stats.materialDistribusi, <LocalShippingIcon sx={{ color: '#0288d1' }} />, '#0288d1', '#bbdefb', loading.data)}
                    {renderStatCard('Disetujui', stats.materialDisetujui, <CheckCircleIcon sx={{ color: '#2e7d32' }} />, '#2e7d32', '#c8e6c9', loading.data)}
                    {renderStatCard('Ditolak', stats.materialDitolak, <CancelIcon sx={{ color: '#d32f2f' }} />, '#d32f2f', '#ffcdd2', loading.data)}
                    {renderStatCard('Total Pengguna', stats.activeUsers, <PeopleIcon sx={{ color: '#9c27b0' }} />, '#9c27b0', '#e1bee7', loading.users)}
                </Grid>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ borderRadius: '12px', height: '100%', p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <ShowChartIcon sx={{ mr: 1 }} fontSize="small" color="primary" />
                            Grafik Distribusi Bulanan (berdasarkan jumlah)
                        </Typography>
                        <DistributionChart data={chartData} loading={loading.data} />
                    </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: '12px', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <NotificationsIcon sx={{ mr: 1 }} fontSize="small" color="primary" />Aktivitas Terbaru
                            </Typography>
                            <Divider sx={{ mb: 1 }} />
                            
                            {loading.data ? (
                                <Box>
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} variant="text" height={55} />)}
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {recentActivity.map((activity, index) => (
                                        <ListItem key={activity.id} dense divider={index < recentActivity.length - 1}>
                                            <ListItemText
                                                primary={<Typography variant="body2" component="span" fontWeight={500}>{activity.action}</Typography>}
                                                secondary={`oleh ${activity.actor} - ${activity.time}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default function AdminDashboard() {
    return (
        <Layout title="Dashboard Admin">
            <AdminDashboardContent />
        </Layout>
    );
}