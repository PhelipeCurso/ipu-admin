// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-light border-end vh-100" style={{ width: '250px' }}>
      <div className="list-group list-group-flush p-2">
        <Link to="/" className="list-group-item list-group-item-action">Dashboard</Link>
        <Link to="/metas" className="list-group-item list-group-item-action">Metas</Link>
        <Link to="/contas-receber" className="list-group-item list-group-item-action">Contas a Receber</Link>
        <Link to="/contas-pagar" className="list-group-item list-group-item-action">Contas a Pagar</Link>
        <Link to="/doacoes" className="list-group-item list-group-item-action">Doações</Link>
        <Link to="/segmentos" className="list-group-item list-group-item-action">Segmentos</Link>
        <Link to="/responsaveis" className="list-group-item list-group-item-action">Responsáveis</Link>
        <Link to="/usuarios" className="list-group-item list-group-item-action">Usuários</Link>
        <Link to="/informacoes/noticias" className="list-group-item list-group-item-action">Notícias</Link>
        <Link to="/informacoes/eventos" className="list-group-item list-group-item-action">Eventos</Link>
      </div>
    </div>
  );
}
