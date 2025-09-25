import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { Modal, Button, Form, Card, Table, Badge } from 'react-bootstrap';

export default function ContasPagar() {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    destino: '',
  });

  const [registros, setRegistros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarRegistro = async (e) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.destino) return;

    await addDoc(collection(db, 'contas_pagar'), {
      ...form,
      valor: parseFloat(form.valor),
      data: Timestamp.now(),
      cancelado: false,
    });

    setForm({ descricao: '', valor: '', destino: '' });
    carregarRegistros();
  };

  const carregarRegistros = async () => {
    const snapshot = await getDocs(collection(db, 'contas_pagar'));
    const dados = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRegistros(dados);
  };

  useEffect(() => {
    carregarRegistros();
  }, []);

  const abrirModalCancelamento = (registro) => {
    setRegistroSelecionado(registro);
    setJustificativa('');
    setShowModal(true);
  };

  const confirmarCancelamento = async () => {
    if (!justificativa.trim()) {
      alert('Justificativa é obrigatória!');
      return;
    }

    const ref = doc(db, 'contas_pagar', registroSelecionado.id);
    await updateDoc(ref, {
      cancelado: true,
      justificativa,
      canceladoEm: serverTimestamp(),
    });

    setShowModal(false);
    carregarRegistros();
  };

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">💸 Contas a Pagar</h3>

        {/* Card do formulário */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">Novo Lançamento</h5>
            <Form className="row g-3" onSubmit={salvarRegistro}>
              <Form.Group className="col-md-4">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  type="text"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Valor (R$)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="valor"
                  value={form.valor}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Destino</Form.Label>
                <Form.Control
                  type="text"
                  name="destino"
                  value={form.destino}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <div className="col-md-2 d-flex align-items-end">
                <Button type="submit" variant="danger" className="w-100">
                  Registrar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Card da tabela */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">📋 Lançamentos Registrados</h5>
            <Table hover bordered responsive>
              <thead className="table-light">
                <tr>
                  <th>Descrição</th>
                  <th>Valor (R$)</th>
                  <th>Destino</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Justificativa</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className={r.cancelado ? 'table-danger' : ''}>
                    <td>{r.descricao}</td>
                    <td>{r.valor.toFixed(2)}</td>
                    <td>{r.destino}</td>
                    <td>{r.data?.toDate().toLocaleDateString()}</td>
                    <td>
                      {r.cancelado ? (
                        <Badge bg="danger">Cancelado</Badge>
                      ) : (
                        <Badge bg="success">Ativo</Badge>
                      )}
                    </td>
                    <td>{r.cancelado ? r.justificativa : '-'}</td>
                    <td>
                      {!r.cancelado && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => abrirModalCancelamento(r)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal de Justificativa */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Cancelar Lançamento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Justificativa do cancelamento:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: pagamento incorreto, duplicado..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Fechar
            </Button>
            <Button variant="danger" onClick={confirmarCancelamento}>
              Confirmar Cancelamento
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
}
