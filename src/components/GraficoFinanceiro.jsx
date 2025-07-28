import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  Tooltip, XAxis, YAxis, ResponsiveContainer,
} from 'recharts';

import { useMemo } from 'react';

const cores = ['#198754', '#dc3545', '#0d6efd'];

export default function GraficoFinanceiro({ tipo, dados }) {
  const dadosValidos = useMemo(() => {
    if (!Array.isArray(dados)) return [];
    return dados.filter(
      (item) => item && typeof item.valor === 'number' && !isNaN(item.valor)
    );
  }, [dados]);

  if (!dadosValidos || dadosValidos.length === 0) {
    return <p className="text-muted">Sem dados para exibir no gráfico.</p>;
  }

 return (
  <div style={{ width: '100%', height: '350px' , minHeight: '350px'}}>
    <ResponsiveContainer width="100%" height="100%">
  {
    tipo === 'barra' ? (
      <BarChart data={dadosValidos}>
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" fill="#8884d8" />
      </BarChart>
    ) : tipo === 'linha' ? (
      <LineChart data={dadosValidos}>
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="valor" stroke="#0d6efd" strokeWidth={3} />
      </LineChart>
    ) : tipo === 'pizza' ? (
      <PieChart>
        <Pie
          data={dadosValidos}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {dadosValidos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    ) : null
  }
</ResponsiveContainer>

  </div>
);
}