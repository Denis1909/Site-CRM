// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        userType: 'seller', // Valor padrão, será alterado pela seleção
        branch: '',
        manager: '' // Campo para o ID do gerente, se aplicável
    });

    const [passwordErrors, setPasswordErrors] = useState([]);
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

    const validatePasswordComplexity = (pwd) => {
        let errors = [];
        if (!/[A-Z]/.test(pwd)) {
            errors.push('pelo menos 1 letra maiúscula');
        }
        if (!/[0-9]|[^a-zA-Z0-9]/.test(pwd)) {
            errors.push('pelo menos 1 número ou símbolo');
        }
        if (pwd.length < 6 || pwd.length > 12) {
            errors.push('entre 6 e 12 caracteres');
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'password') {
            const errors = validatePasswordComplexity(value);
            setPasswordErrors(errors);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            alert('A senha e a confirmação de senha não coincidem.');
            return;
        }

        if (passwordErrors.length > 0) {
            alert(`Por favor, corrija os seguintes erros na senha: ${passwordErrors.join(', ')}.`);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                navigate('/'); // Redireciona para o Dashboard após o registro
            } else {
                alert(`Erro no registro: ${data.message || 'Ocorreu um erro.'}`);
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Cadastrar Novo Usuário</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">Primeiro Nome:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="middleName">Nome do Meio (Opcional):</label>
                    <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Sobrenome:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {passwordErrors.length > 0 && (
                        <ul className="password-errors">
                            {passwordErrors.map((error, index) => (
                                <li key={index}>- A senha precisa ter {error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Senha:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="userType">Tipo De Usuário:</label>
                    <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        required
                    >
                        <option value="seller">Vendedor</option>
                        <option value="manager">Gestor de Vendas</option>
                        <option value="client">Cliente</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="branch">Filial:</label>
                    <input
                        type="text"
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="manager">ID do Gestor (se aplicável):</label>
                    <input
                        type="text"
                        id="manager"
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
            <p>Já tem uma conta? <Link to="/login">Faça Login</Link></p>
        </div>
    );
}

export default RegisterPage;