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
      // 🔎 Buscar usuário pelo email informado
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docUser = snap.docs[0];
        const user = docUser.data();

        // Verifica se tem permissão de usar PDV
        if (!user.usaPDV) {
          setError("Você não tem permissão para usar o PDV.");
          return;
        }

        // Valida senha do PDV
        if (user.senhaPDV === senha) {
          // ✅ Login bem sucedido
          navigate("/pdv/painel", {
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
 <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-gray-100 to-blue-200">
  <form
    onSubmit={handleLogin}
    className="bg-white shadow-lg rounded-2xl p-8 w-96 transform transition-all hover:scale-[1.01]"
  >
    <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
      Login PDV
    </h2>

    {error && (
      <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded p-2">
        {error}
      </p>
    )}

    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        E-mail
      </label>
      <input
        type="email"
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Senha
      </label>
      <input
        type="password"
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
    >
      Entrar
    </button>
  </form>
</div>

  );
}

export default PdvLogin;
