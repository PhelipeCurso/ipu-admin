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

export default function Metas() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [metas, setMetas] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // <- nova flag

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
      // Atualizar meta existente
      await updateDoc(doc(db, 'metas', editandoId), {
        descricao,
        valor: parseFloat(valor)
      });
    } else {
      // Nova meta
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
      <div className="container">
        <h3 className="mb-4">Cadastro de Metas</h3>

        <div className="row g-2 mb-4">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Descrição da meta"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Valor (R$)"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-primary w-100"
              onClick={salvarOuAtualizarMeta}
            >
              {editandoId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>

        <ul className="list-group">
          {metas.map(meta => (
            <li key={meta.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{meta.descricao} - R$ {meta.valor.toFixed(2)}</span>
              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => editarMeta(meta)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removerMeta(meta.id)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
