import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ContasReceber() {
  const [lancamentos, setLancamentos] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [novo, setNovo] = useState({
    valor: '',
    segmento: '',
    data: '',
  });

  const carregarLancamentos = async () => {
    const snap = await getDocs(collection(db, 'contas_receber'));
    const dados = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLancamentos(dados);
  };

  useEffect(() => {
    carregarLancamentos();
  }, []);

  const abrirModalCancelamento = (lancamento) => {
    setLancamentoSelecionado(lancamento);
    setJustificativa('');
    setShowCancelModal(true);
  };

  const confirmarCancelamento = async () => {
    if (!justificativa.trim()) {
      alert('Justificativa é obrigatória!');
      return;
    }

    const ref = doc(db, 'contas_receber', lancamentoSelecionado.id);
    await updateDoc(ref, {
      cancelado: true,
      justificativa,
      canceladoEm: serverTimestamp(),
    });

    setShowCancelModal(false);
    carregarLancamentos();
  };

  const salvarNovoLancamento = async () => {
    const { valor, segmento, data } = novo;
    if (!valor || !segmento || !data) {
      alert('Preencha todos os campos!');
      return;
    }

    await addDoc(collection(db, 'contas_receber'), {
      valor: parseFloat(valor),
      segmento,
      data: Timestamp.fromDate(new Date(data)),
      cancelado: false,
      criadoEm: serverTimestamp(),
    });

    setShowNovoModal(false);
    setNovo({ valor: '', segmento: '', data: '' });
    carregarLancamentos();
  };

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Contas a Receber</h3>
          <Button variant="success" onClick={() => setShowNovoModal(true)}>
            + Novo Lançamento
          </Button>
        </div>

        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Data</th>
              <th>Valor</th>
              <th>Segmento</th>
              <th>Status</th>
              <th>Justificativa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map(lanc => (
              <tr key={lanc.id} className={lanc.cancelado ? 'table-danger' : ''}>
                <td>{lanc.data?.toDate().toLocaleDateString()}</td>
                <td>R$ {lanc.valor?.toFixed(2)}</td>
                <td>{lanc.segmento || '-'}</td>
                <td>
                  {lanc.cancelado ? (
                    <span className="badge bg-danger">Cancelado</span>
                  ) : (
                    <span className="badge bg-success">Ativo</span>
                  )}
                </td>
                <td>{lanc.cancelado ? lanc.justificativa : '-'}</td>
                <td>
                  {!lanc.cancelado && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => abrirModalCancelamento(lanc)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Cancelamento */}
        <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
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
                placeholder="Ex: valor errado, duplicado..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Fechar
            </Button>
            <Button variant="danger" onClick={confirmarCancelamento}>
              Confirmar Cancelamento
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Novo Lançamento */}
        <Modal show={showNovoModal} onHide={() => setShowNovoModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Lançamento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Valor (R$)</Form.Label>
              <Form.Control
                type="number"
                value={novo.valor}
                onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Segmento</Form.Label>
              <Form.Control
                type="text"
                value={novo.segmento}
                onChange={(e) => setNovo({ ...novo, segmento: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="date"
                value={novo.data}
                onChange={(e) => setNovo({ ...novo, data: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNovoModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvarNovoLancamento}>
              Salvar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
}
