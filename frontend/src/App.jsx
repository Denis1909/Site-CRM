// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PartnerRegistrationPage from './pages/PartnerRegistrationPage';
import CadastroDeVendas from './pages/CadastroDeVendas';
import AprovacaoVendas from './pages/AprovacaoVendas';
import Reports from './pages/Reports'; // Certifique-se de que Reports.jsx existe
import './App.css';
import { SalesProvider } from './contexts/SalesContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute'; // Importe o PrivateRoute

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envolve toda a aplicação para fornecer o contexto de autenticação */}
        <SalesProvider> {/* Envolve para fornecer o contexto de vendas */}
          <Routes>
            {/* Rotas Públicas ou que não exigem role específico */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Protegidas (Exigindo autenticação e/ou role específico) */}
            {/* O Dashboard exige autenticação, mas não um role específico, então pode ser acessado por qualquer user logado */}
            <Route 
              path="/" 
              element={
                <PrivateRoute> {/* Não exige requiredRole, apenas isAuthenticated */}
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/vendas/cadastrar" 
              element={
                <PrivateRoute> {/* Qualquer usuário logado pode cadastrar vendas (Vendedor/Gestor) */}
                  <CadastroDeVendas />
                </PrivateRoute>
              } 
            />
            <Route path="/reports" element={
              <PrivateRoute> {/* Relatórios também podem ser acessados por qualquer user logado inicialmente */}
                <Reports />
              </PrivateRoute>
            } />
            
            {/* Rotas Exclusivas para Gerentes (requiredRole="manager") */}
            <Route 
              path="/register" 
              element={
                <PrivateRoute requiredRole="manager">
                  <RegisterPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/register-partner" 
              element={
                <PrivateRoute requiredRole="manager">
                  <PartnerRegistrationPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/vendas/aprovar" 
              element={
                <PrivateRoute requiredRole="manager">
                  <AprovacaoVendas />
                </PrivateRoute>
              } 
            />

            {/* Se houver outras rotas que não exigem login (ex: uma landing page pública), defina-as aqui */}
            {/* Ex: <Route path="/public-landing" element={<PublicLandingPage />} /> */}
          </Routes>
        </SalesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;