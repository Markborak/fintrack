import React from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";
import { FiArrowUp, FiArrowDown, FiPlus, FiArrowRight } from "react-icons/fi";
import TransactionModal from "../components/TransactionModal";

const Dashboard = () => {
  const { transactions, stats, loading } = useTransactions();
  const [showModal, setShowModal] = React.useState(false);

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

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
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Current Balance</div>
          <div className="stat-value">{formatCurrency(stats.balance)}</div>
          <div
            className={`stat-change ${
              stats.balance >= 0 ? "positive" : "negative"
            }`}
          >
            {stats.balance >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs((stats.balance / (stats.totalIncome || 1)) * 100).toFixed(
              1
            )}
            % of total income
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Monthly Income</div>
          <div className="stat-value">
            {formatCurrency(stats.monthlyIncome)}
          </div>
          <div className="stat-change positive">
            <FiArrowUp />
            {((stats.monthlyIncome / (stats.totalIncome || 1)) * 100).toFixed(
              1
            )}
            % of total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Monthly Expenses</div>
          <div className="stat-value">
            {formatCurrency(stats.monthlyExpenses)}
          </div>
          <div className="stat-change negative">
            <FiArrowDown />
            {(
              (stats.monthlyExpenses / (stats.totalExpenses || 1)) *
              100
            ).toFixed(1)}
            % of total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Savings Rate</div>
          <div className="stat-value">
            {stats.monthlyIncome
              ? (
                  (1 - stats.monthlyExpenses / stats.monthlyIncome) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
          <div
            className={`stat-change ${
              stats.monthlyIncome > stats.monthlyExpenses
                ? "positive"
                : "negative"
            }`}
          >
            {stats.monthlyIncome > stats.monthlyExpenses ? (
              <FiArrowUp />
            ) : (
              <FiArrowDown />
            )}
            Monthly savings
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="flex gap-2">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowModal(true)}
            >
              <FiPlus /> Add Transaction
            </button>
            <Link
              to="/transactions"
              className="btn-outline flex items-center gap-2"
            >
              View All <FiArrowRight />
            </Link>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="card text-center">
            <p>
              No transactions yet. Add your first transaction to get started!
            </p>
            <button
              className="btn-primary mt-4"
              onClick={() => setShowModal(true)}
            >
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="transaction-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="transaction-item">
                <div className={`transaction-icon ${transaction.type}`}>
                  {transaction.type === "income" ? (
                    <FiArrowUp />
                  ) : (
                    <FiArrowDown />
                  )}
                </div>
                <div className="transaction-details">
                  <div className="transaction-title">
                    {transaction.description}
                  </div>
                  <div className="transaction-category">
                    {transaction.category}
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="transaction-date">
                  {formatDate(transaction.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
