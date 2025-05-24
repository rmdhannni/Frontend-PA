import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Routing = ({ waypoints }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    if (routingRef.current) routingRef.current.remove();

    routingRef.current = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
    }).addTo(map);

    return () => {
      if (routingRef.current) routingRef.current.remove();
    };
  }, [waypoints, map]);

  return null;
};

const PetaDistribusi = () => {
  const [lot, setLot] = useState('');
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  const defaultCenter = {
    lat: -7.20534204144016,
    lng: 112.74168297734593,
  };

  // Koordinat polygon PT PAL (perkiraan, bisa kamu sesuaikan sesuai peta sebenarnya)
  const ptPalPolygon = [
    [-7.2049, 112.7397],
    [-7.2050, 112.7430],
    [-7.2070, 112.7430],
    [-7.2070, 112.7397],
  ];

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/plat/lot/${lot}`);
      if (!res.ok) throw new Error('Plat tidak ditemukan');
      const data = await res.json();
      const lokasiArray = Array.isArray(data) ? data : [data];

      const formatted = lokasiArray.map(item => ({
        lat: parseFloat(item.latitude),
        lng: parseFloat(item.longitude),
        lot: item.Lot_Batch_Number,
        id: item.ID_Plat,
      }));

      setLocations(formatted);
      setError('');
    } catch (err) {
      setError(err.message);
      setLocations([]);
    }
  };

  const waypoints = [defaultCenter, ...(locations.length > 0 ? [locations[0]] : [])];

  return (
    <div className="mt-4">
      <h3 className="mb-3">📍 Peta Lokasi Plat</h3>
      <div className="mb-3 d-flex gap-2">
        <MDBInput label="Cari Lot Batch" value={lot} onChange={(e) => setLot(e.target.value)} />
        <MDBBtn onClick={handleSearch}>Cari</MDBBtn>
      </div>
      {error && <p className="text-danger">{error}</p>}

      <div style={{ height: '500px' }}>
        <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={18} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Polygon area PT PAL */}
          <Polygon
            positions={ptPalPolygon}
            pathOptions={{ color: 'pink', fillColor: 'pink', fillOpacity: 0.3 }}
          />

          <Marker position={[defaultCenter.lat, defaultCenter.lng]}>
            <Popup>Posisi Awal / Pusat</Popup>
          </Marker>

          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                Lot: {loc.lot} <br />
                Lat: {loc.lat}, Lng: {loc.lng}
              </Popup>
            </Marker>
          ))}

          {waypoints.length >= 2 && <Routing waypoints={waypoints} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default PetaDistribusi;
