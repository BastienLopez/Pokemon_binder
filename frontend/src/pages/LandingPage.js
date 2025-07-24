import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();

  // Si l'utilisateur est connecté, rediriger vers la page User
  if (user) {
    window.location.href = '/user';
    return null;
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Pokémon TCG Binder
          </h1>
          <p className="hero-subtitle">
            Organisez et gérez votre collection de cartes Pokémon comme un pro
          </p>
          <p className="hero-description">
            Créez vos classeurs virtuels, ajoutez vos cartes, et gardez une trace 
            de votre collection Pokémon TCG en toute simplicité.
          </p>
          
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-large">
              Créer un compte
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Se connecter
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="card-stack">
            <div className="pokemon-card card-1">🃏</div>
            <div className="pokemon-card card-2">🎴</div>
            <div className="pokemon-card card-3">🂠</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Mes Cartes</h3>
            <p>Gérez votre collection personnelle de cartes Pokémon TCG</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📂</div>
            <h3>Mes Binders</h3>
            <p>Créez et organisez vos classeurs virtuels personnalisés</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Recherche</h3>
            <p>Trouvez facilement les cartes dans votre collection</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Prêt à commencer ?</h2>
        <p>Rejoignez la communauté et organisez votre collection dès aujourd&apos;hui</p>
        <Link to="/signup" className="btn btn-primary btn-large">
          Commencer maintenant
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
