import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  { key: 'twitter', label: 'Twitter', placeholder: '@AshKetchum', icon: '\u{1F426}' },
  { key: 'instagram', label: 'Instagram', placeholder: '@ash_trainer', icon: '\u{1F4F8}' },
  { key: 'youtube', label: 'YouTube', placeholder: 'Chaine / pseudo', icon: '\u{25B6}\u{FE0F}' },
  { key: 'twitch', label: 'Twitch', placeholder: 'streamer', icon: '\u{1F3AE}' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@pokecards', icon: '\u{1F3B5}' }
];

const UserDashboard = () => {
  const { user } = useAuth();

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

  const loadUserCards = useCallback(async () => {
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
  }, [favoriteCardId]);

  const loadBinders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (user) {
      loadUserCards();
      loadBinders();
    }
  }, [user, loadUserCards, loadBinders]);

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
      setProfileShareMessage('Lien copie dans le presse-papier !');
      setTimeout(() => setProfileShareMessage(''), 2500);
    } catch (error) {
      console.error('Erreur lors de la copie du lien:', error);
      setProfileShareMessage('Impossible de copier le lien');
    }
  };

  const profileUrl = useMemo(() => {
    const basePath = process.env.PUBLIC_URL || '';
    if (typeof window === 'undefined') {
      return `${basePath}/user`;
    }
    return `${window.location.origin}${basePath}/user`;
  }, []);

  const favoriteCard = useMemo(() => {
    if (!userCardsData.length || !favoriteCardId) return null;
    return userCardsData.find((card) => String(card.id || card._id) === String(favoriteCardId));
  }, [favoriteCardId, userCardsData]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
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
            <span>Valeur estimee</span>
            <strong>{formatEuro(collectionValue)}</strong>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <h3>Resume global</h3>
          <p>
            Vous gerez {userCardsData.length} cartes uniques reparties dans {binderStats.total} binder(s).
            {binderStats.publicCount > 0 && ` ${binderStats.publicCount} binder(s) sont publics.`}
          </p>
          <ul>
            <li>Total de cartes : {userCardsData.reduce((sum, card) => sum + (card.quantity || 0), 0)}</li>
            <li>Cartes dans des binders : {binderStats.cards}</li>
            <li>Valeur estimee : {formatEuro(collectionValue)}</li>
          </ul>
        </div>

        <div className="profile-panel">
          <div className="panel-header">
            <div>
              <h3>Style & reseaux</h3>
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
            <p>Ajoute des cartes a ta collection pour selectionner un favori.</p>
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
                      if (favoriteCard.card_image && !favoriteCard.card_image.includes('data:image')) {
                        if (favoriteCard.card_image.includes('assets.tcgdex.net') && !favoriteCard.card_image.endsWith('.webp')) {
                          return `${favoriteCard.card_image}/high.webp`;
                        }
                        return favoriteCard.card_image;
                      }

                      if (favoriteCard.card_id) {
                        const [setId, number] = favoriteCard.card_id.split('-');
                        if (setId && number) {
                          const serie = setId.replace(/[0-9]+$/, '') || setId;
                          return `https://assets.tcgdex.net/fr/${serie}/${setId}/${number}/high.webp`;
                        }
                      }

                      return PLACEHOLDER_IMAGE;
                    })()}
                    alt={favoriteCard.card_name || 'Carte'}
                    onError={(event) => {
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
};

export default UserDashboard;
