import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebase/config";
import {
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // 🔹 Login com usuário/senha Firestore
  const loginComSenha = async () => {
    try {
      setCarregando(true);
      setErro("");

      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const snap = await getDocs(q);

      if (snap.empty) {
        setErro("Usuário não encontrado");
        return;
      }

      const userDoc = snap.docs[0].data();

      if (userDoc.senhaPDV !== senha) {
        setErro("Senha incorreta");
        return;
      }

      // Redirecionar conforme permissão
      if (userDoc.isAdmin) {
        navigate("/dashboard");
      } else if (userDoc.usaPDV) {
        navigate("/home", { state: { operador: userDoc.nome } });
      } else {
        setErro("Você não tem acesso ao sistema");
      }
    } catch (e) {
      console.error(e);
      setErro("Erro ao tentar logar");
    } finally {
      setCarregando(false);
    }
  };

  // 🔹 Login com Google
  const loginComGoogle = async () => {
    try {
      setCarregando(true);
      setErro("");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Buscar informações no Firestore
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setErro("Usuário não cadastrado no sistema");
        return;
      }

      const userDoc = snap.data();

      if (userDoc.isAdmin) {
        navigate("/dashboard");
      } else if (userDoc.usaPDV) {
        navigate("/home", { state: { operador: userDoc.nome } });
      } else {
        setErro("Você não tem acesso ao sistema");
      }
    } catch (e) {
      console.error(e);
      setErro("Erro no login com Google");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="mb-4 text-center">Login</h3>

        {erro && <div className="alert alert-danger">{erro}</div>}

        {/* Login com usuário/senha */}
        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input
            type="password"
            className="form-control"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary w-100 mb-3"
          onClick={loginComSenha}
          disabled={carregando}
        >
          Entrar
        </button>

        <hr />

        {/* Login com Google */}
        <button
          className="btn btn-outline-dark w-100"
          onClick={loginComGoogle}
          disabled={carregando}
        >
          <i className="bi bi-google me-2"></i> Entrar com Google
        </button>
      </div>
    </div>
  );
}

export default Login;
