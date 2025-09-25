import React, { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function CriarSenhaPDV() {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleCriarSenha = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docUser = snap.docs[0];
        const user = docUser.data();

        if (!user.usaPDV) {
          setError("Este usuário não tem permissão para usar o PDV.");
          return;
        }

        await updateDoc(doc(db, "usuarios", docUser.id), {
          senhaPDV: novaSenha,
        });

        setSuccess("Senha criada com sucesso! Você já pode fazer login.");
        setTimeout(() => navigate("/pdv/login"), 2000);
      } else {
        setError("Usuário não encontrado.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao criar a senha.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success">Criar Senha PDV</h2>
          <p className="text-muted small">Informe seu e-mail para criar sua senha de acesso</p>
        </div>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}
        {success && <div className="alert alert-success text-center py-2">{success}</div>}

        <form onSubmit={handleCriarSenha} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label fw-semibold">E-mail</label>
            <input
              type="email"
              className="form-control"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Nova Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Confirmar Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100 fw-bold">
            Criar Senha
          </button>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          © {new Date().getFullYear()} PDV System. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default CriarSenhaPDV;
