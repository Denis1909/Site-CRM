// frontend/src/pages/AprovacaoVendas.jsx código já chamando a api backend
import React, { useEffect, useState, useCallback } from 'react';
import { useSales } from '../contexts/SalesContext'; // Caminho ajustado para o contexto

function AprovacaoVendas() {
  const { sales, getSales, updateSaleStatus } = useSales(); // Pegar 'sales' diretamente do contexto
  // const [pendingSales, setPendingSales] = useState([]); // Não precisamos mais deste estado local para 'pendingSales'

  // A lista de vendas pendentes agora é gerenciada pelo contexto 'sales'
  // e o useEffect no SalesContext já chama fetchPendingSales.
  // Podemos usar 'sales' diretamente aqui, já que o contexto está configurado
  // para preencher 'sales' com as vendas pendentes.

  useEffect(() => {
    // getSales('pending') já é chamado no SalesContext.jsx via useEffect.
    // Se precisarmos forçar um refresh aqui, poderíamos chamar:
    // getSales('pending');
    // Mas 'sales' do contexto já deve estar atualizado.
  }, [sales]); // Dependência em 'sales' para reagir a mudanças no contexto


  const handleApprove = async (saleId) => { // Tornar async para usar await
    try {
      await updateSaleStatus(saleId, 'Aprovada');
      alert(`Venda APROVADA: ${saleId}`);
      // O fetchPendingSales já é chamado dentro de updateSaleStatus no contexto
    } catch (error) {
      console.error("Erro ao aprovar venda na tela:", error);
      // Erro já alertado no contexto
    }
  };

  const handleReject = async (saleId) => { // Tornar async para usar await
    try {
      await updateSaleStatus(saleId, 'Rejeitada');
      alert(`Venda REJEITADA: ${saleId}`);
      // O fetchPendingSales já é chamado dentro de updateSaleStatus no contexto
    } catch (error) {
      console.error("Erro ao rejeitar venda na tela:", error);
      // Erro já alertado no contexto
    }
  };

  // Função auxiliar para formatar valores monetários
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="approval-container">
      <h2>Aprovação de Vendas</h2>

      {sales.length === 0 ? ( // Usar 'sales' direto do contexto
        <p className="no-sales-message">Nenhuma venda pendente de aprovação no momento.</p>
      ) : (
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID Venda</th>
              <th>Cliente</th>
              <th>Produto/Serviço</th>
              <th>Valor</th>
              <th>Vendedor</th>
              <th>Data Oportunidade</th>
              <th>Status Atual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => ( // Usar 'sales' direto do contexto
              <tr key={sale.id}>
                <td>{sale.id ? sale.id.substring(0, 8) + '...' : '-'}</td>
                <td>{sale.nomeCliente || 'Cliente não informado'}</td>
                <td>{sale.produtoServico}</td>
                <td>{formatCurrency(parseFloat(sale.value))}</td> {/* Usar sale.value */}
                <td>{sale.vendedorResponsavel}</td>
                <td>{sale.dataOportunidade ? new Date(sale.dataOportunidade).toISOString().split('T')[0] : '-'}</td> {/* Formatar data */}
                <td><span className={`status-tag status-${sale.status.toLowerCase().replace(/ /g, '-')}`}>{sale.status}</span></td> {/* Usar sale.status */}
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(sale.id)}
                    title="Aprovar Venda"
                  >
                    Aprovar
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(sale.id)}
                    title="Rejeitar Venda"
                  >
                    Rejeitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AprovacaoVendas;