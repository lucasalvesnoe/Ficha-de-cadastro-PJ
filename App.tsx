import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Prestadores from './pages/Prestadores';
import PrestadorDetalhe from './pages/PrestadorDetalhe';

const App: React.FC = () => {
  // Simulação de autenticação. Em uma aplicação real, isso seria um contexto de autenticação completo.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
        } 
      />
      <Route 
        path="/prestadores" 
        element={
          isAuthenticated ? <Prestadores /> : <Navigate to="/login" />
        } 
      />
      <Route 
        path="/prestadores/:cnpj" 
        element={
          isAuthenticated ? <PrestadorDetalhe /> : <Navigate to="/login" />
        } 
      />
      {/* A rota padrão agora redireciona para o login */}
      <Route path="/" element={<Navigate to="/login" />} />
      {/* Redireciona qualquer rota não encontrada para o login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
