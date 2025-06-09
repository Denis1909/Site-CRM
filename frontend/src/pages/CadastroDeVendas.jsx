// frontend/src/pages/CadastroDeVendas.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CadastroDeVendas() {
    const { addSale, getSales } = useSales();
    const navigate = useNavigate();
    const { user, isSeller, isManager } = useAuth();

    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

    const [venda, setVenda] = useState({
        clienteId: '',
        nomeCliente: '',
        produtoServico: '',
        valorVenda: '',
        vendedorResponsavelId: (isSeller && user) ? user.id : '',
        nomeVendedor: (isSeller && user) ? `${user.firstName} ${user.lastName}` : '',
        dataOportunidade: new Date().toISOString().split('T')[0],
        observacoes: ''
    });

    useEffect(() => {
        // Atualiza o vendedor no formulário se o usuário logado mudar ou se o tipo de usuário for vendedor
        if (isSeller && user) {
            setVenda(prevVenda => ({
                ...prevVenda,
                vendedorResponsavelId: user.id,
                nomeVendedor: `${user.firstName} ${user.lastName}`
            }));
        } else if (!isManager) { // Se não for vendedor nem gerente, limpa o campo
            setVenda(prevVenda => ({
                ...prevVenda,
                vendedorResponsavelId: '',
                nomeVendedor: ''
            }));
        }
    }, [user, isSeller, isManager]);


    const [clientes, setClientes] = useState([]);
    const [isClientPopupOpen, setIsClientPopupOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const clientPopupRef = useRef(null);

    const [vendedores, setVendedores] = useState([]);
    const [isSellerPopupOpen, setIsSellerPopupOpen] = useState(false);
    const [sellerSearchTerm, setSellerSearchTerm] = useState('');
    const sellerPopupRef = useRef(null);

    const [mySales, setMySales] = useState([]);
    const [isSplitView, setIsSplitView] = useState(false); // NOVO: para controlar o layout dividido

    const currentResponsibleSellerId = venda.vendedorResponsavelId;


    const fetchClientes = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/partners`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error("Erro ao carregar clientes da API:", error);
            alert("Erro ao carregar lista de clientes.");
        }
    }, [API_BASE_URL]);

    const fetchVendedores = useCallback(async () => {
        if (isManager) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/sellers-and-managers`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setVendedores(data);
            } catch (error) {
                console.error("Erro ao carregar vendedores e gestores:", error);
                alert("Erro ao carregar lista de vendedores.");
            }
        }
    }, [API_BASE_URL, isManager]);

    useEffect(() => {
        fetchClientes();
        fetchVendedores();
    }, [fetchClientes, fetchVendedores]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (clientPopupRef.current && !clientPopupRef.current.contains(event.target)) {
                setIsClientPopupOpen(false);
                setClientSearchTerm('');
            }
        };

        if (isClientPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isClientPopupOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sellerPopupRef.current && !sellerPopupRef.current.contains(event.target)) {
                setIsSellerPopupOpen(false);
                setSellerSearchTerm('');
            }
        };

        if (isSellerPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSellerPopupOpen]);


    const loadMySales = useCallback(async () => {
        if (currentResponsibleSellerId) { 
            try {
                const response = await fetch(`${API_BASE_URL}/sales?sellerId=${currentResponsibleSellerId}`); // Rota ideal para listar vendas por vendedor
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMySales(data);
            } catch (error) {
                console.error("Erro ao carregar minhas vendas da API:", error);
                setMySales([]);
            }
        } else {
            setMySales([]);
        }
    }, [API_BASE_URL, currentResponsibleSellerId]);

    useEffect(() => {
        if (isSplitView) { // Carrega vendas quando o modo de tela dividida é ativado
             loadMySales();
        }
    }, [loadMySales, isSplitView]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setVenda(prevVenda => ({
            ...prevVenda,
            [name]: value
        }));
    };

    const handleClientSearchChange = (e) => {
        setClientSearchTerm(e.target.value);
    };

    const handleClienteSelect = (cliente) => {
        setVenda(prevVenda => ({
            ...prevVenda,
            clienteId: cliente.id,
            nomeCliente: cliente.name
        }));
        setIsClientPopupOpen(false);
        setClientSearchTerm('');
    };

    const handleSellerSearchChange = (e) => {
        setSellerSearchTerm(e.target.value);
    };

    const handleVendedorSelect = (vendedor) => {
        setVenda(prevVenda => ({
            ...prevVenda,
            vendedorResponsavelId: vendedor.id,
            nomeVendedor: `${vendedor.firstName} ${vendedor.lastName}`
        }));
        setIsSellerPopupOpen(false);
        setSellerSearchTerm('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!venda.clienteId) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        if (!venda.vendedorResponsavelId) {
            alert('Por favor, selecione um vendedor responsável.');
            return;
        }

        try {
            await addSale({
                clienteId: venda.clienteId,
                productService: venda.produtoServico,
                valorVenda: venda.valorVenda,
                vendedorResponsavelId: venda.vendedorResponsavelId,
                dataOportunidade: venda.dataOportunidade,
                observations: venda.observacoes
            });
            alert('Venda registrada com sucesso! Encaminhada para aprovação.');

            setVenda(prevVenda => ({
                clienteId: '',
                nomeCliente: '',
                produtoServico: '',
                valorVenda: '',
                vendedorResponsavelId: (isSeller && user) ? user.id : '',
                nomeVendedor: (isSeller && user) ? `${user.firstName} ${user.lastName}` : '',
                dataOportunidade: new Date().toISOString().split('T')[0],
                observacoes: ''
            }));

            // Se a tela estiver dividida, recarrega a lista de vendas, senão, redireciona para aprovação
            if (isSplitView) {
                loadMySales();
            } else if (isManager) { // Se for gestor e a tela não estiver dividida, redireciona
                navigate('/vendas/aprovar');
            }
            // Se for vendedor e a tela não estiver dividida, permanece na mesma página e o formulário é limpo
        } catch (error) {
            console.error("Falha ao registrar venda na tela:", error);
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const filteredVendedores = vendedores.filter(vendedor =>
        `${vendedor.firstName} ${vendedor.lastName}`.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
        vendedor.email.toLowerCase().includes(sellerSearchTerm.toLowerCase())
    );

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="cadastro-venda-container">
            <div className={`split-screen-wrapper ${isSplitView ? 'split-active' : ''}`}>
                <div className="top-half-content">
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
                                <button type="button" onClick={() => setIsClientPopupOpen(true)} className="search-icon-btn">
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
                            {isSeller ? (
                                <input
                                    type="text"
                                    id="vendedorResponsavel"
                                    name="nomeVendedor"
                                    value={venda.nomeVendedor}
                                    readOnly
                                    className="read-only-input"
                                />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="text"
                                        id="vendedorResponsavel"
                                        name="nomeVendedor"
                                        value={venda.nomeVendedor || 'Nenhum vendedor selecionado'}
                                        readOnly
                                        className="read-only-input"
                                    />
                                    {isManager && (
                                        <button type="button" onClick={() => setIsSellerPopupOpen(true)} className="search-icon-btn">
                                            🔍
                                        </button>
                                    )}
                                </div>
                            )}
                            <input type="hidden" name="vendedorResponsavelId" value={venda.vendedorResponsavelId} />
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

                    <button
                        type="button"
                        onClick={() => setIsSplitView(!isSplitView)}
                        className="toggle-my-sales-btn"
                    >
                        {isSplitView ? 'Esconder Minhas Vendas Registradas' : 'Ver Minhas Vendas Registradas' }
                        {isSplitView && currentResponsibleSellerId && ` (${venda.nomeVendedor})`}
                    </button>
                </div> {/* END top-half-content */}

                {isSplitView && (
                    <div className="bottom-half-content">
                        <h3>Minhas Vendas Registradas ({venda.nomeVendedor || 'Vendedor Não Selecionado'})</h3>
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
                                            <td>{sale.id ? sale.id.substring(0, 8) + '...' : '-'}</td>
                                            <td>{sale.nomeCliente || 'Cliente não informado'}</td>
                                            <td>{sale.productService}</td>
                                            <td>{formatCurrency(parseFloat(sale.value))}</td>
                                            <td>{sale.dataOportunidade ? new Date(sale.dataOportunidade).toISOString().split('T')[0] : '-'}</td>
                                            <td><span className={`status-tag status-${sale.status.toLowerCase().replace(/ /g, '-')}`}>{sale.status}</span></td>
                                            <td>{sale.observations ? sale.observations.substring(0, 20) + '...' : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )} {/* END bottom-half-content */}
            </div> {/* END split-screen-wrapper */}


            {/* POPUP DE SELEÇÃO DE CLIENTES */}
            {isClientPopupOpen && (
                <div className="client-selection-popup-overlay">
                    <div ref={clientPopupRef} className="client-selection-popup-content">
                        <h3>Buscar e Selecionar Cliente</h3>
                        <input
                            type="text"
                            placeholder="Digite para pesquisar..."
                            value={clientSearchTerm}
                            onChange={handleClientSearchChange}
                            autoFocus
                            className="popup-search-input"
                        />
                        <ul className="popup-suggestions-list">
                            {filteredClientes.length > 0 ? (
                                filteredClientes.map(cliente => (
                                    <li key={cliente.id}>
                                        {cliente.name} ({cliente.partnerCategory})
                                        <button type="button" onClick={() => handleClienteSelect(cliente)} className="select-client-btn">
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum cliente encontrado com este nome.</li>
                            )}
                        </ul>
                        <button type="button" onClick={() => { setIsClientPopupOpen(false); setClientSearchTerm(''); }} className="close-popup-btn">
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* POPUP DE SELEÇÃO DE VENDEDORES */}
            {isSellerPopupOpen && (
                <div className="seller-selection-popup-overlay">
                    <div ref={sellerPopupRef} className="seller-selection-popup-content">
                        <h3>Buscar e Selecionar Vendedor</h3>
                        <input
                            type="text"
                            placeholder="Digite para pesquisar..."
                            value={sellerSearchTerm}
                            onChange={handleSellerSearchChange}
                            autoFocus
                            className="popup-search-input"
                        />
                        <ul className="popup-suggestions-list">
                            {filteredVendedores.length > 0 ? (
                                filteredVendedores.map(vendedor => (
                                    <li key={vendedor.id}>
                                        {vendedor.firstName} {vendedor.lastName} ({vendedor.email})
                                        <button type="button" onClick={() => handleVendedorSelect(vendedor)} className="select-seller-btn">
                                            Selecionar
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum vendedor encontrado com este nome/email.</li>
                            )}
                        </ul>
                        <button type="button" onClick={() => { setIsSellerPopupOpen(false); setSellerSearchTerm(''); }} className="close-popup-btn">
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastroDeVendas;