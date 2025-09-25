import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Layout from '../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import GraficoFinanceiro from '../components/GraficoFinanceiro';

export default function Dashboard() {
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [tipoGrafico, setTipoGrafico] = useState('barra'); // 'barra' | 'linha' | 'pizza'
  const [totais, setTotais] = useState({ receitas: 0, despesas: 0, doacoes: 0 });
  const [metaAtiva, setMetaAtiva] = useState(null);

  const filtrarPorMesAno = (data) => {
    if (!mes || !ano) return true;
    const d = data.toDate();
    return d.getMonth() + 1 === parseInt(mes) && d.getFullYear() === parseInt(ano);
  };

  const carregarMetaAtiva = async () => {
    const q = query(collection(db, 'metas'), where('ativa', '==', true));
    const snap = await getDocs(q);
    const metas = snap.docs.map((doc) => doc.data());
    setMetaAtiva(metas[0] || null);
  };

  const carregarTotais = async () => {
    const [rSnap, dSnap, doaSnap] = await Promise.all([
      getDocs(collection(db, 'contas_receber')),
      getDocs(collection(db, 'contas_pagar')),
      getDocs(collection(db, 'doacoes')),
    ]);

    const receitas = rSnap.docs
      .filter((doc) => !doc.data().cancelado && filtrarPorMesAno(doc.data().data))
      .reduce((sum, doc) => sum + (doc.data().valor || 0), 0);

    const despesas = dSnap.docs
      .filter((doc) => !doc.data().cancelado && filtrarPorMesAno(doc.data().data))
      .reduce((sum, doc) => sum + (doc.data().valor || 0), 0);

    const doacoes = doaSnap.docs
      .filter((doc) => !doc.data().cancelado && filtrarPorMesAno(doc.data().data))
      .reduce((sum, doc) => sum + (doc.data().valor || 0), 0);

    setTotais({ receitas, despesas, doacoes });
  };

  useEffect(() => {
    carregarTotais();
    carregarMetaAtiva();
  }, [mes, ano]);

  const saldo = totais.receitas + totais.doacoes - totais.despesas;

  const dadosGrafico = [
    { nome: 'Receitas', valor: Number(totais.receitas) || 0 },
    { nome: 'Despesas', valor: Number(totais.despesas) || 0 },
    { nome: 'Doações', valor: Number(totais.doacoes) || 0 },
  ];

  const exportarPDF = () => {
    const doc = new jsPDF();
    const dataAtual = new Date();
    const titulo = 'Relatório Financeiro';
    const periodo = mes && ano
      ? `${new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' })} de ${ano}`
      : 'Todos os períodos';

    doc.setFontSize(16);
    doc.text(titulo, 14, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${periodo}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Receitas', 'Despesas', 'Doações', 'Saldo Atual']],
      body: [[
        `R$ ${totais.receitas.toFixed(2)}`,
        `R$ ${totais.despesas.toFixed(2)}`,
        `R$ ${totais.doacoes.toFixed(2)}`,
        `R$ ${saldo.toFixed(2)}`,
      ]],
    });

    doc.save(`relatorio-financeiro-${dataAtual.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Layout>
      <div className="container py-4">
        <h3 className="mb-4">📊 Dashboard Financeiro</h3>

        {/* Filtros */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Mês</label>
                <select className="form-select" value={mes} onChange={(e) => setMes(e.target.value)}>
                  <option value="">Todos</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Ano</label>
                <select className="form-select" value={ano} onChange={(e) => setAno(e.target.value)}>
                  <option value="">Todos</option>
                  {[2024, 2025].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 d-grid">
                <button className="btn btn-outline-secondary" onClick={() => { setMes(''); setAno(''); }}>
                  Limpar Filtros
                </button>
              </div>
              <div className="col-md-3 d-grid">
                <button className="btn btn-dark" onClick={exportarPDF}>
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Totais */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card text-bg-success shadow-sm">
              <div className="card-body">
                <h6>Receitas</h6>
                <h5>R$ {totais.receitas.toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-bg-danger shadow-sm">
              <div className="card-body">
                <h6>Despesas</h6>
                <h5>R$ {totais.despesas.toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-bg-primary shadow-sm">
              <div className="card-body">
                <h6>Doações</h6>
                <h5>R$ {totais.doacoes.toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className={`card shadow-sm ${saldo >= 0 ? 'text-bg-success' : 'text-bg-danger'}`}>
              <div className="card-body">
                <h6>Saldo Atual</h6>
                <h5>R$ {saldo.toFixed(2)}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Meta ativa */}
        {metaAtiva && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6>🎯 Meta de Receita Ativa: {metaAtiva.descricao}</h6>
              <p>
                Arrecadado: <strong>R$ {totais.receitas.toFixed(2)}</strong> de{' '}
                <strong>R$ {metaAtiva.valor.toFixed(2)}</strong>
              </p>
              <div className="progress" style={{ height: '20px' }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${Math.min(100, (totais.receitas / metaAtiva.valor) * 100)}%` }}
                >
                  {Math.min(100, ((totais.receitas / metaAtiva.valor) * 100)).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seletor de gráfico */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Visualização de Gráficos</h6>
              <select
                className="form-select w-auto"
                value={tipoGrafico}
                onChange={(e) => setTipoGrafico(e.target.value)}
              >
                <option value="barra">Barras</option>
                <option value="linha">Linhas</option>
                <option value="pizza">Pizza</option>
              </select>
            </div>
            <div style={{ width: '100%', height: '350px' }}>
              <GraficoFinanceiro tipo={tipoGrafico} dados={dadosGrafico} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
