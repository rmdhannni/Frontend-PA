import React from 'react';
import { Box, Grid, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import Navbar from '../components/partials/Navbar';
import Sidebar from '../components/partials/Sidebar';
import Footer from '../components/partials/Footer';

const AdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar title="Admin Dashboard" />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 4,
          py: 3,
          bgcolor: 'background.default',
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Dashboard Statistics
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  Total Material
                </Typography>
                <Typography variant="h4" align="center" fontWeight="bold">
                  1,024
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  Material Pending
                </Typography>
                <Typography variant="h4" align="center" fontWeight="bold">
                  345
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  Material Distribusi
                </Typography>
                <Typography variant="h4" align="center" fontWeight="bold">
                  45
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Recent Activity
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText primary="User A signed up" secondary="5 minutes ago" />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Order #123 completed" secondary="15 minutes ago" />
              </ListItem>
              <ListItem>
                <ListItemText primary="User B upgraded to premium" secondary="30 minutes ago" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </Box>
  );
};

export default AdminDashboard;