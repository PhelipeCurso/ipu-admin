import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, admin, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (!user || !admin) return <Navigate to="/login" />;

  return children;
}

// 🔹 Só entra se tiver usaPDV = true (Auth ou PDV login)
export function ProtectedRoutePDV({ children }) {
  const { user, pdvUser, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Carregando...</div>;

  const autorizado = (user && user.usaPDV) || (pdvUser && pdvUser.usaPDV);

  if (!autorizado) return <Navigate to="/pdv/login" />;

  return children;
}
