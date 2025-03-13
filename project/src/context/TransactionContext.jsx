import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://fintrack-iibi.onrender.com";


const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });

  // Fetch transactions when user changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    } else {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  // Calculate stats when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      calculateStats();
    }
  }, [transactions]);

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/transactions`);
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching transactions');
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching categories');
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    try {
      setError(null);
      const res = await axios.post(`${API_BASE}/api/transactions`, transactionData);
      setTransactions([...transactions, res.data]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding transaction');
      throw err;
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    try {
      setError(null);
      const res = await axios.put(`${API_BASE}/api/transactions/${id}`, transactionData);
      setTransactions(
        transactions.map(transaction => 
          transaction._id === id ? res.data : transaction
        )
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating transaction');
      throw err;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await axios.delete(`${API_BASE}/api/transactions/${id}`);
      setTransactions(
        transactions.filter(transaction => transaction._id !== id)
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting transaction');
      throw err;
    }
  };

  // Add category
  const addCategory = async (categoryData) => {
    try {
      setError(null);
      const res = await axios.post(`${API_BASE}/api/categories`, categoryData);
      setCategories([...categories, res.data]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding category');
      throw err;
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Calculate monthly stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    setStats({
      totalIncome,
      totalExpenses,
      balance,
      monthlyIncome,
      monthlyExpenses
    });
  };

  // Get transactions by category
  const getTransactionsByCategory = () => {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      }
    });
    
    return categoryTotals;
  };

  // Get monthly data for charts
  const getMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyData = {
      income: Array(12).fill(0),
      expense: Array(12).fill(0)
    };
    
    const currentYear = new Date().getFullYear();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (transaction.type === 'income') {
          monthlyData.income[month] += transaction.amount;
        } else {
          monthlyData.expense[month] += transaction.amount;
        }
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: monthlyData.income,
          backgroundColor: '#10b981'
        },
        {
          label: 'Expenses',
          data: monthlyData.expense,
          backgroundColor: '#ef4444'
        }
      ]
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        loading,
        error,
        stats,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        getTransactionsByCategory,
        getMonthlyData
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};