import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Card, Row, Col, Form } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";

function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        navigate("/login");
        return;
      }

      const data = snap.data();
      setUserData(data);

      if (!data.isAdmin && !data.usaPDV) {
        alert("Você não tem permissão para acessar o sistema.");
        navigate("/login");
        return;
      }

      if (data.isAdmin) {
        await carregarResumoAdmin(mes, ano);
      } else if (data.usaPDV) {
        await carregarResumoPDV(mes, ano);
      }
    };

    checkUser();
  }, [navigate, mes, ano]);

  const carregarResumoAdmin = async (mes, ano) => {
    const receitasSnap = await getDocs(collection(db, "contas_receber"));
    const despesasSnap = await getDocs(collection(db, "contas_pagar"));

    const receitas = receitasSnap.docs.map((d) => d.data());
    const despesas = despesasSnap.docs.map((d) => d.data());

    const receitasFiltradas = receitas.filter((r) => {
      const data = r.data?.toDate?.() || new Date(r.data);
      return data.getMonth() + 1 === mes && data.getFullYear() === ano;
    });

    const despesasFiltradas = despesas.filter((d) => {
      const data = d.data?.toDate?.() || new Date(d.data);
      return data.getMonth() + 1 === mes && data.getFullYear() === ano;
    });

    const totalReceitas = receitasFiltradas.reduce((s, r) => s + (r.valor || 0), 0);
    const totalDespesas = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);

    setResumo({ totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas });
  };

  const carregarResumoPDV = async (mes, ano) => {
    const pedidosSnap = await getDocs(collection(db, "pedidos"));
    const pedidos = pedidosSnap.docs.map((d) => d.data());

    const pedidosFiltrados = pedidos.filter((p) => {
      const data = p.data?.toDate?.() || new Date(p.data.seconds * 1000);
      return data.getMonth() + 1 === mes && data.getFullYear() === ano;
    });

    const total = pedidosFiltrados.reduce((s, p) => s + (p.total || 0), 0);
    const dinheiro = pedidosFiltrados.filter(p => p.pagamento === "dinheiro").reduce((s, p) => s + p.total, 0);
    const cartao = pedidosFiltrados.filter(p => p.pagamento === "cartao").reduce((s, p) => s + p.total, 0);
    const pix = pedidosFiltrados.filter(p => p.pagamento === "pix").reduce((s, p) => s + p.total, 0);

    setResumo({ total, dinheiro, cartao, pix });
  };

  if (!userData || !resumo) return <p>Carregando...</p>;

  return (
    <Layout>
    <div className="d-flex">
      
      {/* Conteúdo */}
      <div className="container py-4">
        <h2 className="mb-4">Bem-vindo, {userData.nome || "Usuário"} 👋</h2>

        {/* Filtro mês/ano */}
        <div className="d-flex gap-2 mb-4">
          <Form.Select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
              </option>
            ))}
          </Form.Select>
          <Form.Control
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          />
        </div>

        {/* Resumo */}
        {userData.isAdmin ? (
          <Row>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Receitas</Card.Title>
                  <h4 className="text-success">R$ {resumo.totalReceitas.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Despesas</Card.Title>
                  <h4 className="text-danger">R$ {resumo.totalDespesas.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Saldo</Card.Title>
                  <h4 className={resumo.saldo >= 0 ? "text-success" : "text-danger"}>
                    R$ {resumo.saldo.toFixed(2)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col md={3}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total do Mês</Card.Title>
                  <h4>R$ {resumo.total.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Dinheiro</Card.Title>
                  <h4 className="text-success">R$ {resumo.dinheiro.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Cartão</Card.Title>
                  <h4 className="text-info">R$ {resumo.cartao.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Pix</Card.Title>
                  <h4 className="text-primary">R$ {resumo.pix.toFixed(2)}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default Home;
