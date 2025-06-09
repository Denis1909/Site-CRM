// frontend/src/contexts/SalesContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState(() => {
    try {
      const storedSales = localStorage.getItem('crm_sales');
      return storedSales ? JSON.parse(storedSales) : [];
    } catch (error) {
      console.error("Erro ao carregar vendas do localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_sales', JSON.stringify(sales));
    } catch (error) {
      console.error("Erro ao salvar vendas no localStorage:", error);
    }
  }, [sales]);

  const addSale = (newSaleData) => {
    const id = `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSale = { 
      ...newSaleData, 
      id: id,
      statusVenda: 'Pendente de Aprovação' 
    };
    setSales((prevSales) => [...prevSales, newSale]);
    console.log('Venda adicionada ao estado global:', newSale);
  };

  const getSales = (filter = 'all') => {
    if (filter === 'pending') {
      return sales.filter(sale => sale.statusVenda === 'Pendente de Aprovação');
    }
    return sales;
  };

  const updateSaleStatus = (saleId, newStatus) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId ? { ...sale, statusVenda: newStatus } : sale
      )
    );
    console.log(`Status da venda ${saleId} atualizado para: ${newStatus}`);
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