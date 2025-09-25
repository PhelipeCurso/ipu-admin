import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Button, Form, Table, Modal, Card } from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsPlusCircle } from "react-icons/bs";

import PdvNavbar from "../components/PdvNavbar";

function ProdutosPdv() {
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState({ nome: "", preco: "" });
  const [produtoEditando, setProdutoEditando] = useState(null);

  const carregarProdutos = async () => {
    const snap = await getDocs(collection(db, "produtos"));
    setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const abrirNovoProduto = () => {
    setProdutoAtual({ nome: "", preco: "" });
    setProdutoEditando(null);
    setShowModal(true);
  };

  const abrirEdicao = (produto) => {
    setProdutoAtual({ nome: produto.nome, preco: produto.preco });
    setProdutoEditando(produto);
    setShowModal(true);
  };

  const salvarProduto = async () => {
    if (!produtoAtual.nome || !produtoAtual.preco) return;

    if (produtoEditando) {
      const ref = doc(db, "produtos", produtoEditando.id);
      await updateDoc(ref, {
        nome: produtoAtual.nome,
        preco: parseFloat(produtoAtual.preco),
      });
    } else {
      await addDoc(collection(db, "produtos"), {
        nome: produtoAtual.nome,
        preco: parseFloat(produtoAtual.preco),
      });
    }

    setProdutoAtual({ nome: "", preco: "" });
    setProdutoEditando(null);
    setShowModal(false);
    carregarProdutos();
  };

  const excluirProduto = async (id) => {
    if (window.confirm("Deseja excluir este produto?")) {
      await deleteDoc(doc(db, "produtos", id));
      carregarProdutos();
    }
  };

  return (
    <div>
      {/* Navbar do PDV */}
      <PdvNavbar />

      <div className="container py-4">
        <Card className="shadow-lg border-0">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold text-primary mb-0">📦 Produtos do PDV</h3>
              <Button variant="success" onClick={abrirNovoProduto}>
                <BsPlusCircle className="me-2" />
                Novo Produto
              </Button>
            </div>

            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th className="text-center">Preço</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      Nenhum produto cadastrado
                    </td>
                  </tr>
                ) : (
                  produtos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td className="text-center">R$ {p.preco.toFixed(2)}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="warning" size="sm" onClick={() => abrirEdicao(p)}>
                            <BsPencilSquare className="me-1" />
                            Editar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => excluirProduto(p.id)}>
                            <BsTrash className="me-1" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal Novo/Editar Produto */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {produtoEditando ? "✏️ Editar Produto" : "➕ Novo Produto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={produtoAtual.nome}
                  onChange={(e) =>
                    setProdutoAtual({ ...produtoAtual, nome: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Digite o preço"
                  value={produtoAtual.preco}
                  onChange={(e) =>
                    setProdutoAtual({ ...produtoAtual, preco: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvarProduto}>
              {produtoEditando ? "Salvar Alterações" : "Adicionar Produto"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ProdutosPdv;
