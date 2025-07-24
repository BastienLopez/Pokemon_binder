import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MyCards from './MyCards';
import MyBinders from './MyBinders';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

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
                  <div className="stat-number">0</div>
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
        return <MyCards />;
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
