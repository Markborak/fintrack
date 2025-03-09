import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';

// Mock budget data (in a real app, this would come from the API)
const initialBudgets = [
  { id: 1, category: 'Housing', amount: 1200, spent: 1150 },
  { id: 2, category: 'Food', amount: 500, spent: 420 },
  { id: 3, category: 'Transportation', amount: 300, spent: 280 },
  { id: 4, category: 'Entertainment', amount: 200, spent: 150 },
  { id: 5, category: 'Healthcare', amount: 150, spent: 75 },
  { id: 6, category: 'Shopping', amount: 300, spent: 350 }
];

const Budget = () => {
  const { loading } = useTransactions();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate progress percentage
  const calculateProgress = (spent, amount) => {
    return Math.min((spent / amount) * 100, 100);
  };

  // Determine progress bar color
  const getProgressColor = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (percentage < 70) return 'good';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  // Handle edit budget
  const handleEdit = (budget) => {
    setCurrentBudget(budget);
    setShowEditModal(true);
  };

  // Handle delete budget
  const handleDelete = (budget) => {
    setCurrentBudget(budget);
    setShowDeleteModal(true);
  };

  // Add new budget
  const addBudget = (budget) => {
    const newBudget = {
      id: budgets.length + 1,
      ...budget,
      spent: 0
    };
    setBudgets([...budgets, newBudget]);
    setShowAddModal(false);
  };

  // Update budget
  const updateBudget = (updatedBudget) => {
    setBudgets(budgets.map(budget => 
      budget.id === updatedBudget.id ? updatedBudget : budget
    ));
    setShowEditModal(false);
  };

  // Delete budget
  const deleteBudget = () => {
    setBudgets(budgets.filter(budget => budget.id !== currentBudget.id));
    setShowDeleteModal(false);
  };

  // Calculate total budget and spent
  const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
  const totalSpent = budgets.reduce((total, budget) => total + budget.spent, 0);
  const totalProgress = calculateProgress(totalSpent, totalBudget);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="transactions-header">
        <h2 className="section-title">Budget Management</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Add Budget
        </button>
      </div>

      {/* Total Budget Overview */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Total Budget Overview</h3>
        <div className="flex justify-between mb-2">
          <span>Total Budget: {formatCurrency(totalBudget)}</span>
          <span>Spent: {formatCurrency(totalSpent)} ({Math.round(totalProgress)}%)</span>
        </div>
        <div className="budget-progress">
          <div 
            className={`budget-progress-bar ${getProgressColor(totalSpent, totalBudget)}`}
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="budget-overview">
        {budgets.map(budget => (
          <div key={budget.id} className="budget-card">
            <div className="budget-header">
              <h3 className="budget-title">{budget.category}</h3>
              <div className="flex gap-2">
                <button className="action-btn" onClick={() => handleEdit(budget)}>
                  <FiEdit2 />
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(budget)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="budget-amount">{formatCurrency(budget.amount)}</div>
            <div className="budget-progress">
              <div 
                className={`budget-progress-bar ${getProgressColor(budget.spent, budget.amount)}`}
                style={{ width: `${calculateProgress(budget.spent, budget.amount)}%` }}
              ></div>
            </div>
            <div className="budget-details">
              <span>Spent: {formatCurrency(budget.spent)}</span>
              <span>Remaining: {formatCurrency(budget.amount - budget.spent)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <BudgetModal 
          onClose={() => setShowAddModal(false)}
          onSave={addBudget}
        />
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <BudgetModal 
          budget={currentBudget}
          onClose={() => setShowEditModal(false)}
          onSave={updateBudget}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for ${currentBudget.category}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={deleteBudget}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Budget;