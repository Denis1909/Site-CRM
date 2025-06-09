// frontend/src/pages/CadastroDeVendas.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useNavigate } from 'react-router-dom';

function CadastroDeVendas() {
    const { addSale, getSales } = useSales();
    const navigate = useNavigate();

    // Estado para armazenar os dados da nova venda
    const [venda, setVenda] = useState({
        clienteId: '', // Vai armazenar o ID do cliente selecionado
        nomeCliente: '', // Para exibição no campo de seleção
        produtoServico: '',
        valorVenda: '',
        vendedorResponsavel: 'Nome do Vendedor Logado', // Pode ser preenchido dinamicamente (ex: do contexto de usuário)
        dataOportunidade: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
        statusVenda: 'Pendente de Aprovação', // Status inicial, será sobrescrito pelo addSale do contexto
        observacoes: ''
    });

    // Estado para armazenar a lista de clientes (mockada por enquanto)
    const [clientes, setClientes] = useState([]);

    // ESTADOS PARA NOVA FUNCIONALIDADE DE SELEÇÃO DE CLIENTE (POPUP)
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupSearchTerm, setPopupSearchTerm] = useState('');
    const popupRef = useRef(null);

    // NOVO ESTADO: Vendas registradas por este vendedor
    const [mySales, setMySales] = useState([]);

    // NOVO ESTADO: Controla a visibilidade da seção "Minhas Vendas Registradas"
    const [showMySales, setShowMySales] = useState(false);

    // Identificador do vendedor logado (mockado para agora)
    const loggedInVendedor = venda.vendedorResponsavel; // Ou viria de um contexto de autenticação

    // Efeito para "carregar" os clientes mockados quando o componente for montado
    useEffect(() => {
        const mockClientes = [
            { id: 'pf001', tipo: 'PF', nome: 'Maria Silva' },
            { id: 'pj001', tipo: 'PJ', nome: 'Empresa Alpha Ltda.' },
            { id: 'pf002', tipo: 'PF', nome: 'João Souza' },
            { id: 'pj002', tipo: 'PJ', nome: 'Indústrias Beta S.A.' },
            { id: 'pf003', tipo: 'PF', nome: 'Ana Costa' },
            { id: 'pf004', tipo: 'PF', nome: 'Pedro Alvares' },
            { id: 'pj003', tipo: 'PJ', nome: 'Loja Teste ME' },
        ];
        setClientes(mockClientes);
    }, []);

    // Função para carregar as vendas do Vendedor Logado
    const loadMySales = useCallback(() => {
        const allSales = getSales();
        const salesByThisVendedor = allSales.filter(
            sale => sale.vendedorResponsavel === loggedInVendedor
        );
        setMySales(salesByThisVendedor);
    }, [getSales, loggedInVendedor]);

    // Efeito para carregar as vendas do vendedor quando o componente é montado
    useEffect(() => {
        loadMySales();
    }, [loadMySales]);

    // Efeito para lidar com cliques fora do popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
                setPopupSearchTerm('');
            }
        };

        if (isPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopupOpen]);

    // Função para lidar com a mudança nos campos do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVenda(prevVenda => ({
            ...prevVenda,
            [name]: value
        }));
    };

    // Função para lidar com a mudança no campo de pesquisa DENTRO DO POPUP
    const handlePopupSearchChange = (e) => {
        setPopupSearchTerm(e.target.value);
    };

    // Função para lidar com a seleção de um cliente no popup
    const handleClienteSelect = (cliente) => {
        setVenda(prevVenda => ({
            ...prevVenda,
            clienteId: cliente.id,
            nomeCliente: cliente.nome
        }));
        setIsPopupOpen(false);
        setPopupSearchTerm('');
    };

    // Função para lidar com a submissão do formulário
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!venda.clienteId) {
            alert('Por favor, selecione um cliente da lista de sugestões.');
            return;
        }

        addSale(venda);

        alert('Venda registrada com sucesso! Encaminhada para aprovação.');

        setVenda({
            clienteId: '',
            nomeCliente: '',
            produtoServico: '',
            valorVenda: '',
            vendedorResponsavel: loggedInVendedor,
            dataOportunidade: new Date().toISOString().split('T')[0],
            statusVenda: 'Pendente de Aprovação',
            observacoes: ''
        });
        
        loadMySales(); // Recarrega a lista de vendas do vendedor após cadastrar

        // Decide se redireciona ou não, com base no feedback do usuário.
        // Para este exercício, vou manter o redirecionamento para a tela de aprovação,
        // mas você poderia perguntar ao usuário ou ter uma opção.
        navigate('/vendas/aprovar');
    };

    // Filtrar clientes COM BASE NO popupSearchTerm
    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(popupSearchTerm.toLowerCase())
    );

    // Função auxiliar para formatar valores monetários
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="cadastro-venda-container">
            {/* BLOCo DE REGISTRO DE VENDAS - SEMPRE VISÍVEL */}
            <h2>Registrar Nova Venda</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cliente">Cliente:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="text"
                            id="cliente"
                            name="nomeCliente"
                            value={venda.nomeCliente || 'Nenhum cliente selecionado'}
                            readOnly
                            className="read-only-input"
                        />
                        <button type="button" onClick={() => setIsPopupOpen(true)} className="search-icon-btn">
                            🔍
                        </button>
                    </div>
                    <input type="hidden" name="clienteId" value={venda.clienteId} />
                </div>

                <div className="form-group">
                    <label htmlFor="produtoServico">Produto/Serviço:</label>
                    <input
                        type="text"
                        id="produtoServico"
                        name="produtoServico"
                        value={venda.produtoServico}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="valorVenda">Valor da Venda:</label>
                    <input
                        type="number"
                        id="valorVenda"
                        name="valorVenda"
                        value={venda.valorVenda}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="vendedorResponsavel">Vendedor Responsável:</label>
                    <input
                        type="text"
                        id="vendedorResponsavel"
                        name="vendedorResponsavel"
                        value={venda.vendedorResponsavel}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dataOportunidade">Data da Oportunidade:</label>
                    <input
                        type="date"
                        id="dataOportunidade"
                        name="dataOportunidade"
                        value={venda.dataOportunidade}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="statusVenda">Status da Venda:</label>
                    <select
                        id="statusVenda"
                        name="statusVenda"
                        value={venda.statusVenda}
                        onChange={handleChange}
                        required
                    >
                        <option value="Pendente de Aprovação">Pendente de Aprovação</option>
                        <option value="Em Negociação">Em Negociação</option>
                        <option value="Aprovada">Aprovada</option>
                        <option value="Rejeitada">Rejeitada</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="observacoes">Observações:</label>
                    <textarea
                        id="observacoes"
                        name="observacoes"
                        value={venda.observacoes}
                        onChange={handleChange}
                        rows="4"
                    ></textarea>
                </div>

                <button type="submit">Registrar Venda</button>
            </form>

            {/* BOTÃO PARA ALTERNAR A VISIBILIDADE DAS MINHAS VENDAS */}
            <button
                type="button"
                onClick={() => setShowMySales(!showMySales)}
                className="toggle-my-sales-btn"
            >
                {showMySales ? 'Esconder Minhas Vendas' : 'Ver Minhas Vendas Registradas'}
            </button>

            {/* SEÇÃO PARA EXIBIR AS VENDAS REGISTRADAS POR ESTE VENDEDOR (CONDICIONALMENTE) */}
            {showMySales && (
                <div className="my-sales-section">
                    <h3>Minhas Vendas Registradas ({loggedInVendedor})</h3>
                    {mySales.length === 0 ? (
                        <p className="no-sales-message">Você ainda não registrou nenhuma venda.</p>
                    ) : (
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>ID Venda</th>
                                    <th>Cliente</th>
                                    <th>Produto</th>
                                    <th>Valor</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Obs.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mySales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>{sale.id.substring(0, 8)}...</td>
                                        <td>{sale.nomeCliente}</td>
                                        <td>{sale.produtoServico}</td>
                                        <td>{formatCurrency(parseFloat(sale.valorVenda))}</td>
                                        <td>{sale.dataOportunidade}</td>
                                        <td><span className={`status-tag status-${sale.statusVenda.toLowerCase().replace(/ /g, '-')}`}>{sale.statusVenda}</span></td>
                                        <td>{sale.observacoes ? sale.observacoes.substring(0, 20) + '...' : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}


            {/* POPUP DE SELEÇÃO DE CLIENTES */}
            {isPopupOpen && (
                <div className="client-selection-popup-overlay">
                    <div ref={popupRef} className="client-selection-popup-content">
                        <h3>Buscar e Selecionar Cliente</h3>
                        <input
                            type="text"
                            placeholder="Digite para pesquisar..."
                            value={popupSearchTerm}
                            onChange={handlePopupSearchChange}
                            autoFocus
                            className="popup-search-input"
                        />
                        <ul className="popup-suggestions-list">
                            {filteredClientes.length > 0 ? (
                                filteredClientes.map(cliente => (
                                    <li key={cliente.id}>
                                        {cliente.nome} ({cliente.tipo})
                                        <button type="button" onClick={() => handleClienteSelect(cliente)} className="select-client-btn">
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum cliente encontrado com este nome.</li>
                            )}
                        </ul>
                        <button type="button" onClick={() => { setIsPopupOpen(false); setPopupSearchTerm(''); }} className="close-popup-btn">
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastroDeVendas;