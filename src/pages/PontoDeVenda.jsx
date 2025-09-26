import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { Modal, Button, Form, Card, ListGroup } from "react-bootstrap";
import PdvNavbar from "../components/PdvNavbar";




function PontoDeVenda() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pagamento, setPagamento] = useState("dinheiro");
  const [valorRecebido, setValorRecebido] = useState("");

  const [showCaixa, setShowCaixa] = useState(false);
  const [resumo, setResumo] = useState(null);

  const location = useLocation();
  const operador = location.state?.operador || "Operador";

  // Carregar produtos
  useEffect(() => {
    const carregarProdutos = async () => {
      const snap = await getDocs(collection(db, "produtos"));
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    carregarProdutos();
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };

  const removerUmaUnidade = (id) => {
    setCarrinho((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qtd: p.qtd - 1 } : p))
        .filter((p) => p.qtd > 0)
    );
  };

  const removerDoCarrinho = (id) => {
    setCarrinho((prev) => prev.filter((p) => p.id !== id));
  };

  const total = carrinho.reduce((sum, p) => sum + p.qtd * p.preco, 0);
  const troco =
    pagamento === "dinheiro"
      ? parseFloat(valorRecebido || 0) - total
      : 0;

  const finalizarVenda = async () => {
  if (carrinho.length === 0) return;

  try {
    // 🔹 Salvar pedido
    const pedidoRef = await addDoc(collection(db, "pedidos"), {
      operador,
      itens: carrinho.map((p) => ({
        nome: p.nome,
        qtd: p.qtd,
        valorUnit: p.preco,
      })),
      total,
      pagamento,
      valorRecebido:
        pagamento === "dinheiro" ? parseFloat(valorRecebido) : total,
      troco: pagamento === "dinheiro" ? troco : 0,
      data: new Date(),
    });

    // 🔹 Registrar também no movimento PDV (financeiro)
    await addDoc(collection(db, "movimentoPDV"), {
      descricao: "Venda PDV",
      valor: total,
      data: new Date(),
      operador,
      formaPagamento: pagamento,
      referencia: pedidoRef.id, // agora funciona 👍
    });

    // 🔹 Chamar impressão
    await imprimirPedido();

    // 🔹 Resetar estados
    setCarrinho([]);
    setValorRecebido("");
    setShowModal(false);

    alert("✅ Venda registrada com sucesso!");
  } catch (err) {
    console.error("Erro ao registrar venda:", err);
    alert("❌ Ocorreu um erro ao registrar a venda. Verifique o console.");
  }
};


  const imprimirPedido = async () => {
    const ref = doc(db, "configuracoes", "recibo");
    const snap = await getDoc(ref);
    const cfg = snap.exists() ? snap.data() : {};

    // Define largura conforme formato escolhido
    const largura =
      cfg.formato === "58mm"
        ? "58mm"
        : cfg.formato === "80mm"
          ? "80mm"
          : "100%";

    let conteudo = `
    <div style="font-family: monospace; text-align: center; width:${largura}; font-size:${cfg.formato === "A4" ? "14px" : "12px"
      };">
      ${cfg.logoUrl ? `<img src="${cfg.logoUrl}" style="max-width:80px;"/><br/>` : ""}
      <h3>${cfg.cabecalho || "Recibo PDV"}</h3>
      <p>
        ${cfg.endereco || ""}<br/>
        ${cfg.telefone || ""}
      </p>
      <hr/>
      ${cfg.mostrarProdutos
        ? `<ul style="text-align:left; list-style:none; padding:0;">
              ${carrinho
          .map(
            (p) =>
              `<li>${p.nome} x${p.qtd} .... R$ ${(p.qtd * p.preco).toFixed(
                2
              )}</li>`
          )
          .join("")}
            </ul>`
        : ""
      }
      ${cfg.mostrarTotal ? `<h4>Total: R$ ${total.toFixed(2)}</h4>` : ""}
      ${cfg.mostrarPagamento ? `<p>Pagamento: ${pagamento}</p>` : ""}
      ${cfg.mostrarTroco && pagamento === "dinheiro"
        ? `<p>Recebido: R$ ${parseFloat(valorRecebido || 0).toFixed(
          2
        )} | Troco: R$ ${troco.toFixed(2)}</p>`
        : ""
      }
      ${cfg.mostrarOperador ? `<p>Operador: ${operador}</p>` : ""}
      ${cfg.mostrarData ? `<p>${new Date().toLocaleString()}</p>` : ""}
      <hr/>
      <p>${cfg.rodape || ""}</p>
    </div>
  `;

    const janela = window.open("", "_blank");
    if (janela) {
      janela.document.write(conteudo);
      janela.print();
      janela.close();
    } else {
      alert("Erro ao abrir janela de impressão. Verifique o bloqueador de pop-ups.");
    }
  };

  // Resumo do caixa (soma das vendas do dia)
  const calcularResumoCaixa = async () => {
    const snap = await getDocs(collection(db, "pedidos"));
    const pedidos = snap.docs.map((d) => d.data());

    const hoje = new Date().toLocaleDateString();
    const pedidosHoje = pedidos.filter((p) => {
      if (!p.data) return false;
      const dataVenda =
        p.data.seconds ? new Date(p.data.seconds * 1000) : new Date(p.data);
      return dataVenda.toLocaleDateString() === hoje;
    });

    const resumo = { dinheiro: 0, cartao: 0, pix: 0, total: 0 };

    pedidosHoje.forEach((p) => {
      resumo[p.pagamento] += p.total;
      resumo.total += p.total;
    });

    setResumo(resumo);
    setShowCaixa(true);
  };

  const fecharCaixa = async () => {
    if (!resumo) return;
    await addDoc(collection(db, "fechamentosCaixa"), {
      operador,
      data: new Date(),
      ...resumo,
    });
    alert("Caixa fechado e registrado com sucesso!");
    setShowCaixa(false);
  };

  return (
    <div>
      {/* Navbar fixa do PDV */}
      <PdvNavbar />

      <div className="container py-4">
        <h2 className="mb-3">💳 Ponto de Venda</h2>
        <p className="text-muted">Operador: {operador}</p>

        <div className="row g-4">
          {/* Lista de Produtos */}
          <div className="col-md-8">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                Produtos
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {produtos.map((p) => (
                    <Button
                      key={p.id}
                      variant="outline-primary"
                      className="btn-lg"
                      onClick={() => adicionarAoCarrinho(p)}
                    >
                      {p.nome} <br />
                      <small>R$ {p.preco.toFixed(2)}</small>
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Carrinho */}
          <div className="col-md-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                Carrinho
              </Card.Header>
              <ListGroup variant="flush">
                {carrinho.length === 0 && (
                  <ListGroup.Item className="text-center text-muted">
                    Nenhum item adicionado
                  </ListGroup.Item>
                )}
                {carrinho.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {item.nome} x{item.qtd}
                    </div>
                    <div>
                      <strong>R$ {(item.qtd * item.preco).toFixed(2)}</strong>
                    </div>
                    <div className="btn-group ms-2">
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => removerUmaUnidade(item.id)}
                      >
                        -
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removerDoCarrinho(item.id)}
                      >
                        X
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Footer>
                <h5>Total: R$ {total.toFixed(2)}</h5>
                <div className="d-flex flex-column gap-2 mt-2">
                  <Button
                    variant="success"
                    onClick={() => setShowModal(true)}
                    disabled={carrinho.length === 0}
                  >
                    ✅ Finalizar Venda
                  </Button>
                  <Button
                    variant="dark"
                    onClick={calcularResumoCaixa}
                  >
                    📊 Fechamento de Caixa
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        </div>

        {/* Modal de Pagamento */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Finalizar Venda</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Label>Forma de Pagamento</Form.Label>
              <Form.Select
                value={pagamento}
                onChange={(e) => {
                  setPagamento(e.target.value);
                  setValorRecebido("");
                }}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="pix">Pix</option>
              </Form.Select>

              <h5 className="mt-3">Total: R$ {total.toFixed(2)}</h5>

              {pagamento === "dinheiro" && (
                <div className="mt-3">
                  <Form.Label>Valor Recebido</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={valorRecebido}
                    onChange={(e) => setValorRecebido(e.target.value)}
                  />
                  {valorRecebido && (
                    <div className="mt-2">
                      {troco < 0 ? (
                        <p className="text-danger">
                          ❌ Faltam R$ {Math.abs(troco).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-success">
                          ✅ Troco: R$ {troco.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={finalizarVenda}
              disabled={
                pagamento === "dinheiro" &&
                (valorRecebido === "" || troco < 0)
              }
            >
              Confirmar Venda
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Fechamento de Caixa */}
        <Modal show={showCaixa} onHide={() => setShowCaixa(false)}>
          <Modal.Header closeButton>
            <Modal.Title>📊 Fechamento de Caixa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {resumo ? (
              <>
                <p><strong>Dinheiro:</strong> R$ {resumo.dinheiro.toFixed(2)}</p>
                <p><strong>Cartão:</strong> R$ {resumo.cartao.toFixed(2)}</p>
                <p><strong>Pix:</strong> R$ {resumo.pix.toFixed(2)}</p>
                <hr />
                <h5>Total do Dia: R$ {resumo.total.toFixed(2)}</h5>
              </>
            ) : (
              <p>Carregando resumo...</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCaixa(false)}>
              Fechar
            </Button>
            <Button variant="success" onClick={fecharCaixa}>
              ✅ Registrar Fechamento
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default PontoDeVenda;
