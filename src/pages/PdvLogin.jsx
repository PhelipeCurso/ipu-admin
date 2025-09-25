import React, { useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


function PdvLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Login tradicional (Auth: e-mail/senha)
  const handleAuthLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const uid = cred.user.uid;

      const ref = doc(db, "usuarios", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) throw new Error("Usuário não encontrado.");

      const user = snap.data();
      if (!user.usaPDV) throw new Error("Sem permissão para usar o PDV.");

      navigate("/painelPdv", { state: { operador: user.nome, uid } });
    } catch (err) {
      console.error(err);
      setError("E-mail ou senha inválidos (Auth).");
    }
  };

  // 🔹 Login alternativo (Firestore: email + senhaPDV)
  const { setPdvUser } = useAuth();
  const handlePdvLogin = async (e) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, "usuarios"),
        where("email", "==", email),
        where("senhaPDV", "==", senha)
      );

      const snap = await getDocs(q);
      if (snap.empty) throw new Error("Usuário ou senha PDV inválidos.");

      const user = snap.docs[0].data();
      const uid = snap.docs[0].id;

      if (!user.usaPDV) throw new Error("Sem permissão para usar o PDV.");
      // 🔹 salva no AuthContext
      setPdvUser({ uid, nome: user.nome, email: user.email });

      navigate("/painelPdv", { state: { operador: user.nome, uid } });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // 🔹 Login com Google
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;

      const ref = doc(db, "usuarios", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) throw new Error("Usuário não cadastrado no sistema.");

      const user = snap.data();
      if (!user.usaPDV) throw new Error("Sem permissão para usar o PDV.");

      navigate("/painelPdv", { state: { operador: user.nome, uid } });
    } catch (err) {
      console.error(err);
      setError("Falha ao logar com Google.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Login PDV</h2>
          <p className="text-muted small">Escolha a forma de acesso</p>
        </div>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}

        {/* Login Firebase Auth */}
        <form onSubmit={handleAuthLogin} className="d-flex flex-column gap-3">
          {/* Email */}
          <div>
            <label htmlFor="authEmail" className="form-label fw-semibold">
              E-mail
            </label>
            <input
              type="email"
              id="authEmail"
              name="authEmail"
              className="form-control"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="authSenha" className="form-label fw-semibold">
              Senha
            </label>
            <input
              type="password"
              id="authSenha"
              name="authSenha"
              className="form-control"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Entrar (Auth)
          </button>
        </form>

        <hr className="my-3" />

        {/* Login PDV (Firestore) */}
        <form onSubmit={handlePdvLogin}>
          <button type="submit" className="btn btn-warning w-100 fw-bold mb-2">
            Entrar com Senha PDV
          </button>
        </form>

        {/* Login Google */}
        <button onClick={handleGoogleLogin} className="btn btn-light border w-100 fw-bold">
          <i className="bi bi-google me-2"></i> Entrar com Google
        </button>
        {/* 🔹 Link para criar senha PDV */}
        <p className="text-center mt-3">
          Ainda não tem senha PDV?{" "}
          <Link to="/pdv/criarsenhapdv" className="fw-semibold text-decoration-none">
            Clique aqui para criar
          </Link>
        </p>

      </div>
    </div>

  );
}

export default PdvLogin;
