import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';

export default function Metas() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [metas, setMetas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const carregarMetas = async () => {
    const snap = await getDocs(collection(db, 'metas'));
    const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMetas(lista);
  };

  useEffect(() => {
    carregarMetas();
  }, []);

  const salvarOuAtualizarMeta = async () => {
    if (!descricao || !valor) return alert('Preencha todos os campos');

    if (editandoId) {
      await updateDoc(doc(db, 'metas', editandoId), {
        descricao,
        valor: parseFloat(valor)
      });
    } else {
      await addDoc(collection(db, 'metas'), {
        descricao,
        valor: parseFloat(valor),
        ativa: true
      });
    }

    setDescricao('');
    setValor('');
    setEditandoId(null);
    carregarMetas();
  };

  const removerMeta = async (id) => {
    await deleteDoc(doc(db, 'metas', id));
    carregarMetas();
  };

  const editarMeta = (meta) => {
    setDescricao(meta.descricao);
    setValor(meta.valor);
    setEditandoId(meta.id);
  };

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">🎯 Cadastro de Metas</h3>

        {/* Card do Formulário */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">{editandoId ? 'Editar Meta' : 'Nova Meta'}</h5>
            <Form className="row g-3">
              <Form.Group className="col-md-6">
                <Form.Label>Descrição da meta</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Reformar salão"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="col-md-4">
                <Form.Label>Valor (R$)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </Form.Group>
              <div className="col-md-2 d-flex align-items-end">
                <Button
                  variant={editandoId ? "warning" : "primary"}
                  className="w-100"
                  onClick={salvarOuAtualizarMeta}
                >
                  {editandoId ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Lista de Metas */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">📋 Metas Registradas</h5>
            {metas.length > 0 ? (
              <ListGroup variant="flush">
                {metas.map(meta => (
                  <ListGroup.Item
                    key={meta.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{meta.descricao}</strong> — 
                      <Badge bg="info" className="ms-2">
                        R$ {meta.valor.toFixed(2)}
                      </Badge>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => editarMeta(meta)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removerMeta(meta.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted text-center mb-0">Nenhuma meta cadastrada</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}
