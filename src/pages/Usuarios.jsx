import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { Modal, Button, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [busca, setBusca] = useState('');

  const carregarUsuarios = async () => {
    const snap = await getDocs(collection(db, 'usuarios'));
    const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(lista);
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('endereco.')) {
      const key = name.split('.')[1];
      setUsuarioEditando((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [key]: value
        }
      }));
    } else {
      setUsuarioEditando((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const abrirModalEdicao = (usuario) => {
    setUsuarioEditando(usuario);
    setShowModal(true);
  };

  const salvarEdicao = async () => {
    const ref = doc(db, 'usuarios', usuarioEditando.id);
    await updateDoc(ref, usuarioEditando);
    setShowModal(false);
    carregarUsuarios();
  };

  const alternarBloqueio = async (usuario) => {
    const confirmar = window.confirm(`Deseja realmente ${usuario.bloqueado ? 'desbloquear' : 'bloquear'} este usuário?`);
    if (!confirmar) return;

    await updateDoc(doc(db, 'usuarios', usuario.id), {
      bloqueado: !usuario.bloqueado
    });

    carregarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Usuários', 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['Nome', 'CPF', 'Email', 'Status']],
      body: usuariosFiltrados.map(u => [
        u.nome,
        u.cpf,
        u.email,
        u.bloqueado ? 'Bloqueado' : 'Ativo'
      ]),
    });
    doc.save('usuarios.pdf');
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      usuariosFiltrados.map(u => ({
        Nome: u.nome,
        CPF: u.cpf,
        Email: u.email,
        Status: u.bloqueado ? 'Bloqueado' : 'Ativo'
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'usuarios.xlsx');
  };

  return (
    <Layout>
      <div className="container">
        <h3 className="mb-4">Usuários Cadastrados</h3>

        <div className="mb-3 d-flex flex-wrap gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="btn btn-outline-danger" onClick={exportarPDF}>Exportar PDF</button>
          <button className="btn btn-outline-success" onClick={exportarExcel}>Exportar Excel</button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Status</th>
                <th>Email</th>
                <th>Ações</th>
                <th>Inativar</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.cpf}</td>
                  <td>
                    <span className={`badge ${u.bloqueado ? 'bg-danger' : 'bg-success'}`}>
                      {u.bloqueado ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirModalEdicao(u)}>
                      Editar
                    </button>
                  </td>
                  <td>
                    <button className={`btn btn-sm ${u.bloqueado ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => alternarBloqueio(u)}>
                      {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">Nenhum usuário encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edição */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioEditando && (
            <Form className="row g-3">
              {/* Dados pessoais */}
              <Form.Group className="col-md-6">
                <Form.Label>Nome</Form.Label>
                <Form.Control name="nome" value={usuarioEditando.nome || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>CPF</Form.Label>
                <Form.Control name="cpf" value={usuarioEditando.cpf || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-4">
                <Form.Label>Data de Nascimento</Form.Label>
                <Form.Control type="date" name="dataNascimento" value={usuarioEditando.dataNascimento || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-4">
                <Form.Label>Estado Civil</Form.Label>
                <Form.Control name="estadoCivil" value={usuarioEditando.estadoCivil || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-4">
                <Form.Label>Data do Batismo</Form.Label>
                <Form.Control type="date" name="dataBatismo" value={usuarioEditando.dataBatismo || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>E-mail</Form.Label>
                <Form.Control name="email" value={usuarioEditando.email || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Membro Desde</Form.Label>
                <Form.Control type="date" name="membroDesde" value={usuarioEditando.membroDesde || ''} onChange={handleChange} />
              </Form.Group>

              {/* Agrupamento das flags booleanas */}
              <Form.Group className="col-md-12">
                <div className="border rounded p-3">
                  <Form.Check
                    type="checkbox"
                    label="É Batizado?"
                    name="batizado"
                    checked={usuarioEditando.batizado || false}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Possui Cargo Eclesiástico?"
                    name="cargoEclesiastico"
                    checked={usuarioEditando.cargoEclesiastico || false}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Pode gerenciar agenda (notícias/eventos)"
                    name="podeGerenciarAgenda"
                    checked={usuarioEditando.podeGerenciarAgenda || false}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label=" Pedidos de Oração"
                    name="podeVerPedidosOracao"
                    checked={usuarioEditando.podeVerPedidosOracao || false}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Pode Editar agendas"
                    name="podeEditarAgendas"
                    checked={usuarioEditando.podeEditarAgendas || false}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Usa PDV?"
                    name="usaPDV"
                    checked={usuarioEditando.usaPDV || false}
                    onChange={handleChange}
                  />
                   <Form.Control
                    type="text"
                    label="Senha do PDV"
                    name="senhaPDV"
                    value={usuarioEditando.senhaPDV || ''}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>

              {/* Área de Serviço */}
              <Form.Group className="col-md-6">
                <Form.Label>Serve em qual área?</Form.Label>
                <Form.Control name="areaDeServico" value={usuarioEditando.areaDeServico || ''} onChange={handleChange} />
              </Form.Group>

              

              {/* Endereço */}
              <Form.Group className="col-md-6">
                <Form.Label>CEP</Form.Label>
                <Form.Control name="endereco.cep" value={usuarioEditando.endereco?.cep || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Logradouro</Form.Label>
                <Form.Control name="endereco.logradouro" value={usuarioEditando.endereco?.logradouro || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Número</Form.Label>
                <Form.Control name="endereco.numero" value={usuarioEditando.endereco?.numero || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-3">
                <Form.Label>Bairro</Form.Label>
                <Form.Control name="endereco.bairro" value={usuarioEditando.endereco?.bairro || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-4">
                <Form.Label>Cidade</Form.Label>
                <Form.Control name="endereco.cidade" value={usuarioEditando.endereco?.cidade || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-md-8">
                <Form.Label>Complemento</Form.Label>
                <Form.Control name="endereco.complemento" value={usuarioEditando.endereco?.complemento || ''} onChange={handleChange} />
              </Form.Group>
            </Form>

          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={salvarEdicao}>Salvar Alterações</Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}
