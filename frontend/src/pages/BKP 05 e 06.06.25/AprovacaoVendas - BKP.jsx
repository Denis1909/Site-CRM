// frontend/src/pages/AprovacaoVendas.jsx
import React, { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import { useSales } from '../contexts/SalesContext'; // Caminho ajustado para o contexto

function AprovacaoVendas() {
  const { getSales, updateSaleStatus } = useSales();
  const [pendingSales, setPendingSales] = useState([]);

  // Use useCallback para memorizar a função de atualização e evitar loop infinito no useEffect
  const loadPendingSales = useCallback(() => {
    setPendingSales(getSales('pending'));
  }, [getSales]); // Dependência: getSales

  // Carrega as vendas pendentes quando o componente é montado ou quando a lista de vendas muda
  useEffect(() => {
    loadPendingSales();
  }, [loadPendingSales]); // Dependência: loadPendingSales

  const handleApprove = (saleId) => {
    updateSaleStatus(saleId, 'Aprovada');
    alert(`Venda APROVADA: ${saleId}`);
    loadPendingSales(); // Recarrega as vendas pendentes para remover a aprovada
  };

  const handleReject = (saleId) => {
    updateSaleStatus(saleId, 'Rejeitada');
    alert(`Venda REJEITADA: ${saleId}`);
    loadPendingSales(); // Recarrega as vendas pendentes para remover a rejeitada
  };

  // Função auxiliar para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="approval-container">
      <h2>Aprovação de Vendas</h2>

      {pendingSales.length === 0 ? (
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
            {pendingSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id.substring(0, 8)}...</td>
                <td>{sale.nomeCliente || 'Cliente não informado'}</td>
                <td>{sale.produtoServico}</td>
                <td>{formatCurrency(parseFloat(sale.valorVenda))}</td>
                <td>{sale.vendedorResponsavel}</td>
                <td>{sale.dataOportunidade}</td>
                <td><span className={`status-tag status-${sale.statusVenda.toLowerCase().replace(/ /g, '-')}`}>{sale.statusVenda}</span></td>
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