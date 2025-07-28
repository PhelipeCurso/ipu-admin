import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  orderBy,
  updateDoc,
  startAfter,
  limit,
} from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import Layout from '../components/Layout';

function InformacoesEventos() {
  const [eventos, setEventos] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [editando, setEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ultimaDoc, setUltimaDoc] = useState(null);
  const [historicoDocs, setHistoricoDocs] = useState([]);
  const [limite] = useState(5);

  const carregarEventos = async (direcao = 'inicial') => {
    try {
      let baseQuery = collection(db, 'informacoes', 'eventos', 'itens');
      let q;

      if (dataInicio && dataFim) {
        const inicio = Timestamp.fromDate(new Date(`${dataInicio}T00:00:00`));
        const fim = Timestamp.fromDate(new Date(`${dataFim}T23:59:59`));
        baseQuery = query(
          baseQuery,
          where('criadoEm', '>=', inicio),
          where('criadoEm', '<=', fim)
        );
      }

      switch (direcao) {
        case 'proxima':
          q = query(baseQuery, orderBy('criadoEm', 'desc'), startAfter(ultimaDoc), limit(limite));
          break;
        case 'anterior':
          const novoHistorico = [...historicoDocs];
          novoHistorico.pop();
          const anterior = novoHistorico[novoHistorico.length - 1];
          q = query(baseQuery, orderBy('criadoEm', 'desc'), startAfter(anterior), limit(limite));
          setHistoricoDocs(novoHistorico);
          break;
        default:
          q = query(baseQuery, orderBy('criadoEm', 'desc'), limit(limite));
          setHistoricoDocs([]);
          break;
      }

      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate(),
      }));

      if (!lista.length) return;

      setEventos(lista);
      setUltimaDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (direcao === 'proxima' || direcao === 'inicial') {
        setHistoricoDocs((prev) => [...prev, snapshot.docs[0]]);
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao carregar eventos.');
    }
  };

  const excluirEvento = async (id, midiaUrl) => {
    if (!window.confirm('Deseja excluir este evento e sua mídia?')) return;

    try {
      const decodedUrl = decodeURIComponent(midiaUrl);
      const match = decodedUrl.match(/\/o\/(.+)\?alt=/);
      if (match && match[1]) {
        const path = match[1];
        const refMidia = storageRef(storage, path);
        await deleteObject(refMidia);
      }

      await deleteDoc(doc(db, 'informacoes/eventos/itens', id));
      setMensagem('Evento excluído com sucesso!');
      carregarEventos();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao excluir evento ou mídia.');
    }
  };

  const salvarEdicao = async () => {
    if (!titulo) {
      setMensagem('O título é obrigatório.');
      return;
    }

    try {
      const ref = doc(db, 'informacoes/eventos/itens', editando);
      await updateDoc(ref, { titulo, descricao });
      setMensagem('Evento atualizado com sucesso!');
      setEditando(null);
      setTitulo('');
      setDescricao('');
      carregarEventos();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao atualizar evento.');
    }
  };

  useEffect(() => {
    carregarEventos();
  }, [dataInicio, dataFim]);

  return (
    <Layout>
    <div className="container mt-4">
      <h2>Eventos</h2>

      {mensagem && <div className="alert alert-info">{mensagem}</div>}

      {editando && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>Editar Evento</h5>
            <div className="mb-2">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <button className="btn btn-success me-2" onClick={salvarEdicao}>
              Salvar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditando(null);
                setTitulo('');
                setDescricao('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col">
          <label>Data Início:</label>
          <input
            type="date"
            className="form-control"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="col">
          <label>Data Fim:</label>
          <input
            type="date"
            className="form-control"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <div className="col d-flex align-items-end">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setDataInicio('');
              setDataFim('');
              carregarEventos('inicial');
            }}
          >
            Limpar Filtro
          </button>
        </div>
      </div>

      <div className="row">
        {eventos.map((e) => (
          <div className="col-md-6 mb-4" key={e.id}>
            <div className="card">
              {e.tipoMidia === 'imagem' ? (
                <img src={e.midiaUrl} className="card-img-top" alt={e.titulo} />
              ) : (
                <video controls width="100%">
                  <source src={e.midiaUrl} type="video/mp4" />
                  Seu navegador não suporta vídeo.
                </video>
              )}
              <div className="card-body">
                <h5 className="card-title">{e.titulo}</h5>
                {e.descricao && <p className="card-text">{e.descricao}</p>}
                <p className="text-muted">
                  Publicado em: {e.criadoEm?.toLocaleDateString() ?? '---'}
                </p>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => {
                    setEditando(e.id);
                    setTitulo(e.titulo);
                    setDescricao(e.descricao || '');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => excluirEvento(e.id, e.midiaUrl)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={historicoDocs.length <= 1}
          onClick={() => carregarEventos('anterior')}
        >
          Anterior
        </button>
        <button
          className="btn btn-outline-primary"
          disabled={eventos.length < limite}
          onClick={() => carregarEventos('proxima')}
        >
          Próxima
        </button>
      </div>
    </div>
    </Layout>
  );
}

export default InformacoesEventos;
