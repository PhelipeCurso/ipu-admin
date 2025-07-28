import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 d-flex justify-content-between">
      <span className="navbar-brand">Painel Administrativo IPU</span>

      {user && (
        <div className="d-flex align-items-center gap-3">
          <span className="text-white small">
            {user.displayName || user.email}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
