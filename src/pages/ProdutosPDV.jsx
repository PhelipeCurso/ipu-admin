import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button, Table, Modal, Form } from "react-bootstrap";
import PdvNavbar from "../components/PdvNavbar";

function ProdutosPDV() {
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    preco: "",
    estoque: 0,
    controlaEstoque: false,
  });

  const carregarProdutos = async () => {
    const snap = await getDocs(collection(db, "produtos"));
    setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const abrirModal = (produto = null) => {
    if (produto) {
      setEditando(produto.id);
      setForm({
        nome: produto.nome,
        preco: produto.preco,
        estoque: produto.estoque || 0,
        controlaEstoque: produto.controlaEstoque || false,
      });
    } else {
      setEditando(null);
      setForm({ nome: "", preco: "", estoque: 0, controlaEstoque: false });
    }
    setShowModal(true);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    if (form.controlaEstoque && form.estoque < 0) {
      alert("❌ O estoque não pode ser negativo.");
      return;
    }

    const dados = {
      nome: form.nome,
      preco: parseFloat(form.preco),
      estoque: form.controlaEstoque ? parseInt(form.estoque, 10) : null,
      controlaEstoque: form.controlaEstoque,
    };

    if (editando) {
      await updateDoc(doc(db, "produtos", editando), dados);
    } else {
      await addDoc(collection(db, "produtos"), dados);
    }

    setShowModal(false);
    carregarProdutos();
  };

  const excluirProduto = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteDoc(doc(db, "produtos", id));
      carregarProdutos();
    }
  };

  return (
    <div>
      <PdvNavbar />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>📦 Produtos PDV</h3>
          <Button onClick={() => abrirModal()}>➕ Novo Produto</Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Controla Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>R$ {p.preco.toFixed(2)}</td>
                <td>{p.controlaEstoque ? p.estoque : "∞"}</td>
                <td>{p.controlaEstoque ? "Sim" : "Não"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => abrirModal(p)}
                  >
                    Editar
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => excluirProduto(p.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editando ? "Editar Produto" : "Novo Produto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={salvarProduto}>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Controla Estoque"
                  checked={form.controlaEstoque}
                  onChange={(e) =>
                    setForm({ ...form, controlaEstoque: e.target.checked })
                  }
                />
              </Form.Group>
              {form.controlaEstoque && (
                <Form.Group className="mb-3">
                  <Form.Label>Quantidade em Estoque</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.estoque}
                    min="0"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estoque: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </Form.Group>
              )}
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="ms-2">
                  Salvar
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default ProdutosPDV;
