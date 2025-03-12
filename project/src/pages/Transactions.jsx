import React, { useState, useEffect } from "react";
import { useTransactions } from "../context/TransactionContext";
import {
  FiPlus,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import TransactionModal from "../components/TransactionModal";
import ConfirmModal from "../components/ConfirmModal";

const Transactions = () => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateRange: "all",
    sortBy: "date-desc",
  });

  // Initialize filtered transactions
  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  // Apply filters to transactions
  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (filters.dateRange === "today") {
        filtered = filtered.filter((t) => {
          const date = new Date(t.date);
          return date >= today;
        });
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        filtered = filtered.filter((t) => {
          const date = new Date(t.date);
          return date >= weekAgo;
        });
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        filtered = filtered.filter((t) => {
          const date = new Date(t.date);
          return date >= monthAgo;
        });
      } else if (filters.dateRange === "year") {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);

        filtered = filtered.filter((t) => {
          const date = new Date(t.date);
          return date >= yearAgo;
        });
      }
    }

    // Sort transactions
    if (filters.sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filters.sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sortBy === "amount-desc") {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (filters.sortBy === "amount-asc") {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    setFilteredTransactions(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setCurrentTransaction(transaction);
    setShowEditModal(true);
  };

  // Handle delete transaction
  const handleDelete = (transaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteModal(true);
  };

  // Confirm delete transaction
  const confirmDelete = async () => {
    try {
      await deleteTransaction(currentTransaction._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-KE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = transactions.map((t) => t.category);
    return ["all", ...new Set(categories)];
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="transactions-header">
        <h2 className="section-title">All Transactions</h2>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Add Transaction
        </button>
      </div>

      <div className="transactions-filters">
        <div className="filter-item">
          <button className="btn-outline flex items-center gap-2">
            <FiFilter /> Type:{" "}
            {filters.type === "all"
              ? "All"
              : filters.type === "income"
              ? "Income"
              : "Expense"}
          </button>
          <div className="filter-dropdown">
            <div
              className="filter-option"
              onClick={() => handleFilterChange("type", "all")}
            >
              All
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("type", "income")}
            >
              Income
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("type", "expense")}
            >
              Expense
            </div>
          </div>
        </div>

        <div className="filter-item">
          <button className="btn-outline flex items-center gap-2">
            <FiFilter /> Category:{" "}
            {filters.category === "all" ? "All" : filters.category}
          </button>
          <div className="filter-dropdown">
            {getUniqueCategories().map((category) => (
              <div
                key={category}
                className="filter-option"
                onClick={() => handleFilterChange("category", category)}
              >
                {category === "all" ? "All" : category}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-item">
          <button className="btn-outline flex items-center gap-2">
            <FiFilter /> Date:{" "}
            {filters.dateRange === "all"
              ? "All Time"
              : filters.dateRange === "today"
              ? "Today"
              : filters.dateRange === "week"
              ? "This Week"
              : filters.dateRange === "month"
              ? "This Month"
              : "This Year"}
          </button>
          <div className="filter-dropdown">
            <div
              className="filter-option"
              onClick={() => handleFilterChange("dateRange", "all")}
            >
              All Time
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("dateRange", "today")}
            >
              Today
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("dateRange", "week")}
            >
              This Week
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("dateRange", "month")}
            >
              This Month
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("dateRange", "year")}
            >
              This Year
            </div>
          </div>
        </div>

        <div className="filter-item">
          <button className="btn-outline flex items-center gap-2">
            <FiFilter /> Sort By:{" "}
            {filters.sortBy === "date-desc"
              ? "Date (Newest)"
              : filters.sortBy === "date-asc"
              ? "Date (Oldest)"
              : filters.sortBy === "amount-desc"
              ? "Amount (Highest)"
              : "Amount (Lowest)"}
          </button>
          <div className="filter-dropdown">
            <div
              className="filter-option"
              onClick={() => handleFilterChange("sortBy", "date-desc")}
            >
              Date (Newest)
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("sortBy", "date-asc")}
            >
              Date (Oldest)
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("sortBy", "amount-desc")}
            >
              Amount (Highest)
            </div>
            <div
              className="filter-option"
              onClick={() => handleFilterChange("sortBy", "amount-asc")}
            >
              Amount (Lowest)
            </div>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="card text-center">
          <p>
            No transactions found. Try adjusting your filters or add a new
            transaction.
          </p>
          <button
            className="btn-primary mt-4"
            onClick={() => setShowAddModal(true)}
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>
                  <span
                    className={`flex items-center gap-1 ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <FiArrowUp />
                    ) : (
                      <FiArrowDown />
                    )}
                    {transaction.type === "income" ? "Income" : "Expense"}
                  </span>
                </td>
                <td
                  className={
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
                <td>
                  <div className="transaction-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(transaction)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(transaction)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <TransactionModal
          transaction={currentTransaction}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Transactions;
