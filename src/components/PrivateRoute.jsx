// PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, pdvUser, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user && !pdvUser) return <Navigate to="/login" />;

  return children;
}
