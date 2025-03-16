import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/transactions":
        return "Transactions";
      case "/budget":
        return "Budget";
      case "/analytics":
        return "Analytics";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "active" : "w-8"}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            FinTrack
          </Link>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-nav-item ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiHome /> Dashboard
          </Link>
          <Link
            to="/transactions"
            className={`sidebar-nav-item ${
              location.pathname === "/transactions" ? "active" : ""
            }`}
          >
            <FiDollarSign /> Transactions
          </Link>
          <Link
            to="/budget"
            className={`sidebar-nav-item ${
              location.pathname === "/budget" ? "active" : ""
            }`}
          >
            <FiPieChart /> Budget
          </Link>
          <Link
            to="/analytics"
            className={`sidebar-nav-item ${
              location.pathname === "/analytics" ? "active" : ""
            }`}
          >
            <FiBarChart2 /> Analytics
          </Link>
          <Link
            to="/settings"
            className={`sidebar-nav-item ${
              location.pathname === "/settings" ? "active" : ""
            }`}
          >
            <FiSettings /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div className="flex items-center">
            <button
              className="btn-outline mr-4 md:hidden"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          <div className="user-menu">
            <button className="user-menu-button" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {user && getInitials(user.name)}
              </div>
              <span className="hidden md:block">{user && user.name}</span>
            </button>
            <div
              className={`user-menu-dropdown ${userMenuOpen ? "active" : ""}`}
            >
              <Link to="/settings" className="user-menu-item">
                <FiUser className="mr-2" /> Profile
              </Link>
              <button className="user-menu-item logout" onClick={handleLogout}>
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
