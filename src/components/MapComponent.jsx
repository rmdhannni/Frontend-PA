import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Import CSS untuk routing machine
import 'leaflet-routing-machine';
import { 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Box, 
  Grid,
  Paper,
  CircularProgress,
  useMediaQuery,
  useTheme,
  GlobalStyles // --- PERBAIKAN: Impor GlobalStyles ---
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  Code as CodeIcon,
  Place as PlaceIcon,
  GpsFixed as GpsFixedIcon,
  Route as RouteIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

// --- PERBAIKAN: Konfigurasi terpusat untuk ikon dan warna ---
const MAP_CONFIG = {
  user: {
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    color: '#1976d2'
  },
  material: {
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-pink.png',
    color: '#ff69b4'
  }
};

const createLeafletIcon = (config, isMobile) => L.icon({
  iconUrl: config.iconUrl,
  iconSize: isMobile ? [20, 33] : [25, 41],
  iconAnchor: isMobile ? [10, 33] : [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Map Controller Component
const MapController = ({ startPosition, lotData, setRouteSummary }) => {
  const map = useMap();
  const routingControlRef = useRef();

  useEffect(() => {
    if (!startPosition || !lotData) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const routingControl = L.Routing.control({
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'car'
      }),
      waypoints: [
        L.latLng(startPosition.lat, startPosition.lng),
        L.latLng(lotData.latitude, lotData.longitude)
      ],
      lineOptions: {
        styles: [{ 
          color: MAP_CONFIG.material.color, // --- PERBAIKAN: Menggunakan warna dari config
          weight: 5,
          opacity: 0.8
        }]
      },
      show: false,
      addWaypoints: false,
      createMarker: () => null, // Sembunyikan marker default dari routing
    }).addTo(map);

    // --- FITUR BARU: Mendapatkan ringkasan rute ---
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes.length > 0) {
        const summary = routes[0].summary;
        setRouteSummary({
          distance: (summary.totalDistance / 1000).toFixed(2), // Jarak dalam km
          time: Math.round(summary.totalTime / 60) // Waktu dalam menit
        });
      }
    });

    routingControlRef.current = routingControl;

    const bounds = L.latLngBounds([
        [startPosition.lat, startPosition.lng],
        [lotData.latitude, lotData.longitude]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        setRouteSummary(null); // Reset summary saat komponen dilepas
      }
    };
  }, [startPosition, lotData, map, setRouteSummary]);

  return null;
};

// Reusable Detail Item Component
const DetailItem = ({ icon, label, value, isMobile, monospace = false }) => {
  const theme = useTheme();
  return (
    <Box 
      display="flex" 
      alignItems="flex-start" 
      gap={1.5}
      sx={{ p: 1, width: '100%' }}
    >
      <Box sx={{ color: 'text.secondary', pt: 0.3 }}>
        {React.cloneElement(icon, { sx: { fontSize: isMobile ? 18 : 20 } })}
      </Box>
      <Box flex={1}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.2, mb: 0.2 }}
        >
          {label}
        </Typography>
        {typeof value === 'string' ? (
          <Typography
            variant={isMobile ? "body2" : "body1"}
            fontWeight={500}
            sx={{
              wordBreak: 'break-word',
              fontFamily: monospace ? 'monospace' : 'inherit',
              fontSize: monospace ? '0.8rem' : 'inherit'
            }}
          >
            {value}
          </Typography>
        ) : value}
      </Box>
    </Box>
  );
};

