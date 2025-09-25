import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Form, Button, Card } from "react-bootstrap";
import PdvNavbar from "../components/PdvNavbar";
import { BsSave } from "react-icons/bs";

function ConfigurarRecibo() {
  const [config, setConfig] = useState({
    cabecalho: "",
    endereco: "",
    telefone: "",
    rodape: "",
    logoUrl: "",
    mostrarOperador: true,
    mostrarData: true,
    formato: "A4",
    mostrarProdutos: true,
    mostrarTotal: true,
    mostrarPagamento: true,
    mostrarTroco: true,
  });

  useEffect(() => {
    const carregarConfig = async () => {
      const ref = doc(db, "configuracoes", "recibo");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setConfig((prev) => ({ ...prev, ...snap.data() }));
      }
    };
    carregarConfig();
  }, []);

  const salvarConfig = async () => {
    const ref = doc(db, "configuracoes", "recibo");
    await setDoc(ref, config);
    alert("✅ Configurações de recibo salvas com sucesso!");
  };

  return (
    <div>
      {/* Navbar do PDV */}
      <PdvNavbar />

      <div className="container py-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">🧾 Configurações do Recibo</h4>
          </Card.Header>
          <Card.Body>
            <div className="row g-4">
              {/* Formulário */}
              <div className="col-md-6">
                <Form>
                  <h5 className="mb-3">📋 Dados Gerais</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Cabeçalho</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ex: Igreja IPU - PDV"
                      value={config.cabecalho}
                      onChange={(e) =>
                        setConfig({ ...config, cabecalho: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Endereço</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Rua, nº - Cidade"
                      value={config.endereco}
                      onChange={(e) =>
                        setConfig({ ...config, endereco: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={config.telefone}
                      onChange={(e) =>
                        setConfig({ ...config, telefone: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Rodapé</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Obrigado pela preferência!"
                      value={config.rodape}
                      onChange={(e) =>
                        setConfig({ ...config, rodape: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Logo (URL)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://link-da-logo.png"
                      value={config.logoUrl}
                      onChange={(e) =>
                        setConfig({ ...config, logoUrl: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Formato do Recibo</Form.Label>
                    <Form.Select
                      value={config.formato}
                      onChange={(e) =>
                        setConfig({ ...config, formato: e.target.value })
                      }
                    >
                      <option value="A4">A4</option>
                      <option value="58mm">Bobina 58mm</option>
                      <option value="80mm">Bobina 80mm</option>
                    </Form.Select>
                  </Form.Group>

                  <h5 className="mt-4 mb-3">⚙️ Opções de Exibição</h5>
                  <div className="border rounded p-3 bg-light">
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Operador"
                      checked={config.mostrarOperador}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mostrarOperador: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Data"
                      checked={config.mostrarData}
                      onChange={(e) =>
                        setConfig({ ...config, mostrarData: e.target.checked })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Lista de Produtos"
                      checked={config.mostrarProdutos}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mostrarProdutos: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Total"
                      checked={config.mostrarTotal}
                      onChange={(e) =>
                        setConfig({ ...config, mostrarTotal: e.target.checked })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Forma de Pagamento"
                      checked={config.mostrarPagamento}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mostrarPagamento: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Mostrar Valor Recebido e Troco"
                      checked={config.mostrarTroco}
                      onChange={(e) =>
                        setConfig({ ...config, mostrarTroco: e.target.checked })
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <Button variant="primary" onClick={salvarConfig}>
                      <BsSave className="me-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Pré-visualização */}
              <div className="col-md-6">
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <strong>🔎 Pré-visualização</strong>
                  </Card.Header>
                  <Card.Body>
                    <div
                      className="mx-auto p-3 border rounded"
                      style={{
                        fontFamily: "monospace",
                        textAlign: "center",
                        width:
                          config.formato === "58mm"
                            ? "58mm"
                            : config.formato === "80mm"
                            ? "80mm"
                            : "100%",
                        fontSize: config.formato === "A4" ? "14px" : "12px",
                      }}
                    >
                      {config.logoUrl && (
                        <img
                          src={config.logoUrl}
                          alt="Logo"
                          className="mb-2"
                          style={{ maxWidth: "80px" }}
                        />
                      )}
                      <h5>{config.cabecalho || "Recibo PDV"}</h5>
                      <p>
                        {config.endereco} <br /> {config.telefone}
                      </p>
                      <hr />
                      {config.mostrarProdutos && (
                        <ul
                          style={{
                            textAlign: "left",
                            listStyle: "none",
                            padding: 0,
                          }}
                        >
                          <li>Produto Exemplo x2 ..... R$ 20,00</li>
                          <li>Produto Exemplo 2 x1 .. R$ 10,00</li>
                        </ul>
                      )}
                      {config.mostrarTotal && <h5>Total: R$ 30,00</h5>}
                      {config.mostrarPagamento && <p>Pagamento: Dinheiro</p>}
                      {config.mostrarTroco && (
                        <p>Recebido: R$ 50,00 | Troco: R$ 20,00</p>
                      )}
                      {config.mostrarOperador && <p>Operador: João</p>}
                      {config.mostrarData && <p>{new Date().toLocaleString()}</p>}
                      <hr />
                      <p>{config.rodape}</p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ConfigurarRecibo;
