import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Button, Table, Form, Card } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PdvNavbar from "../components/PdvNavbar";
import { BsFileEarmarkExcelFill, BsFileEarmarkPdfFill } from "react-icons/bs";

function VendasPDV() {
  const [vendas, setVendas] = useState([]);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  useEffect(() => {
    const carregarVendas = async () => {
      const q = query(collection(db, "pedidos"), orderBy("data", "desc"));
      const snap = await getDocs(q);

      setVendas(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(),
        }))
      );
    };
    carregarVendas();
  }, []);

  const vendasFiltradas = vendas.filter((v) => {
    if (dataInicial && new Date(v.data) < new Date(dataInicial)) return false;
    if (dataFinal && new Date(v.data) > new Date(dataFinal)) return false;
    return true;
  });

  const totalGeral = vendasFiltradas.reduce((s, v) => s + v.total, 0);

  // Exportar Excel
  const exportarExcel = () => {
    const dados = vendasFiltradas.map((v) => ({
      Data: v.data.toLocaleString(),
      Operador: v.operador,
      Pagamento: v.pagamento,
      Total: v.total.toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    XLSX.writeFile(wb, "relatorio_vendas.xlsx");
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Vendas - PDV", 14, 15);

    const dados = vendasFiltradas.map((v) => [
      v.data.toLocaleString(),
      v.operador,
      v.pagamento,
      "R$ " + v.total.toFixed(2),
    ]);

    doc.autoTable({
      head: [["Data", "Operador", "Pagamento", "Total"]],
      body: dados,
      startY: 25,
    });

    doc.text(
      `Total Geral: R$ ${totalGeral.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("relatorio_vendas.pdf");
  };

  return (
    <div>
      <PdvNavbar />

      <div className="container py-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">📊 Relatório de Vendas</h4>
          </Card.Header>
          <Card.Body>
            {/* Filtros */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <Form.Label>Data Inicial</Form.Label>
                <Form.Control
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <Form.Label>Data Final</Form.Label>
                <Form.Control
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDataInicial("");
                    setDataFinal("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela */}
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Data</th>
                    <th>Operador</th>
                    <th>Pagamento</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradas.map((v) => (
                    <tr key={v.id}>
                      <td>{v.data.toLocaleString()}</td>
                      <td>{v.operador}</td>
                      <td>
                        <span
                          className={`badge ${
                            v.pagamento === "dinheiro"
                              ? "bg-success"
                              : v.pagamento === "cartao"
                              ? "bg-info text-dark"
                              : "bg-primary"
                          }`}
                        >
                          {v.pagamento}
                        </span>
                      </td>
                      <td className="fw-bold text-end">
                        R$ {v.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Total Geral */}
            <div className="alert alert-primary d-flex justify-content-between align-items-center">
              <strong>Total Geral:</strong>
              <span className="fs-5 fw-bold">
                R$ {totalGeral.toFixed(2)}
              </span>
            </div>

            {/* Botões */}
            <div className="d-flex gap-2">
              <Button variant="success" onClick={exportarExcel}>
                <BsFileEarmarkExcelFill className="me-2" />
                Exportar Excel
              </Button>
              <Button variant="danger" onClick={exportarPDF}>
                <BsFileEarmarkPdfFill className="me-2" />
                Exportar PDF
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default VendasPDV;