// --- PERBAIKAN: Komponen popup baru untuk konsistensi ---
const UserLocationPopup = ({ location, isMobile }) => (
    <Card sx={{ width: '100%', maxWidth: '250px', boxShadow: 0 }}>
        <CardContent sx={{ p: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LocationIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="bold">Lokasi Anda</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </Typography>
        </CardContent>
    </Card>
);


// Material Location Popup Component
// Ganti komponen MaterialLocationPopup Anda dengan ini

const MaterialLocationPopup = ({ lotData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // --- PERBAIKAN: Pastikan lotData.Stok adalah angka, jika tidak, gunakan 0 ---
  const stokValue = Number(lotData.Stok) || 0;

  return (
    <Card sx={{ 
      width: '100%',
      maxWidth: isMobile ? '85vw' : '400px',
      boxShadow: 3,
      borderRadius: 2,
      overflow: 'visible'
    }}>
      <CardContent sx={{ 
        p: isMobile ? 1.5 : 2,
        '&:last-child': { 
          pb: isMobile ? 1.5 : 2 
        }
      }}>
        {/* Header Section */}
        <Box display="flex" alignItems="center" mb={2} gap={1}>
          <InventoryIcon 
            sx={{ 
              fontSize: isMobile ? 20 : 24,
              color: 'primary.main'
            }}
          />
          <Typography
            variant={isMobile ? "subtitle2" : "subtitle1"}
            fontWeight="bold"
            color="primary"
          >
            DETAIL MATERIAL
          </Typography>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={1}>
          {/* Nama Plat */}
          <Grid item xs={12}>
            <DetailItem
              icon={<QrCodeIcon />}
              label="Nama Plat"
              value={lotData.Nama_plat}
              isMobile={isMobile}
            />
          </Grid>

          {/* Lot Batch */}
          <Grid item xs={12}>
            <DetailItem
              icon={<CodeIcon />}
              label="Lot Batch"
              value={
                <Chip
                  label={lotData.Lot_Batch_Number}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    maxWidth: '100%',
                    fontSize: isMobile ? '0.7rem' : '0.8rem'
                  }}
                />
              }
              isMobile={isMobile}
            />
          </Grid>

          {/* Lokasi */}
          <Grid item xs={12}>
            <DetailItem
              icon={<PlaceIcon />}
              label="Lokasi"
              value={lotData.Nama_Lokasi}
              isMobile={isMobile}
            />
          </Grid>
          
          {/* --- PERBAIKAN DI SINI --- */}
          {/* Mengganti Kuantitas menjadi Stok */}
          <Grid item xs={12}>
            <DetailItem
              icon={<InventoryIcon />}
              label="Stok"
              value={`${stokValue.toLocaleString()} Unit`}
              isMobile={isMobile}
            />
          </Grid>

          {/* Koordinat */}
          <Grid item xs={12}>
            <DetailItem
              icon={<GpsFixedIcon />}
              label="Koordinat"
              value={`${lotData.latitude?.toFixed(6) || ''}, ${lotData.longitude?.toFixed(6) || ''}`}
              isMobile={isMobile}
              monospace
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Map Component
const MapComponent = ({ lotData }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null); // --- FITUR BARU: State untuk ringkasan rute ---
  const mapRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung geolokasi');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError('Akses lokasi diperlukan untuk menampilkan rute');
        console.error('Error geolokasi:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (locationError && !userLocation) { // Hanya tampilkan error jika lokasi belum pernah didapat
    return (
      <Paper elevation={2} sx={{ height: isMobile ? '300px' : '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'error.light', color: 'error.contrastText', p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Box><LocationIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} /><Typography variant="h6" gutterBottom>Akses Lokasi Diperlukan</Typography><Typography variant="body2">{locationError}</Typography></Box>
      </Paper>
    );
  }

  if (!userLocation) {
    return (
      <Paper elevation={1} sx={{ height: isMobile ? '300px' : '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderRadius: 2 }}>
        <Box textAlign="center"><CircularProgress sx={{ mb: 2 }} /><Typography>Mendeteksi lokasi Anda...</Typography></Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
      {/* --- PERBAIKAN: Styling popup menggunakan GlobalStyles --- */}
      <GlobalStyles styles={{
        '.leaflet-popup-content-wrapper': {
          borderRadius: '12px !important',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15) !important',
          padding: '0 !important',
          backgroundColor: 'transparent !important', // Transparan agar card di dalamnya terlihat
        },
        '.leaflet-popup-content': {
          margin: '0 !important',
        },
        '.leaflet-popup-tip': {
           backgroundColor: theme.palette.background.paper + ' !important',
           boxShadow: '0 4px 20px rgba(0,0,0,0.1) !important',
        },
        '.leaflet-routing-container': { // Sembunyikan panel instruksi default
            display: 'none !important'
        }
      }} />

      {/* --- FITUR BARU: Menampilkan ringkasan rute di atas peta --- */}
      {routeSummary && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            p: 1,
            display: 'flex',
            gap: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <RouteIcon fontSize="small" color="primary"/>
            <Typography variant="body2"><b>{routeSummary.distance}</b> km</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <TimerIcon fontSize="small" color="primary"/>
            <Typography variant="body2"><b>{routeSummary.time}</b> min</Typography>
          </Box>
        </Paper>
      )}

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={isMobile ? 14 : 15}
        style={{ height: isMobile ? '350px' : '450px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={createLeafletIcon(MAP_CONFIG.user, isMobile)}>
          <Popup><UserLocationPopup location={userLocation} isMobile={isMobile} /></Popup>
        </Marker>

        {lotData && (
          <Marker position={[lotData.latitude, lotData.longitude]} icon={createLeafletIcon(MAP_CONFIG.material, isMobile)}>
            <Popup><MaterialLocationPopup lotData={lotData} /></Popup>
          </Marker>
        )}

        <MapController startPosition={userLocation} lotData={lotData} setRouteSummary={setRouteSummary} />
      </MapContainer>
    </Box>
  );
};

export default MapComponent;