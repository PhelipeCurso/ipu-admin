import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PrivateRoute from './components/PrivateRoute';
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
import ConfigurarRecibo from './pages/ConfigurarRecibo';
import CriarSenhaPDV from "./pages/CriarSenhaPDV";
import VendasPDV from "./pages/VendasPDV";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Home from './pages/Home';
import PainelPdv from './pages/PainelPdv';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login comum */}
          <Route path="/login" element={<Login />} />

          {/* Painel principal (admin) */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/metas" element={<ProtectedRoute><Metas /></ProtectedRoute>} />
          <Route path="/contas-receber" element={<ProtectedRoute><ContasReceber /></ProtectedRoute>} />
          <Route path="/contas-pagar" element={<ProtectedRoute><ContasPagar /></ProtectedRoute>} />
          <Route path="/doacoes" element={<ProtectedRoute><Doacoes /></ProtectedRoute>} />
          <Route path="/segmentos" element={<ProtectedRoute><Segmentos /></ProtectedRoute>} />
          <Route path="/responsaveis" element={<ProtectedRoute><Responsaveis /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/informacoes/noticias" element={<ProtectedRoute><InformacoesNoticias /></ProtectedRoute>} />
          <Route path="/informacoes/eventos" element={<ProtectedRoute><InformacoesEventos /></ProtectedRoute>} />
          <Route path="/painelPdv" element={<ProtectedRoute><PainelPdv /></ProtectedRoute>} />
  
          {/* PDV */}
          <Route path="/pdv/login" element={<PdvLogin />} /> {/* login livre */}
          <Route path="/pdv/pontodevenda" element={<PrivateRoute><PontoDeVenda /></PrivateRoute>} />
          <Route path="/pdv/produtos" element={<PrivateRoute><ProdutosPdv /></PrivateRoute>} />
          <Route path="/pdv/configurar-recibo" element={<PrivateRoute><ConfigurarRecibo /></PrivateRoute>} />
          <Route path="/pdv/criarsenhapdv" element={<CriarSenhaPDV />} />
          <Route path="/pdv/vendas" element={<PrivateRoute><VendasPDV /></PrivateRoute>} />
          <Route path="/pdv/painel" element={<PrivateRoute><PainelPdv /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
