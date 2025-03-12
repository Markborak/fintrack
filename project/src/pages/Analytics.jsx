import React, { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { transactions, getMonthlyData, getTransactionsByCategory, loading } =
    useTransactions();
  const [timeframe, setTimeframe] = useState("year");

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  // Get monthly data for charts
  const monthlyData = getMonthlyData();

  // Get expense data by category for pie chart
  const getCategoryData = () => {
    const categoryTotals = getTransactionsByCategory();

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#10b981", // green
            "#3b82f6", // blue
            "#f59e0b", // amber
            "#ef4444", // red
            "#8b5cf6", // purple
            "#ec4899", // pink
            "#06b6d4", // cyan
            "#f97316", // orange
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Get income vs expense data for line chart
  const getIncomeVsExpenseData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();

      if (transaction.type === "income") {
        incomeData[month] += transaction.amount;
      } else {
        expenseData[month] += transaction.amount;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Income & Expenses",
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Expenses by Category",
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Income vs Expenses Trend",
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="transactions-header">
        <h2 className="section-title">Financial Analytics</h2>
        <div className="chart-filters">
          <button
            className={`btn ${
              timeframe === "month" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setTimeframe("month")}
          >
            Month
          </button>
          <button
            className={`btn ${
              timeframe === "quarter" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setTimeframe("quarter")}
          >
            Quarter
          </button>
          <button
            className={`btn ${
              timeframe === "year" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setTimeframe("year")}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Income vs Expenses</h3>
          </div>
          <Bar data={monthlyData} options={barOptions} />
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Spending by Category</h3>
          </div>
          <Pie data={getCategoryData()} options={pieOptions} />
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Financial Trend</h3>
        </div>
        <Line data={getIncomeVsExpenseData()} options={lineOptions} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Top Expense Category</h3>
          <p className="text-2xl font-bold text-red-500">
            {Object.entries(getTransactionsByCategory()).sort(
              (a, b) => b[1] - a[1]
            )[0]?.[0] || "N/A"}
          </p>
          <p className="text-gray-500">
            {formatCurrency(
              Object.entries(getTransactionsByCategory()).sort(
                (a, b) => b[1] - a[1]
              )[0]?.[1] || 0
            )}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">
            Average Monthly Expense
          </h3>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(
              transactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0) / 12
            )}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Savings Rate</h3>
          <p className="text-2xl font-bold text-green-500">
            {(() => {
              const income = transactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);

              const expenses = transactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);

              return income
                ? `${Math.round((1 - expenses / income) * 100)}%`
                : "N/A";
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
