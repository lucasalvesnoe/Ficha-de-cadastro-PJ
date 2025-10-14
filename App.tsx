import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Prestadores from './pages/Prestadores';
import PrestadorDetalhe from './pages/PrestadorDetalhe';
import NotasFiscais from './pages/NotasFiscais';
import Login from './pages/Login'; // Importa a página de Login

const App: React.FC = () => {
  // Estado para controlar se o usuário está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Verifica o localStorage ao iniciar para manter o usuário logado
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const location = useLocation();

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  // O logout será tratado diretamente no Sidebar para simplificar
  
  // Componente de Rota Protegida
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      // Redireciona para a página de login, guardando a rota que o usuário tentou acessar
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  };


  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas Protegidas */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/prestadores" 
        element={<ProtectedRoute><Prestadores /></ProtectedRoute>} 
      />
      <Route 
        path="/prestadores/:cnpj" 
        element={<ProtectedRoute><PrestadorDetalhe /></ProtectedRoute>} 
      />
      <Route 
        path="/notas-fiscais" 
        element={<ProtectedRoute><NotasFiscais /></ProtectedRoute>} 
      />
      
      {/* Rota Padrão: redireciona para o dashboard se logado, senão para o login */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />

      {/* Redireciona qualquer rota não encontrada */}
      <Route 
        path="*" 
        element={<Navigate to="/" />} 
      />
    </Routes>
  );
};

export default App;