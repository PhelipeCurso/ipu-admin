import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

function PontoDeVenda() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pagamento, setPagamento] = useState("dinheiro");
  const location = useLocation();
  const operador = location.state?.operador || "Operador";

  // Carregar produtos
  useEffect(() => {
    const carregarProdutos = async () => {
      const snap = await getDocs(collection(db, "produtos"));
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    carregarProdutos();
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };

  const removerDoCarrinho = (id) => {
    setCarrinho((prev) => prev.filter((p) => p.id !== id));
  };

  const total = carrinho.reduce((sum, p) => sum + p.qtd * p.preco, 0);

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return;

    await addDoc(collection(db, "pedidos"), {
      operador,
      itens: carrinho.map((p) => ({
        nome: p.nome,
        qtd: p.qtd,
        valorUnit: p.preco,
      })),
      total,
      pagamento,
      data: new Date(),
    });

    setCarrinho([]);
    setShowModal(false);
    alert("Venda registrada com sucesso!");
  };

  return (
    <div className="container py-4">
      <h2>PDV</h2>
      <p>Bem-vindo, {operador}</p>

      <div className="row">
        {/* Lista de Produtos */}
        <div className="col-md-8">
          <h4>Produtos</h4>
          <div className="d-flex flex-wrap gap-2">
            {produtos.map((p) => (
              <Button
                key={p.id}
                variant="outline-primary"
                onClick={() => adicionarAoCarrinho(p)}
              >
                {p.nome} - R$ {p.preco}
              </Button>
            ))}
          </div>
        </div>

        {/* Carrinho */}
        <div className="col-md-4">
          <h4>Carrinho</h4>
          <ul className="list-group">
            {carrinho.map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between"
              >
                {item.nome} x{item.qtd}
                <span>R$ {(item.qtd * item.preco).toFixed(2)}</span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removerDoCarrinho(item.id)}
                >
                  X
                </Button>
              </li>
            ))}
          </ul>
          <h5 className="mt-3">Total: R$ {total.toFixed(2)}</h5>
          <Button
            className="mt-2"
            variant="success"
            onClick={() => setShowModal(true)}
            disabled={carrinho.length === 0}
          >
            Finalizar Venda
          </Button>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Finalizar Venda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Label>Forma de Pagamento</Form.Label>
            <Form.Select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">Pix</option>
            </Form.Select>
            <h5 className="mt-3">Total: R$ {total.toFixed(2)}</h5>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={finalizarVenda}>
            Confirmar Venda
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PdvPanel;
