import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ContasReceber from './pages/ContasReceber';
import ContasPagar from './pages/ContasPagar';
import Doacoes from './pages/Doacoes';
import Segmentos from './pages/Segmentos';
import Responsaveis from './pages/Responsaveis';
import React from 'react';
import Metas from './pages/Metas';
import Usuarios from './pages/Usuarios';
import InformacoesNoticias from './pages/InformacoesNoticias';
import InformacoesEventos from './pages/InformacoesEventos';
import PdvLogin from './pages/PdvLogin';
import PontoDeVenda from './pages/PontoDeVenda';
import ProdutosPdv from './pages/ProdutosPDV';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login comum */}
          <Route path="/login" element={<Login />} />

          {/* Painel principal */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Outras rotas protegidas */}
          <Route path="/metas" element={<ProtectedRoute><Metas /></ProtectedRoute>} />
          <Route path="/contas-receber" element={<ProtectedRoute><ContasReceber /></ProtectedRoute>} />
          <Route path="/contas-pagar" element={<ProtectedRoute><ContasPagar /></ProtectedRoute>} />
          <Route path="/doacoes" element={<ProtectedRoute><Doacoes /></ProtectedRoute>} />
          <Route path="/segmentos" element={<ProtectedRoute><Segmentos /></ProtectedRoute>} />
          <Route path="/responsaveis" element={<ProtectedRoute><Responsaveis /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/informacoes/noticias" element={<ProtectedRoute><InformacoesNoticias /></ProtectedRoute>} />
          <Route path="/informacoes/eventos" element={<ProtectedRoute><InformacoesEventos /></ProtectedRoute>} />

          {/* PDV */}
          <Route path="/pdv/login" element={<PdvLogin />} /> {/* login livre */}
          <Route path="/pdv/PontoDeVenda" element={<ProtectedRoute><PontoDeVenda /></ProtectedRoute>} />
          <Route path="/pdv/produtos" element={<ProtectedRoute><ProdutosPdv /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
