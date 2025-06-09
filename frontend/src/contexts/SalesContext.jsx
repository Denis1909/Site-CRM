// frontend/src/contexts/SalesContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'; // NOVO: URL da API para produção e desenvolvimento


  const fetchPendingSales = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/pending`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSales(data);
      console.log('Vendas pendentes carregadas da API:', data);
    } catch (error) {
      console.error("Erro ao carregar vendas pendentes da API:", error);
    }
  }, [API_BASE_URL]);

  // getSales agora pode ter um filtro para o vendedor logado
  const getSales = useCallback(async (filter = 'all', sellerId = null) => {
    try {
      let url = `${API_BASE_URL}/sales`; // Rota genérica para todas as vendas
      if (filter === 'pending') {
        url = `${API_BASE_URL}/sales/pending`;
      } else if (sellerId) {
        url = `${API_BASE_URL}/sales?sellerId=${sellerId}`; // NOVO: Rota para buscar vendas por vendedor
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao carregar vendas da API:", error);
      return [];
    }
  }, [API_BASE_URL]);


  useEffect(() => {
    fetchPendingSales();
  }, [fetchPendingSales]);

  const addSale = async (newSaleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSaleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Venda adicionada via API:', data);
      return data;
    } catch (error) {
      console.error("Erro ao adicionar venda via API:", error);
      alert(`Erro ao registrar venda: ${error.message}`);
      throw error;
    }
  };

  const updateSaleStatus = async (saleId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/${saleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Status da venda ${saleId} atualizado para ${newStatus} via API:`, data);

      fetchPendingSales();
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar status da venda ${saleId} na API:`, error);
      alert(`Erro ao atualizar venda: ${error.message}`);
      throw error;
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSales, updateSaleStatus }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales deve ser usado dentro de um SalesProvider');
  }
  return context;
};