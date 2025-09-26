// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import { Nav } from "react-bootstrap";

export default function Sidebar() {
  return (
    <div className="bg-light border-end vh-100" style={{ width: '250px' }}>
      <div className="list-group list-group-flush p-2">
        <Link to="/Dashboard" className="list-group-item list-group-item-action">Dashboard</Link>
        <Link to="/metas" className="list-group-item list-group-item-action">Metas</Link>
        <Link to="/contas-receber" className="list-group-item list-group-item-action">Contas a Receber</Link>
        <Link to="/contas-pagar" className="list-group-item list-group-item-action">Contas a Pagar</Link>
        <Link to="/doacoes" className="list-group-item list-group-item-action">Doações</Link>
        <Link to="/segmentos" className="list-group-item list-group-item-action">Segmentos</Link>
        <Link to="/responsaveis" className="list-group-item list-group-item-action">Responsáveis</Link>
        <Link to="/usuarios" className="list-group-item list-group-item-action">Usuários</Link>
        <Link to="/informacoes/noticias" className="list-group-item list-group-item-action">Notícias</Link>
        <Link to="/informacoes/eventos" className="list-group-item list-group-item-action">Eventos</Link>
        <Link to="/home" className="list-group-item list-group-item-action">Home</Link>

        {/* Menu PDV como dropdown dentro do list-group */}
        <button
          className="list-group-item list-group-item-action dropdown-toggle"
          id="pdvDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          PDV
        </button>
        <ul className="dropdown-menu" aria-labelledby="pdvDropdown">
          <li>
            <Link className="dropdown-item" to="/pdv/login">Login PDV</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/pdv/pontodevenda">Ponto de Venda</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/pdv/produtos">Produtos do PDV</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/pdv/configurar-recibo">Configurar Recibo</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/pdv/vendas">Vendas</Link>

          </li>
          <li>
            <Link className="dropdown-item" to="/pdv/criarsenhapdv">Criar Senha PDV</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/movimento-pdv">Movimento PDV</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
