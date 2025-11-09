import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardLayout.css';

const NAV_ITEMS = [
  {
    label: 'Mon Profil',
    path: '/user',
    icon: '\u{1F4D1}',
  },
  {
    label: 'Mes Cartes',
    path: '/mes-cartes',
    icon: '\u{1F0CF}',
  },
  {
    label: 'Listing des Cartes',
    path: '/listing',
    icon: '\u{1F4DC}',
  },
  {
    label: 'Mes Binders',
    path: '/mes-binders',
    icon: '\u{1F4DA}',
    match: (pathname) => pathname === '/mes-binders' || pathname.startsWith('/binder/'),
  },
  {
    label: 'Créer un deck',
    path: '/deck-builder',
    icon: '\u{1F3B4}',
  },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (item) => {
    if (item.match) {
      return item.match(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="user-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Pokémon TCG Binder</h2>
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="username">{user?.username || 'Utilisateur'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            <span className="nav-icon" aria-hidden="true">
              {'\u{1F6AA}'}
            </span>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
