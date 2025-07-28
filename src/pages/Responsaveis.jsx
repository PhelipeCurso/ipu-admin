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

export default function Responsaveis() {
  const [segmentos, setSegmentos] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    segmentoId: '',
  });
  const [responsaveis, setResponsaveis] = useState([]);

  // Carregar todos os segmentos
  const carregarSegmentos = async () => {
    const snapshot = await getDocs(collection(db, 'segmentos'));
    const dados = snapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setSegmentos(dados);
  };

  // Carregar responsáveis
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
      <div className="container">
        <h3>Atribuir Responsáveis por Segmento</h3>

        {/* Formulário */}
        <form className="row g-3 mb-4" onSubmit={salvarResponsavel}>
          <div className="col-md-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Segmento</label>
            <select
              className="form-select"
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
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Atribuir
            </button>
          </div>
        </form>

        {/* Lista de Responsáveis */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Segmento</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {responsaveis.map((r) => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td>{r.email}</td>
                <td>{r.segmentoNome}</td>
                <td>{r.criadoEm?.toDate().toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
