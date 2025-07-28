import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import Layout from '../components/Layout';

export default function Segmentos() {
  const [nomeSegmento, setNomeSegmento] = useState('');
  const [segmentos, setSegmentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [novoNome, setNovoNome] = useState('');


  const salvarSegmento = async (e) => {
    e.preventDefault();
    //if (!nomeSegmento.trim()) return;
    const nome= nomeSegmento.trim();
    if (!nome) return;
    // Verifica se o segmento já existe
    const jaExiste = segmentos.some(s => s.nome.toLowerCase() === nome.toLowerCase());
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
  const jaExiste = segmentos.some(s => s.id !== id && s.nome.toLowerCase() === nome.toLowerCase());
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
      <div className="container">
        <h3>Cadastro de Segmentos</h3>

        {/* Formulário */}
        <form className="row g-3 mb-4" onSubmit={salvarSegmento}>
          <div className="col-md-10">
            <label className="form-label">Nome do Segmento</label>
            <input
              type="text"
              className="form-control"
              value={nomeSegmento}
              onChange={(e) => setNomeSegmento(e.target.value)}
              placeholder="Ex: Ministério Infantil, Cantina, Louvor..."
              required
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-success w-100">
              Adicionar
            </button>
          </div>
        </form>

        {/* Tabela de Segmentos */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Segmento</th>
              <th>Cadastrado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
  {segmentos.map((s) => (
    <tr key={s.id}>
      <td>
        {editandoId === s.id ? (
          <input
            type="text"
            className="form-control"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
        ) : (
          s.nome
        )}
      </td>
      <td>{s.criadoEm?.toDate().toLocaleDateString()}</td>
      <td style={{ width: 150 }}>
        {editandoId === s.id ? (
          <>
            <button
              className="btn btn-sm btn-primary me-2"
              onClick={() => salvarEdicao(s.id)}
            >
              Salvar
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setEditandoId(null)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => iniciarEdicao(s)}
          >
            Editar
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </Layout>
  );
}
