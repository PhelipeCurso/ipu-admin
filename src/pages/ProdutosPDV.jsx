import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Layout from "../components/Layout";
import { Button, Form, Table, Modal } from "react-bootstrap";

function ProdutosPdv() {
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: "", preco: "" });

  const carregarProdutos = async () => {
    const snap = await getDocs(collection(db, "produtos"));
    setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const salvarProduto = async () => {
    if (!novoProduto.nome || !novoProduto.preco) return;
    await addDoc(collection(db, "produtos"), {
      nome: novoProduto.nome,
      preco: parseFloat(novoProduto.preco),
    });
    setNovoProduto({ nome: "", preco: "" });
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
    <Layout>
      <div className="container">
        <h3 className="mb-4">Produtos do PDV</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Novo Produto
        </Button>

        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>R$ {p.preco.toFixed(2)}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => excluirProduto(p.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal Novo Produto */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Produto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={novoProduto.preco}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, preco: e.target.value })
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
              Salvar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
}

export default ProdutosPdv;
