import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MyCardsSimple from './MyCardsSimple';
import MyBinders from './MyBinders';
import Cards from './Cards';
import UserCardsService from '../services/userCardsService';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [cardsCount, setCardsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCardsCount();
    }
  }, [user]);

  const fetchCardsCount = async () => {
    try {
      const userCards = await UserCardsService.getUserCards();
      const totalCards = userCards.reduce((total, card) => total + card.quantity, 0);
      setCardsCount(totalCards);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de cartes:', error);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="profile-section">
            <h2>Mon Profil</h2>
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-avatar">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="profile-details">
                  <h3>{user.username}</h3>
                  <p className="profile-email">{user.email}</p>
                  {user.full_name && <p className="profile-fullname">{user.full_name}</p>}
                  <p className="profile-joined">
                    Membre depuis : {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-number">{cardsCount}</div>
                  <div className="stat-label">Cartes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Binders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Collections</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cards':
        return <MyCardsSimple />;
      case 'listing':
        return <Cards showHeader={false} />;
      case 'binders':
        return <MyBinders />;
      default:
        return null;
    }
  };

  return (
    <div className="user-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Pokémon TCG Binder</h2>
          <div className="user-info">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="username">{user.username}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <span className="nav-icon">👤</span>
            Mon Profil
          </button>
          
          <button
            className={`nav-item ${activeSection === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveSection('cards')}
          >
            <span className="nav-icon">🃏</span>
            Mes Cartes
          </button>
          
          <button
            className={`nav-item ${activeSection === 'listing' ? 'active' : ''}`}
            onClick={() => setActiveSection('listing')}
          >
            <span className="nav-icon">📋</span>
            Listing des Cartes
          </button>
          
          <button
            className={`nav-item ${activeSection === 'binders' ? 'active' : ''}`}
            onClick={() => setActiveSection('binders')}
          >
            <span className="nav-icon">📂</span>
            Mes Binders
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
