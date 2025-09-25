import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { Card, Form, Button, Table } from 'react-bootstrap';

export default function Responsaveis() {
  const [segmentos, setSegmentos] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    segmentoId: '',
  });
  const [responsaveis, setResponsaveis] = useState([]);

  const carregarSegmentos = async () => {
    const snapshot = await getDocs(collection(db, 'segmentos'));
    const dados = snapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setSegmentos(dados);
  };

  const carregarResponsaveis = async () => {
    const snapshot = await getDocs(collection(db, 'responsaveis'));
    const dados = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const segRef = doc(db, 'segmentos', data.segmentoId);
        const segSnap = await getDoc(segRef);
        return {
          id: docSnap.id,
          ...data,
          segmentoNome: segSnap.exists() ? segSnap.data().nome : 'Desconhecido',
        };
      })
    );
    setResponsaveis(dados);
  };

  useEffect(() => {
    carregarSegmentos();
    carregarResponsaveis();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarResponsavel = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.segmentoId) return;

    await addDoc(collection(db, 'responsaveis'), {
      nome: form.nome,
      email: form.email,
      segmentoId: form.segmentoId,
      criadoEm: Timestamp.now(),
    });

    setForm({ nome: '', email: '', segmentoId: '' });
    carregarResponsaveis();
  };

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">👥 Atribuir Responsáveis por Segmento</h3>

        {/* Formulário */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">Novo Responsável</h5>
            <Form className="row g-3" onSubmit={salvarResponsavel}>
              <Form.Group className="col-md-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome"
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-4">
                <Form.Label>Segmento</Form.Label>
                <Form.Select
                  name="segmentoId"
                  value={form.segmentoId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {segmentos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="col-md-2 d-flex align-items-end">
                <Button type="submit" variant="primary" className="w-100">
                  Atribuir
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Lista de Responsáveis */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">📋 Responsáveis Registrados</h5>
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Segmento</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {responsaveis.length > 0 ? (
                  responsaveis.map((r) => (
                    <tr key={r.id}>
                      <td>{r.nome}</td>
                      <td>{r.email}</td>
                      <td>{r.segmentoNome}</td>
                      <td>{r.criadoEm?.toDate().toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      Nenhum responsável cadastrado
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
