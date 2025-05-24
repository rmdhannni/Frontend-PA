import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { useEffect, useRef, useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Box, 
  Divider,
  Grid,
  Paper,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  Code as CodeIcon,
  Place as PlaceIcon,
  GpsFixed as GpsFixedIcon
} from '@mui/icons-material';

// Map Controller Component
const MapController = ({ startPosition, lotData }) => {
  const map = useMap();
  const routingControlRef = useRef();

  useEffect(() => {
    if (startPosition && lotData) {
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
            color: '#ff69b4', 
            weight: 5,
            opacity: 0.7
          }]
        },
        show: false,
        addWaypoints: false
      }).addTo(map);

      routingControlRef.current = routingControl;

      map.fitBounds([
        [startPosition.lat, startPosition.lng],
        [lotData.latitude, lotData.longitude]
      ]);
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [startPosition, lotData]);

  return null;
};

// Reusable Detail Item Component
const DetailItem = ({ icon, label, value, isMobile, monospace = false }) => {
  const theme = useTheme();
  
  return (
    <Box 
      display="flex" 
      alignItems="flex-start" 
      gap={1}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[800] 
          : theme.palette.grey[100],
        borderRadius: 1,
        p: 1,
        width: '100%'
      }}
    >
      <Box sx={{ 
        color: 'text.secondary',
        pt: 0.2
      }}>
        {React.cloneElement(icon, {
          sx: { 
            fontSize: isMobile ? 16 : 18 
          }
        })}
      </Box>
      <Box flex={1}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            display: 'block', 
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {label}
        </Typography>
        {typeof value === 'string' ? (
          <Typography
            variant={isMobile ? "body2" : "body1"}
            sx={{
              wordBreak: 'break-word',
              fontFamily: monospace ? 'monospace' : 'inherit',
              fontSize: monospace ? (isMobile ? '0.7rem' : '0.8rem') : 'inherit'
            }}
          >
            {value}
          </Typography>
        ) : value}
      </Box>
    </Box>
  );
};

// Material Location Popup Component
const MaterialLocationPopup = ({ lotData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

          {/* Kuantitas */}
          <Grid item xs={12}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mt={1}
              px={1}
            >
              <Typography 
                variant={isMobile ? "caption" : "body2"}
                color="text.secondary"
              >
                Total Stok:
              </Typography>
              <Chip
                label={`${lotData.Kuantitas} Unit`}
                color="success"
                size="small"
                sx={{
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.7rem' : '0.8rem'
                }}
              />
            </Box>
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
  const mapRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung geolokasi');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setLocationError('Akses lokasi diperlukan untuk menampilkan rute');
        console.error('Error geolokasi:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000
      }
    );
  }, []);

  // Popup configuration
  const popupOptions = {
    className: 'custom-popup',
    maxWidth: '100%',
    minWidth: 250,
    autoPanPaddingTopLeft: [20, 20],
    autoPanPaddingBottomRight: [20, 20]
  };

  // Error state display
  if (locationError) {
    return (
      <Paper 
        elevation={2}
        sx={{
          height: isMobile ? '300px' : '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'error.light',
          color: 'error.contrastText',
          p: isMobile ? 2 : 3,
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Box>
          <LocationIcon sx={{ fontSize: isMobile ? 36 : 48, mb: 2, opacity: 0.7 }} />
          <Typography variant={isMobile ? "body1" : "h6"} gutterBottom>
            Akses Lokasi Diperlukan
          </Typography>
          <Typography variant={isMobile ? "caption" : "body2"}>
            {locationError}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Loading state display
  if (!userLocation) {
    return (
      <Paper 
        elevation={1}
        sx={{
          height: isMobile ? '300px' : '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          p: isMobile ? 2 : 3,
          borderRadius: 2
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={isMobile ? 32 : 40} sx={{ mb: 2 }} />
          <Typography variant={isMobile ? "body2" : "body1"}>
            Mendeteksi lokasi Anda...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={isMobile ? 14 : 15}
        style={{ 
          height: isMobile ? '350px' : '400px', 
          width: '100%',
          backgroundColor: '#f8f8f8'
        }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: isMobile ? [20, 33] : [25, 41],
            iconAnchor: isMobile ? [10, 33] : [12, 41]
          })}
        >
          <Popup {...popupOptions}>
            <Card sx={{ 
              width: '100%',
              maxWidth: isMobile ? '85vw' : '300px',
              boxShadow: 2,
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Lokasi Anda
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </Typography>
              </CardContent>
            </Card>
          </Popup>
        </Marker>

        {/* Material Location Marker */}
        {lotData && (
          <Marker
            position={[lotData.latitude, lotData.longitude]}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-pink.png',
              iconSize: isMobile ? [20, 33] : [25, 41],
              iconAnchor: isMobile ? [10, 33] : [12, 41]
            })}
          >
            <Popup {...popupOptions}>
              <MaterialLocationPopup lotData={lotData} />
            </Popup>
          </Marker>
        )}

        <MapController 
          startPosition={userLocation} 
          lotData={lotData} 
        />
      </MapContainer>

      {/* Custom CSS for Popup */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
        }
        
        @media (max-width: 600px) {
          .leaflet-popup {
            margin-left: 10px !important;
            margin-right: 10px !important;
          }
          
          .leaflet-popup-content-wrapper {
            max-width: 90vw !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default MapComponent;