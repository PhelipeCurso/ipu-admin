import { useNavigate, useLocation } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import {
  BsGearFill,
  BsCashStack,
  BsBoxSeam,
  BsFileEarmarkBarGraph,
  BsBoxArrowRight
} from "react-icons/bs";

import "./PainelPdv.css";

function PainelPdv() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pega o operador da navegação (enviado no login)
  const operador = location.state?.operador || "Operador";

  const opcoes = [
    {
      titulo: "Ponto de Venda",
      icone: <BsCashStack size={40} className="text-primary" />,
      rota: "/pdv/pontodevenda",
    },
    {
      titulo: "Produtos",
      icone: <BsBoxSeam size={40} className="text-success" />,
      rota: "/pdv/produtos",
    },
    {
      titulo: "Relatórios de Vendas",
      icone: <BsFileEarmarkBarGraph size={40} className="text-warning" />,
      rota: "/pdv/vendas",
    },
    {
      titulo: "Configurações do Recibo",
      icone: <BsGearFill size={40} className="text-danger" />,
      rota: "/pdv/configurar-recibo",
    },
  ];

  const handleLogout = () => {
    // Se você salvar sessão no localStorage/sessionStorage, limpe aqui
    // localStorage.removeItem("operador");
    navigate("/pdv/login");
  };

  return (
    <div className="container py-5">
      {/* Cabeçalho do painel */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-secondary">
          Bem-vindo, <span className="text-primary">{operador}</span>
        </h4>
        <Button variant="outline-danger" onClick={handleLogout}>
          <BsBoxArrowRight className="me-2" />
          Sair
        </Button>
      </div>

      <h2 className="text-center fw-bold mb-5 text-uppercase text-secondary">
        Painel do PDV
      </h2>

      {/* Cards das opções */}
      <div className="row g-4 justify-content-center">
        {opcoes.map((item, idx) => (
          <div key={idx} className="col-6 col-md-4 col-lg-3">
            <Card
              className="text-center shadow-sm h-100 p-4 border-0 painel-card"
              role="button"
              onClick={() => navigate(item.rota, { state: { operador } })}
            >
              <div className="mb-3 painel-icone">{item.icone}</div>
              <h6 className="fw-semibold text-dark">{item.titulo}</h6>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PainelPdv;
