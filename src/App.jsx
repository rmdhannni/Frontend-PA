import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Plat from './pages/Plat';
import AddPlat from './pages/AddPlat';
import UpdatePlat from './pages/UpdatePlat';
import Lokasi from './pages/Lokasi';
import AddLokasi from './pages/AddLokasi';
import DistribusiPage from './pages/DistribusiAdmin'; // Import dengan nama yang benar

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plat"
          element={
            <ProtectedRoute role="admin">
              <Plat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plat/add"
          element={
            <ProtectedRoute role="admin">
              <AddPlat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plat/update/:id"
          element={
            <ProtectedRoute role="admin">
              <UpdatePlat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi"
          element={
            <ProtectedRoute role="admin">
              <Lokasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lokasi/add"
          element={
            <ProtectedRoute role="admin">
              <AddLokasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distribusi"
          element={
            <ProtectedRoute role="admin">
              <DistribusiPage />
            </ProtectedRoute>
          }
        />

        {/* User Area */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;