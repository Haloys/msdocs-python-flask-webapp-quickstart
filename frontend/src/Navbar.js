import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout, isAdmin }) {
  return (
    <header className="header">
      <div className="navbar-container">
        {/* Logo */}
        <img src="/logo.png" alt="Logo" className="navbar-logo" />
        <nav className="navbar-links">
          {/* Dashboard link */}
          <Link to="/" className="navbar-link">Dashboard</Link>
          {/* Status link */}
          <Link to="/status" className="navbar-link">Status</Link>
          {/* DB Access link */}
          <a href="https://portal.azure.com/" className="navbar-link" target="_blank" rel="noopener noreferrer">DB Access</a>
          {/* Admin link (only shown if user is an admin) */}
          {isAdmin && <Link to="/admin" className="navbar-link">Admin</Link>}
        </nav>
      </div>
      {/* Logout button */}
      <button className="logout-button" onClick={onLogout}>Logout</button>
    </header>
  );
}

export default Navbar;
