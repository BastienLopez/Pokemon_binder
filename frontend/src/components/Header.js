import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>🃏 Pokémon TCG Binder</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/cartes" className="nav-link">Cartes</Link>
            <Link to="/mes-cartes" className="nav-link">Mes Cartes</Link>
            {/* Ces liens seront ajoutés en Phase 2 */}
            <div className="auth-links">
              <span className="nav-link disabled">Connexion</span>
              <span className="nav-link disabled">Inscription</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
