import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role comparison - handle all formats
  if (role && user.role) {
    const userRole = user.role.toLowerCase().replace(/_/g, '');
    const requiredRole = role.toLowerCase().replace(/_/g, '');
    
    if (userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}