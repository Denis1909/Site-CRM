// src/pages/RegisterPage.jsx
import React, { useState } => { // Importe useState do React
import { Link } from 'react-router-dom';
import '../App.css'; // Reutiliza o CSS geral para alguns estilos básicos

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client'); // Padrão: cliente

  const handleRegister = (event) => {
    event.preventDefault(); // Impede o recarregamento da página padrão do navegador
    console.log('Tentativa de cadastro com:', { name, email, password, userType });
    // Lógica de cadastro com o backend virá aqui
    // Por enquanto, apenas exibe no console
  };

  return (
    <div className="container">
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Nome Completo:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userType">Tipo de Usuário:</label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="client">Cliente</option>
            <option value="seller">Vendedor</option>
            <option value="manager">Gerente</option>
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <p>
        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
}

export default RegisterPage;