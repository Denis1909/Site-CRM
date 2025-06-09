import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Carrega o CSS geral para alguns estilos básicos

function RegisterPage() {
  // Estados para os campos de nome
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState(''); // Para o "Segundo nome"
  const [lastName, setLastName] = useState('');

  // Estados para e-mail, senha e tipo de usuário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(''); // Removido padrão para exigir seleção

  // NOVO ESTADO para repetir a senha
  const [confirmPassword, setConfirmPassword] = useState('');

  // NOVOS ESTADOS para os campos adicionais
  // Removidos jobTitle e department
  const [branch, setBranch] = useState('');         // Para "Filial"
  const [manager, setManager] = useState('');       // Para "Gerente" (simulado)

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' ou 'job'

  // NOVO ESTADO para a mensagem de erro da senha
  const [passwordError, setPasswordError] = useState('');
  // NOVO ESTADO para a mensagem de erro da confirmação de senha
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Função de validação da senha (complexidade)
  const validatePasswordComplexity = (pwd) => {
    let errors = [];

    // 1. Pelo menos 1 letra maiúscula
    if (!/[A-Z]/.test(pwd)) {
      errors.push('1 letra maiúscula');
    }

    // 2. Pelo menos 1 número ou símbolo (não letra ou número)
    const hasNumberOrSymbol = /[0-9]|[^a-zA-Z0-9]/.test(pwd);
    if (!hasNumberOrSymbol) {
      errors.push('1 número ou símbolo');
    }

    // 3. De 6 a 12 caracteres
    if (pwd.length < 6 || pwd.length > 12) {
      errors.push('entre 6 e 12 caracteres');
    }

    return errors; // Retorna um array de erros, se houver
  };

  // Função para lidar com a mudança no campo de senha
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Valida a complexidade da senha em tempo real
    const complexityErrors = validatePasswordComplexity(newPassword);
    if (complexityErrors.length > 0) {
      setPasswordError(`A senha precisa ter: ${complexityErrors.join(', ')}.`);
    } else {
      setPasswordError('');
    }

    // Se a confirmação de senha já tiver algo, re-valida para dar feedback imediato
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Função para lidar com a mudança no campo de CONFIRMAR SENHA
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    // Valida se a confirmação de senha é igual à senha principal
    if (newConfirmPassword !== password) {
      setConfirmPasswordError('As senhas não coincidem.');
    } else {
      setConfirmPasswordError('');
    }
  };


  const handleRegister = (event) => {
    event.preventDefault(); // Impede o recarregamento da página padrão do navegador

    // 1. Validação final da COMPLEXIDADE DA SENHA
    const complexityErrors = validatePasswordComplexity(password);
    if (complexityErrors.length > 0) {
      setPasswordError(`A senha precisa ter: ${complexityErrors.join(', ')}.`);
      setConfirmPasswordError(''); // Limpa erro de confirmação para focar no erro principal
      setActiveTab('personal'); // Volta para a aba de dados pessoais se o erro for na senha
      return;
    } else {
      setPasswordError('');
    }

    // 2. Validação da CONFIRMAÇÃO DE SENHA (se é igual à senha)
    if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
      setActiveTab('personal'); // Volta para a aba de dados pessoais se o erro for aqui
      return;
    } else {
      setConfirmPasswordError('');
    }

    // Se tudo estiver OK até aqui, pode prosseguir com o log ou envio para o backend
    console.log('Tentativa de cadastro com:', {
      firstName,
      middleName,
      lastName,
      email,
      password, // Em um ambiente real, você não logaria a senha diretamente!
      userType,
      branch,
      manager
    });
    alert('Cadastro simulado! Verifique o console para os dados.'); // Feedback visual temporário
    // Aqui você enviaria os dados para o backend (API)
  };

  return (
    <div className="container">
      <h2>Cadastro de Usuário</h2>

      {/* Navegação das Abas */}
      <div className="tabs">
        <button
          className={activeTab === 'personal' ? 'active' : ''}
          onClick={() => setActiveTab('personal')}
        >
          Dados pessoais
        </button>
        <button
          className={activeTab === 'job' ? 'active' : ''}
          onClick={() => setActiveTab('job')}
        >
          Dados do cargo
        </button>
      </div>

      <form onSubmit={handleRegister}>
        {/* CONTEÚDO DA ABA 'DADOS PESSOAIS' */}
        {activeTab === 'personal' && (
          <div className="tab-content">
            {/* CAMPOS DE NOME */}
            <div className="form-group">
              <label htmlFor="firstName">Primeiro nome: *</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="middleName">Segundo nome: *</label>
              <input
                type="text"
                id="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Sobrenome: *</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* E-MAIL E SENHA */}
            <div className="form-group">
              <label htmlFor="email">E-mail: *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha: *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && <p className="error-message">{passwordError}</p>}
            </div>

            {/* CAMPO: REPETIR SENHA */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Repetir Senha: *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
            </div>

            {/* Botão para avançar para a próxima aba */}
            <button type="button" onClick={() => setActiveTab('job')}>Próximo</button>
          </div>
        )}

        {/* CONTEÚDO DA ABA 'DADOS DO CARGO' */}
        {activeTab === 'job' && (
          <div className="tab-content">
            {/* TIPO DE USUÁRIO - AGORA SÓ "TIPO DE USUÁRIO" */}
            <div className="form-group">
              <label htmlFor="userType">Tipo de Usuário: *</label> {/* Label alterado */}
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
              >
                <option value="">Selecione...</option> {/* Opção padrão */}
                <option value="client">Cliente</option>
                <option value="seller">Vendedor</option>
                <option value="manager">Gerente</option>
                {/* Opção 'president' REMOVIDA */}
              </select>
            </div>

            {/* CAMPOS "Título do cargo" e "Departamento" REMOVIDOS */}

            {/* CAMPO FILIAL - AGORA SELECT */}
            <div className="form-group">
              <label htmlFor="branch">Filial: *</label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="matriz">1. Matriz</option>
                <option value="filial2">2. Filial 2</option>
                <option value="filial3">3. Filial 3</option>
              </select>
            </div>

            {/* CAMPO GERENTE - AGORA SELECT SIMULADO */}
            <div className="form-group">
              <label htmlFor="manager">Gerente: *</label>
              <select
                id="manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {/* OPÇÕES SIMULADAS - FUTURAMENTE VIRÃO DO BACKEND */}
                <option value="gerente1">Gerente Exemplo 1</option>
                <option value="gerente2">Gerente Exemplo 2</option>
                <option value="gerente3">Gerente Exemplo 3</option>
              </select>
            </div>
            {/* Botão para voltar para a aba anterior */}
            <button type="button" onClick={() => setActiveTab('personal')}>Anterior</button>
          </div>
        )}

        {/* O botão de submit só deve aparecer na ABA FINAL para enviar o formulário completo */}
        {activeTab === 'job' && (
          <button type="submit">Cadastrar</button>
        )}
      </form>
      <p>
        Já tem uma conta? <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
}

export default RegisterPage;