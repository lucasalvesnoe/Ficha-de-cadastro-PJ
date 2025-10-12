import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Prestadores from './pages/Prestadores';
import PrestadorDetalhe from './pages/PrestadorDetalhe';
import NotasFiscais from './pages/NotasFiscais'; // Importa a nova página

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/prestadores" element={<Prestadores />} />
      <Route path="/prestadores/:cnpj" element={<PrestadorDetalhe />} />
      <Route path="/notas-fiscais" element={<NotasFiscais />} /> {/* Adiciona a nova rota */}
      {/* A rota padrão agora redireciona para o dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      {/* Redireciona qualquer rota não encontrada para o dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default App;