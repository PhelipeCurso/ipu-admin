import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function PdvLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docUser = snap.docs[0];
        const user = docUser.data();

        if (!user.usaPDV) {
          setError("Você não tem permissão para usar o PDV.");
          return;
        }

        if (user.senhaPDV === senha) {
          navigate("/pdv/PontoDeVenda", {
            state: { operador: user.nome, uid: docUser.id },
          });
        } else {
          setError("Senha do PDV incorreta.");
        }
      } else {
        setError("Usuário não encontrado.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao tentar acessar o PDV.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Login</h2>
          <p className="text-muted small">
            Acesse o sistema com suas credenciais
          </p>
        </div>

        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}

        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label fw-semibold">
              E-mail
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="form-label fw-semibold">
              Senha
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                id="senha"
                className="form-control"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botão */}
          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Entrar
          </button>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          © {new Date().getFullYear()} PDV System. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default PdvLogin;
