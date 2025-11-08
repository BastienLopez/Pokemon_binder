import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import MyCardsSimple from './MyCardsSimple';
import MyBinders from './MyBinders';
import Cards from './Cards';
import UserCardsService from '../services/userCardsService';
import binderService from '../services/binderService';
import { estimateCardValue, formatEuro } from '../utils/value';
import './UserDashboard.css';
import { PLACEHOLDER_IMAGE } from '../utils/assets';

const DEFAULT_SOCIAL_LINKS = {
  twitter: '',
  instagram: '',
  youtube: '',
  twitch: '',
  tiktok: ''
};

const COLOR_OPTIONS = ['#6c5ce7', '#e84393', '#00b894', '#0984e3', '#f0932b'];

const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'Twitter', placeholder: '@AshKetchum', icon: '🐦' },
  { key: 'instagram', label: 'Instagram', placeholder: '@ash_trainer', icon: '📸' },
  { key: 'youtube', label: 'YouTube', placeholder: 'Chaîne / pseudo', icon: '▶️' },
  { key: 'twitch', label: 'Twitch', placeholder: 'streamer', icon: '🎮' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@pokecards', icon: '🎵' }
];

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profile');
  const [userCardsData, setUserCardsData] = useState([]);
  const [collectionValue, setCollectionValue] = useState(0);
  const [binderStats, setBinderStats] = useState({ total: 0, cards: 0, publicCount: 0 });
  const [profileColor, setProfileColor] = useState(
    () => localStorage.getItem('pb_profile_color') || '#6c5ce7'
  );
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_social_links')) || DEFAULT_SOCIAL_LINKS;
    } catch (error) {
      return DEFAULT_SOCIAL_LINKS;
    }
  });
  const [favoriteCardId, setFavoriteCardId] = useState(
    () => localStorage.getItem('pb_favorite_card') || ''
  );
  const [profileShareMessage, setProfileShareMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadUserCards();
      loadBinders();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pb_profile_color', profileColor);
  }, [profileColor]);

  useEffect(() => {
    localStorage.setItem('pb_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  useEffect(() => {
    if (favoriteCardId) {
      localStorage.setItem('pb_favorite_card', favoriteCardId);
    }
  }, [favoriteCardId]);

  const loadUserCards = async () => {
    try {
      const cards = await UserCardsService.getUserCards();
      setUserCardsData(cards);
      const totalValue = cards.reduce((sum, card) => sum + estimateCardValue(card), 0);
      setCollectionValue(Number(totalValue.toFixed(2)));
      if (!favoriteCardId && cards.length) {
        setFavoriteCardId(cards[0].id || cards[0]._id || cards[0].card_id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error);
    }
  };

  const loadBinders = async () => {
    try {
      const binders = await binderService.getUserBinders();
      const totalCards = binders.reduce((sum, binder) => sum + (binder.total_cards || 0), 0);
      const publicCount = binders.filter((binder) => binder.is_public).length;
      setBinderStats({
        total: binders.length,
        cards: totalCards,
        publicCount
      });
    } catch (error) {
      console.error('Erreur lors du chargement des binders:', error);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleColorSelection = (color) => {
    setProfileColor(color);
  };

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value
    }));
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setProfileShareMessage('Lien copié dans le presse-papier ✅');
      setTimeout(() => setProfileShareMessage(''), 2500);
    } catch (error) {
      console.error('Erreur lors de la copie du lien:', error);
      setProfileShareMessage('Impossible de copier le lien');
    }
  };
  // Hooks must be called unconditionally and in the same order on every render.
  // We compute values here before any conditional return so ESLint rule-of-hooks is satisfied.
  const profileUrl = useMemo(() => {
    if (!user) return '';
    const basePath = process.env.PUBLIC_URL || '';
    return `${window.location.origin}${basePath}/user?id=${user.id}`;
  }, [user]);

  const favoriteCard = useMemo(() => {
    if (!userCardsData.length || !favoriteCardId) return null;
    // Le favoriteCardId stocke l'id du document MongoDB
    return userCardsData.find((card) => String(card.id || card._id) === String(favoriteCardId));
  }, [favoriteCardId, userCardsData]);

  // Early return must come AFTER hooks so hooks order is preserved
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderProfileSection = () => (
    <div className="profile-section">
      <div className="profile-header" style={{ borderColor: profileColor }}>
        <div className="profile-info">
          <div className="profile-avatar" style={{ background: profileColor }}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2>{user.username}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-joined">
              Membre depuis : {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="profile-summary">
          <div className="summary-card">
            <span>Cartes dans la collection</span>
            <strong>{userCardsData.reduce((sum, card) => sum + (card.quantity || 0), 0)}</strong>
          </div>
          <div className="summary-card">
            <span>Binders</span>
            <strong>{binderStats.total}</strong>
          </div>
          <div className="summary-card">
            <span>Valeur estimée</span>
            <strong>{formatEuro(collectionValue)}</strong>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <h3>Résumé global</h3>
          <p>
            Vous gérez {userCardsData.length} cartes uniques réparties dans {binderStats.total} binder(s).
            {binderStats.publicCount > 0 && ` ${binderStats.publicCount} binder(s) sont publics.`}
          </p>
          <ul>
            <li>Total de cartes : {userCardsData.reduce((sum, card) => sum + (card.quantity || 0), 0)}</li>
            <li>Cartes dans des binders : {binderStats.cards}</li>
            <li>Valeur estimée : {formatEuro(collectionValue)}</li>
          </ul>
        </div>

        <div className="profile-panel">
          <div className="panel-header">
            <div>
              <h3>Style & réseaux</h3>
              <p>Personnalisez votre profil et partagez vos liens.</p>
            </div>
          </div>
          <div className="color-picker">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${profileColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelection(color)}
                aria-label={`Choisir la couleur ${color}`}
              />
            ))}
          </div>
          <div className="social-inputs">
            {SOCIAL_PLATFORMS.map((platform) => (
              <label key={platform.key} className="social-input">
                <span className="icon">{platform.icon}</span>
                <input
                  type="text"
                  value={socialLinks[platform.key] || ''}
                  placeholder={platform.placeholder}
                  onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="share-profile">
            <input type="text" value={profileUrl} readOnly />
            <button className="btn btn-secondary" onClick={() => copyToClipboard(profileUrl)}>
              Copier
            </button>
          </div>
          {profileShareMessage && <p className="share-message">{profileShareMessage}</p>}
        </div>

        <div className="profile-panel">
          <h3>Ta carte favorite</h3>
          {userCardsData.length === 0 ? (
            <p>Ajoute des cartes à ta collection pour sélectionner un favori.</p>
          ) : (
            <>
              <select
                value={favoriteCardId}
                onChange={(e) => setFavoriteCardId(e.target.value)}
              >
                {userCardsData.map((card) => {
                  const id = card.id || card.card_id || card._id;
                  return (
                    <option key={id} value={id}>
                      {card.card_name || card.name}
                    </option>
                  );
                })}
              </select>
              {favoriteCard && (
                <div className="favorite-card">
                  <img
                    src={(() => {
                      console.log('Favorite card data:', favoriteCard);
                      
                      // Utiliser card_image si disponible
                      if (favoriteCard.card_image && !favoriteCard.card_image.includes('data:image')) {
                        console.log('Using card_image:', favoriteCard.card_image);
                        
                        // Si c'est une URL TCGdex sans /high.webp, l'ajouter
                        if (favoriteCard.card_image.includes('assets.tcgdex.net') && !favoriteCard.card_image.endsWith('.webp')) {
                          const fixedUrl = `${favoriteCard.card_image}/high.webp`;
                          console.log('Fixed URL:', fixedUrl);
                          return fixedUrl;
                        }
                        
                        return favoriteCard.card_image;
                      }
                      
                      // Construire l'URL depuis card_id si card_image n'existe pas
                      if (favoriteCard.card_id) {
                        console.log('Building URL from card_id:', favoriteCard.card_id);
                        const [setId, number] = favoriteCard.card_id.split('-');
                        if (setId && number) {
                          const serie = setId.replace(/[0-9]+$/, '') || setId;
                          const url = `https://assets.tcgdex.net/fr/${serie}/${setId}/${number}/high.webp`;
                          console.log('Constructed URL:', url);
                          return url;
                        }
                      }
                      
                      console.log('Using placeholder');
                      return PLACEHOLDER_IMAGE;
                    })()}
                    alt={favoriteCard.card_name || 'Carte'}
                    onError={(event) => {
                      console.error('Image load error for:', event.target.src);
                      event.target.src = PLACEHOLDER_IMAGE;
                      event.target.alt = 'Image non disponible';
                    }}
                  />
                  <div>
                    <h4>{favoriteCard.card_name || favoriteCard.name}</h4>
                    <p>{favoriteCard.set_name || 'Set inconnu'}</p>
                    {favoriteCard.rarity && <p>{favoriteCard.rarity}</p>}
                    <p>{formatEuro(estimateCardValue(favoriteCard))}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
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
            <span className="nav-icon" aria-hidden="true">{'\u{1F4D1}'}</span>
            Mon Profil
          </button>
          <button
            className={`nav-item ${activeSection === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveSection('cards')}
          >
            <span className="nav-icon" aria-hidden="true">{'\u{1F0CF}'}</span>
            Mes Cartes
          </button>
          <button
            className={`nav-item ${activeSection === 'listing' ? 'active' : ''}`}
            onClick={() => setActiveSection('listing')}
          >
            <span className="nav-icon" aria-hidden="true">{'\u{1F4DC}'}</span>
            Listing des Cartes
          </button>
          <button
            className={`nav-item ${activeSection === 'binders' ? 'active' : ''}`}
            onClick={() => setActiveSection('binders')}
          >
            <span className="nav-icon" aria-hidden="true">{'\u{1F4DA}'}</span>
            Mes Binders
          </button>
          <button
            className="nav-item"
            onClick={() => navigate('/deck-builder')}
          >
            <span className="nav-icon" aria-hidden="true">{'\u{1F3B4}'}</span>
            Créer un deck
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon" aria-hidden="true">{'\u{1F6AA}'}</span>
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
