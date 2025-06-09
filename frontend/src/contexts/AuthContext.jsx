// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Tenta carregar o usuário do localStorage ao iniciar
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erro ao ler user do localStorage:", error);
      return null;
    }
  });

  const navigate = useNavigate();
  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'; // NOVO: URL da API para produção e desenvolvimento

  // Função de login
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('Login bem-sucedido. Usuário:', data.user);
        return { success: true, user: data.user };
      } else {
        console.error('Erro no login:', data.message);
        return { success: false, message: data.message || 'Erro ao fazer login.' };
      }
    } catch (error) {
      console.error('Erro de rede ao fazer login:', error);
      return { success: false, message: 'Erro ao conectar com o servidor.' };
    }
  }, [API_BASE_URL]);

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Efeito para garantir que o user está sempre atualizado no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const contextValue = React.useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isManager: user && user.userType === 'manager',
    isSeller: user && user.userType === 'seller',
    isClient: user && user.userType === 'client',
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};