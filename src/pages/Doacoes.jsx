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
import { Modal, Button, Form } from 'react-bootstrap';

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
    const lista = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
     // .filter(doc => !doc.cancelado);
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
      origem:'painel-web',
    });

    setDescricao('');
    setValor('');
    setData('');
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
      <div className="container">
        <h3 className="mb-4">Doações</h3>

        {/* Formulário */}
        <div className="row g-2 mb-4">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Valor"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Origem"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
            />
          </div>  
          
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={salvarDoacao}>
              Salvar
            </button>
          </div>
        </div>

        {/* Lista */}
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Data</th>              
              <th>Status</th>
              <th>Justificativa</th>
              <th>Ações</th>
              <th>Origem</th>
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
          <span className="badge bg-danger">Cancelado</span>
        ) : (
          <span className="badge bg-success">Ativo</span>
        )}
      </td>
      <td>{d.cancelado ? d.justificativa || '—' : '—'}</td>
      <td>
        {!d.cancelado && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => abrirModalCancelamento(d)}
          >
            Cancelar
          </button>
        )}
      </td>
      <td>{d.origem || 'não informado'}</td>
    </tr>
    
  ))}
  {doacoes.length === 0 && (
    <tr>
      <td colSpan="7" className="text-center">Nenhuma doação cadastrada</td>
    </tr>
  )}
</tbody>


        </table>

        {/* Modal de Justificativa */}
        <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
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
