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

        {/* Menu PDV como dropdown dentro do list-group */}
        <div className="dropdown">
          <a
            className="list-group-item list-group-item-action dropdown-toggle"
            href="#"
            id="pdvDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            PDV
          </a>
          <ul className="dropdown-menu" aria-labelledby="pdvDropdown">
            <li>
              <Link className="dropdown-item" to="/pdv/login">Login PDV</Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/pdv/PontoDeVenda">Ponto de Venda</Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/pdv/ProdutosPDV">Produtos do PDV</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
