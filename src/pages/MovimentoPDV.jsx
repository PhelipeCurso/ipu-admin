import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Table, Button, Form, Card } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function MovimentoPDV() {
  const [movimentos, setMovimentos] = useState([]);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  // 🔹 Carregar lançamentos do Firestore
  useEffect(() => {
    const carregar = async () => {
      const q = query(collection(db, "movimentoPDV"), orderBy("data", "desc"));
      const snap = await getDocs(q);

      setMovimentos(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          data: doc.data().data?.toDate
            ? doc.data().data.toDate()
            : new Date(),
        }))
      );
    };
    carregar();
  }, []);

  // 🔹 Filtrar por data
  const filtrados = movimentos.filter((m) => {
    if (dataInicial && new Date(m.data) < new Date(dataInicial)) return false;
    if (dataFinal && new Date(m.data) > new Date(dataFinal)) return false;
    return true;
  });

  const total = filtrados.reduce((s, m) => s + m.valor, 0);

  // 🔹 Exportar Excel
  const exportarExcel = () => {
    const dados = filtrados.map((m) => ({
      Data: m.data.toLocaleString(),
      Operador: m.operador,
      Pagamento: m.formaPagamento,
      Valor: m.valor.toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimento PDV");
    XLSX.writeFile(wb, "movimento_pdv.xlsx");
  };

  // 🔹 Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório - Movimento PDV", 14, 15);

    const dados = filtrados.map((m) => [
      m.data.toLocaleString(),
      m.operador,
      m.formaPagamento,
      "R$ " + m.valor.toFixed(2),
    ]);

    doc.autoTable({
      head: [["Data", "Operador", "Pagamento", "Valor"]],
      body: dados,
      startY: 25,
    });

    doc.text(
      `Total Geral: R$ ${total.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("movimento_pdv.pdf");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">📊 Movimento PDV</h2>

      {/* Filtros */}
      <div className="d-flex gap-3 mb-3">
        <Form.Control
          type="date"
          value={dataInicial}
          onChange={(e) => setDataInicial(e.target.value)}
        />
        <Form.Control
          type="date"
          value={dataFinal}
          onChange={(e) => setDataFinal(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setDataInicial("");
            setDataFinal("");
          }}
        >
          Limpar
        </Button>
        <Button variant="success" onClick={exportarExcel}>
          Excel
        </Button>
        <Button variant="danger" onClick={exportarPDF}>
          PDF
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Data</th>
              <th>Operador</th>
              <th>Forma Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((m) => (
              <tr key={m.id}>
                <td>{m.data.toLocaleString()}</td>
                <td>{m.operador}</td>
                <td>{m.formaPagamento}</td>
                <td>R$ {m.valor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <h5 className="mt-3">💰 Total: R$ {total.toFixed(2)}</h5>
    </div>
  );
}

export default MovimentoPDV;
