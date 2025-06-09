// frontend/src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link para navegação

function Dashboard() {
    // O caminho para a imagem do logo.
    // Ajustado para o nome exato do seu arquivo na pasta 'public'.
    // Exemplo: se logo-crm.PNG está em frontend/public/logo-crm.PNG
    const logoPath = '/logo-crm.PNG'; 

    return (
        <div className="dashboard-layout">
            {/* Topo: Header do Dashboard com widgets de informações */}
            <header className="dashboard-header">
                <h1>Seu CRM - Dashboard Principal</h1>
                <div className="dashboard-widgets">
                    <div className="widget">Vendas do Mês: R$ 15.000</div>
                    <div className="widget">Novos Leads: 25</div>
                    <div className="widget">Taxa de Conversão: 10%</div>
                </div>
            </header>

            {/* Menu Lateral (Sidebar) */}
            <nav className="dashboard-sidebar">
                <h3>Menu</h3>
                <ul>
                    <li>
                        {/* Link para a Página Inicial do Dashboard */}
                        <Link to="/">Página Inicial</Link>
                    </li>
                    <li>
                        {/* Link para a página de Cadastro de Parceiros (rota de nível superior) */}
                        <Link to="/register-partner">Cadastro de Parceiros</Link>
                    </li>
                    <li>
                        {/* Link para a página de Cadastro de Vendas (rota de nível superior) */}
                        <Link to="/vendas/cadastrar">Cadastro de Vendas</Link>
                    </li>
                    <li>
                        {/* Link para a futura página de Aprovação de Vendas (rota de nível superior) */}
                        <Link to="/vendas/aprovar">Aprovação de Vendas</Link>
                    </li>
                    <li>
                        {/* Placeholder para Relatórios */}
                        <Link to="/reports">Relatórios</Link>
                    </li>
                </ul>
            </nav>

            {/* Conteúdo Principal do Dashboard (apenas a tela de boas-vindas) */}
            <main className="dashboard-main-content">
                {/* O logo será centralizado aqui. Verifique o caminho da imagem! */}
                {logoPath && (
                    <img
                        src={logoPath}
                        alt="Logo do CRM"
                        className="crm-logo"
                        // Estilos inline são apenas uma opção. Preferencialmente, mova para App.css
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