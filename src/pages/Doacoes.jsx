import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { Modal, Button, Form, Card, Table, Badge } from 'react-bootstrap';

export default function Doacoes() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [doacoes, setDoacoes] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [doacaoSelecionada, setDoacaoSelecionada] = useState(null);
  const [origem, setOrigem] = useState('');

  const carregarDoacoes = async () => {
    const snap = await getDocs(collection(db, 'doacoes'));
    const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoacoes(lista);
  };

  useEffect(() => {
    carregarDoacoes();
  }, []);

  const salvarDoacao = async () => {
    if (!descricao || !valor || !data) return alert('Preencha todos os campos');

    await addDoc(collection(db, 'doacoes'), {
      descricao,
      valor: parseFloat(valor),
      data: Timestamp.fromDate(new Date(data)),
      cancelado: false,
      origem: origem || 'painel-web',
      criadoEm: serverTimestamp()
    });

    setDescricao('');
    setValor('');
    setData('');
    setOrigem('');
    carregarDoacoes();
  };

  const abrirModalCancelamento = (doacao) => {
    setDoacaoSelecionada(doacao);
    setJustificativa('');
    setShowCancelModal(true);
  };

  const confirmarCancelamento = async () => {
    if (!justificativa.trim()) {
      alert('Justificativa é obrigatória!');
      return;
    }

    await updateDoc(doc(db, 'doacoes', doacaoSelecionada.id), {
      cancelado: true,
      justificativa,
      canceladoEm: serverTimestamp(),
    });

    setShowCancelModal(false);
    carregarDoacoes();
  };

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">🙏 Doações</h3>

        {/* Card do Formulário */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">Nova Doação</h5>
            <Form className="row g-3">
              <Form.Group className="col-md-4">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  placeholder="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Valor (R$)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Data</Form.Label>
                <Form.Control
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="col-md-2">
                <Form.Label>Origem</Form.Label>
                <Form.Control
                  placeholder="Ex: PIX"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                />
              </Form.Group>
              <div className="col-12 text-end">
                <Button variant="primary" onClick={salvarDoacao}>
                  Salvar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Card da Tabela */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">📋 Doações Registradas</h5>
            <Table hover bordered responsive>
              <thead className="table-light">
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Justificativa</th>
                  <th>Origem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {doacoes.map((d) => (
                  <tr key={d.id} className={d.cancelado ? 'table-danger' : ''}>
                    <td>{d.cancelado ? <del>{d.descricao}</del> : d.descricao}</td>
                    <td>R$ {d.valor.toFixed(2)}</td>
                    <td>{d.data?.toDate().toLocaleDateString()}</td>
                    <td>
                      {d.cancelado ? (
                        <Badge bg="danger">Cancelado</Badge>
                      ) : (
                        <Badge bg="success">Ativo</Badge>
                      )}
                    </td>
                    <td>{d.cancelado ? d.justificativa || '—' : '—'}</td>
                    <td>{d.origem || 'não informado'}</td>
                    <td>
                      {!d.cancelado && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => abrirModalCancelamento(d)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {doacoes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Nenhuma doação cadastrada
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal de Justificativa */}
        <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Cancelar Doação</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Justificativa do cancelamento:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: valor incorreto, lançamento duplicado..."
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
      </div>
    </Layout>
  );
}
