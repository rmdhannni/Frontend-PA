import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

const ProtectedRoute = ({ children, role }) => {
  const user = getCurrentUser(); // Mendapatkan data pengguna dari localStorage

  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />; // Redirect ke login jika pengguna tidak valid
  }

  return children; // Render komponen jika peran sesuai
};

export default ProtectedRoute;