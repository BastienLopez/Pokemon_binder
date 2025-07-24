import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserCardsService from '../services/userCardsService';
import TCGdexService from '../services/tcgdexService';
import ConfirmModal from '../components/ConfirmModal';
import './MyCards.css';

const MyCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [binderSize, setBinderSize] = useState('4x4');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    condition: 'Near Mint'
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  const conditions = [
    'Mint',
    'Near Mint',
    'Excellent',
    'Good',
    'Light Played',
    'Played',
    'Poor'
  ];

  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  const fetchUserCards = async () => {
    try {
      setLoading(true);
      const userCards = await UserCardsService.getUserCards();
      setCards(userCards);
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setEditForm({
      quantity: card.quantity,
      condition: card.condition
    });
    setShowEditModal(true);
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      await UserCardsService.updateUserCard(selectedCard.id, editForm);
      setShowEditModal(false);
      setSelectedCard(null);
      await fetchUserCards();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteCard = (card) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer la carte',
      message: `Êtes-vous sûr de vouloir supprimer "${card.card_name}" de votre collection ?`,
      type: 'danger',
      onConfirm: () => confirmDeleteCard(card.id)
    });
  };

  const confirmDeleteCard = async (cardId) => {
    try {
      await UserCardsService.deleteUserCard(cardId);
      await fetchUserCards();
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const getTotalCards = () => {
    return cards.reduce((total, card) => total + card.quantity, 0);
  };

  const getUniqueCards = () => {
    return cards.length;
  };

  const getCardImageUrl = (card) => {
    // Priorité à l'image stockée depuis TCGdx
    if (card.card_image && card.card_image !== '/placeholder-card.png') {
      // Utiliser le service TCGdx pour la haute qualité
      return TCGdexService.getHighQualityImageUrl({ image: card.card_image });
    }
    
    // Fallback : image par défaut
    return '/placeholder-card.png';
  };

  const getGridClass = () => {
    switch(binderSize) {
      case '3x3': return 'grid-3x3';
      case '4x4': return 'grid-4x4';  
      case '5x5': return 'grid-5x5';
      default: return 'grid-4x4';
    }
  };

  if (loading) {
    return (
      <div className="my-cards-container">
        <div className="loading">
          <p>Chargement de votre collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-cards-container">
      <div className="my-cards-header">
        <h1>Mes Cartes</h1>
        <p>Bienvenue {user?.username} ! Voici votre collection personnelle.</p>
        
        {/* Sélecteur de taille de grille */}
        <div className="binder-controls">
          <label htmlFor="binder-size">Taille du Binder :</label>
          <select 
            id="binder-size"
            value={binderSize} 
            onChange={(e) => setBinderSize(e.target.value)}
          >
            <option value="3x3">3x3 (9 cartes par page)</option>
            <option value="4x4">4x4 (16 cartes par page)</option>
            <option value="5x5">5x5 (25 cartes par page)</option>
          </select>
        </div>
        
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-number">{getTotalCards()}</span>
            <span className="stat-label">Cartes au total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getUniqueCards()}</span>
            <span className="stat-label">Cartes uniques</span>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-collection">
          <h3>Votre collection est vide</h3>
          <p>Commencez par ajouter des cartes depuis la page &ldquo;Listing des Cartes&rdquo;</p>
          <p>Un bouton &ldquo;Ajouter à ma collection&rdquo; apparaîtra sur chaque carte.</p>
        </div>
      ) : (
        <div className={`cards-grid ${getGridClass()}`} key={binderSize}>
          {cards.map(card => (
            <div key={card.id} className="user-card-item">
              <div className="card-image-container">
                <img 
                  src={getCardImageUrl(card)} 
                  alt={card.card_name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder-card.png';
                    e.target.alt = 'Image non disponible';
                  }}
                />
                <div className="quantity-badge">{card.quantity}x</div>
              </div>
              
              <div className="card-info">
                <h4>{card.card_name}</h4>
                {card.local_id && <p className="card-number">#{card.local_id}</p>}
                <p className="set-name">{card.set_name}</p>
                {card.rarity && <p className="rarity">Rareté: {card.rarity}</p>}
                <p className="condition">État: {card.condition}</p>
                
                <div className="card-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditCard(card)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteCard(card)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier la carte</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateCard}>
              <div className="form-group">
                <label htmlFor="card-name">Carte :</label>
                <input 
                  type="text" 
                  id="card-name"
                  value={selectedCard.card_name} 
                  disabled 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantité :</label>
                <input 
                  type="number" 
                  id="quantity"
                  min="1" 
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="condition">État :</label>
                <select 
                  id="condition"
                  value={editForm.condition}
                  onChange={(e) => setEditForm({...editForm, condition: e.target.value})}
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Sauvegarder
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
};

export default MyCards;
