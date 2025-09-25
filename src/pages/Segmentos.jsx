import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { Card, Table, Button, Form } from 'react-bootstrap';

export default function Segmentos() {
  const [nomeSegmento, setNomeSegmento] = useState('');
  const [segmentos, setSegmentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [novoNome, setNovoNome] = useState('');

  const salvarSegmento = async (e) => {
    e.preventDefault();
    const nome = nomeSegmento.trim();
    if (!nome) return;

    const jaExiste = segmentos.some((s) => s.nome.toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
      alert('Já existe um segmento cadastrado com esse nome!');
      return;
    }

    await addDoc(collection(db, 'segmentos'), {
      nome,
      criadoEm: Timestamp.now(),
    });

    setNomeSegmento('');
    carregarSegmentos();
  };

  const iniciarEdicao = (segmento) => {
    setEditandoId(segmento.id);
    setNovoNome(segmento.nome);
  };

  const salvarEdicao = async (id) => {
    const nome = novoNome.trim();
    if (!nome) return;

    const jaExiste = segmentos.some(
      (s) => s.id !== id && s.nome.toLowerCase() === nome.toLowerCase()
    );
    if (jaExiste) {
      alert('Já existe um segmento cadastrado com esse nome!');
      return;
    }

    await updateDoc(doc(db, 'segmentos', id), {
      nome: novoNome.trim(),
    });

    setEditandoId(null);
    setNovoNome('');
    carregarSegmentos();
  };

  const carregarSegmentos = async () => {
    const snapshot = await getDocs(collection(db, 'segmentos'));
    const dados = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSegmentos(dados);
  };

  useEffect(() => {
    carregarSegmentos();
  }, []);

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">📌 Cadastro de Segmentos</h3>

        {/* Card de Cadastro */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">Novo Segmento</h5>
            <Form className="row g-3" onSubmit={salvarSegmento}>
              <Form.Group className="col-md-10">
                <Form.Label>Nome do Segmento</Form.Label>
                <Form.Control
                  type="text"
                  value={nomeSegmento}
                  onChange={(e) => setNomeSegmento(e.target.value)}
                  placeholder="Ex: Ministério Infantil, Cantina, Louvor..."
                  required
                />
              </Form.Group>
              <div className="col-md-2 d-flex align-items-end">
                <Button type="submit" variant="success" className="w-100">
                  Adicionar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Card de Listagem */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">📋 Segmentos Cadastrados</h5>
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Segmento</th>
                  <th>Cadastrado em</th>
                  <th style={{ width: 180 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {segmentos.length > 0 ? (
                  segmentos.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {editandoId === s.id ? (
                          <Form.Control
                            type="text"
                            value={novoNome}
                            onChange={(e) => setNovoNome(e.target.value)}
                          />
                        ) : (
                          s.nome
                        )}
                      </td>
                      <td>{s.criadoEm?.toDate().toLocaleDateString()}</td>
                      <td>
                        {editandoId === s.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              className="me-2"
                              onClick={() => salvarEdicao(s.id)}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditandoId(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => iniciarEdicao(s)}
                          >
                            Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      Nenhum segmento cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}
