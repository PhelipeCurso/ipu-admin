import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function PdvNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/pdv/painel">
          🛒 Painel PDV
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="pdv-navbar" />
        <Navbar.Collapse id="pdv-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/pdv/pontodevenda">Ponto de Venda</Nav.Link>
            <Nav.Link as={Link} to="/pdv/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} to="/pdv/vendas">Relatórios de Vendas</Nav.Link>
            <Nav.Link as={Link} to="/pdv/configurar-recibo">Configurações de Recibo</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PdvNavbar;
