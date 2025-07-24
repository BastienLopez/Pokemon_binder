import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>🃏 Pokémon TCG Binder</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Accueil</Link>
            
            {isAuthenticated ? (
              <>
                <Link to={`/cartes?id=${user?.id}`} className="nav-link">Cartes</Link>
                <Link to={`/mes-cartes?id=${user?.id}`} className="nav-link">Mes Cartes</Link>
                <div className="user-menu">
                  <span className="user-name">👋 {user?.username}</span>
                  <button onClick={handleLogout} className="btn btn-logout">
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="auth-links">
                  <Link to="/login" className="nav-link">Connexion</Link>
                  <Link to="/signup" className="btn btn-signup">Inscription</Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
