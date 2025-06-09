// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Se não estiver autenticado, redireciona para a página de login
        alert('Você precisa estar logado para acessar esta página.'); // Alerta para o usuário
        return <Navigate to="/login" replace />;
    }

    // Se um role específico for exigido e o usuário não tiver esse role
    if (requiredRole && (!user || user.userType !== requiredRole)) {
        // Redireciona para o dashboard ou uma página de "Acesso Negado"
        alert(`Você não tem permissão (${requiredRole} necessário) para acessar esta página.`);
        return <Navigate to="/" replace />; // Redireciona para o dashboard
    }

    // Se estiver autenticado e tiver a permissão necessária, renderiza o componente filho
    return children;
};

export default PrivateRoute;