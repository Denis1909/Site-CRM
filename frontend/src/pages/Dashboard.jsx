// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
    const logoPath = '/logo-crm.PNG';
    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
    const { user, isManager, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        totalMonthlySales: '0,00',
        newLeads: 0,
        conversionRate: '0,00'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);


    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(value));
    };

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDashboardData({
                totalMonthlySales: data.totalMonthlySales,
                newLeads: data.newLeads,
                conversionRate: data.conversionRate
            });
            console.log('Dados do Dashboard carregados:', data);
        } catch (error) {
            console.error("Erro ao carregar dados do Dashboard:", error);
            setDashboardData({
                totalMonthlySales: 'Erro',
                newLeads: 'Erro',
                conversionRate: 'Erro'
            });
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return (
        // O dashboard-layout agora é um GRID, como definido no seu App.css
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <h1>Seu CRM - Dashboard Principal</h1>
                <div className="dashboard-widgets">
                    <div className="widget">Vendas do Mês: {formatCurrency(dashboardData.totalMonthlySales)}</div>
                    <div className="widget">Novos Leads: {dashboardData.newLeads}</div>
                    <div className="widget">Taxa de Conversão: {dashboardData.conversionRate}%</div>
                </div>
                {user && (
                    <div className="user-info">
                        Bem-vindo(a), {user.firstName} ({user.userType})!
                        <button onClick={logout} className="logout-btn">Sair</button>
                    </div>
                )}
            </header>

            {/* Sidebar (menu lateral) - Corresponde a 'sidebar' no grid-area */}
            <nav className="dashboard-sidebar">
                <h3>Menu</h3>
                <ul>
                    <li>
                        <Link to="/">Página Inicial</Link>
                    </li>
                    {isManager && (
                        <li>
                            <Link to="/register-partner">Cadastro de Parceiros</Link>
                        </li>
                    )}
                    <li>
                        <Link to="/vendas/cadastrar">Cadastro de Vendas</Link>
                    </li>
                    {isManager && (
                        <li>
                            <Link to="/vendas/aprovar">Aprovação de Vendas</Link>
                        </li>
                    )}
                    {isManager && (
                        <li>
                            <Link to="/register">Cadastro de Novo Usuário</Link>
                        </li>
                    )}
                    <li>
                        <Link to="/reports">Relatórios</Link>
                    </li>
                </ul>
            </nav>

            {/* Conteúdo Principal do Dashboard - Corresponde a 'main' no grid-area */}
            <main className="dashboard-main-content">
                {logoPath && (
                    <img
                        src={logoPath}
                        alt="Logo do CRM"
                        className="crm-logo"
                        style={{ maxWidth: '300px', height: 'auto', marginBottom: '40px' }}
                    />
                )}
                <h2>Bem-vindo ao seu CRM Mattos Tecnologias!</h2>
                <p>Utilize o menu lateral para navegar e os dashboards acima para acompanhar seus resultados.</p>
            </main>
        </div>
    );
}

export default Dashboard;