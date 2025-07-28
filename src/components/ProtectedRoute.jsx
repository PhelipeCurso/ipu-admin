import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, admin, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (!user || !admin) return <Navigate to="/login" />;

  return children;
}
