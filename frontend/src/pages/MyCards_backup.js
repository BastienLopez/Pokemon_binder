import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import UserCardsService from '../services/userCardsService';
import TCGdexService from '../services/tcgdxService';
import binderService from '../services/binderService';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import './MyCards.css'; useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import UserCardsService from '../services/userCardsService';
import TCGdexService from '../services/tcgdexService';
import binderService from '../services/binderService';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import './MyCards.css';eact, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import UserCardsService from '../services/userCardsService';
import TCGdexService from '../services/tcgdexService';
import binderService from '../services/binderService';
import ConfirmModal from '../components/ConfirmModal';
import './MyCards.css';

const MyCards = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    name: '',
    setName: ''
  });

  // États pour le mode binder
  const [binderMode, setBinderMode] = useState(false);
  const [targetBinderId, setTargetBinderId] = useState(null);
  const [targetBinder, setTargetBinder] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [addingToBinderLoading, setAddingToBinderLoading] = useState(false);

  // État pour les notifications toast
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
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

  // Détecter si on vient d'un binder
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const binderId = searchParams.get('id_binder');
    const userId = searchParams.get('user_id');
    
    // Console logs pour déboguer
    console.log('🎯 MyCards - Paramètres URL détectés:');
    console.log('🆔 Binder ID depuis URL:', binderId);
    console.log('👤 User ID depuis URL:', userId);
    console.log('👤 User ID depuis contexte:', user?.id);
    console.log('🔗 URL complète:', location.search);
    
    if (binderId) {
      console.log('✅ Mode binder activé pour le binder:', binderId);
      setTargetBinderId(binderId);
      setBinderMode(true);
      fetchTargetBinder(binderId);
    } else {
      console.log('❌ Aucun ID de binder trouvé dans l\'URL');
    }
  }, [location.search, user]);

  const fetchTargetBinder = async (binderId) => {
    try {
      console.log('🔍 Tentative de récupération du binder avec ID:', binderId);
      const binder = await binderService.getBinderById(binderId);
      console.log('✅ Binder récupéré avec succès:', binder);
      setTargetBinder(binder);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du binder:', error);
      console.log('🆔 ID du binder qui a échoué:', binderId);
      // Afficher une erreur et revenir au mode normal
      setConfirmModal({
        isOpen: true,
        title: 'Erreur',
        message: `Le binder avec l'ID ${binderId} n'existe pas ou n'est plus accessible. Vous êtes maintenant en mode collection normale.`,
        type: 'danger',
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          // Revenir au mode normal
          setBinderMode(false);
          setTargetBinderId(null);
          setTargetBinder(null);
          // Nettoyer l'URL
          navigate('/mes-cartes');
        }
      });
    }
  };

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

  // Fonction pour afficher les notifications toast
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Auto-hide après 4 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const getTotalCards = () => {
    const filteredCards = getFilteredCards();
    return filteredCards.reduce((total, card) => total + card.quantity, 0);
  };

  const getUniqueCards = () => {
    return getFilteredCards().length;
  };

  const getCardImageUrl = (card) => {
    // Priorité à l'image stockée depuis TCGdex
    if (card.card_image && card.card_image !== '/placeholder-card.png') {
      // Utiliser le service TCGdex pour la haute qualité
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

  // Fonction de filtrage des cartes
  const getFilteredCards = () => {
    return cards.filter(card => {
      const matchesName = !filters.name || 
        card.card_name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesSet = !filters.setName || 
        card.set_name.toLowerCase().includes(filters.setName.toLowerCase());
      
      return matchesName && matchesSet;
    });
  };

  // Obtenir la liste unique des extensions pour le filtre
  const getUniqueSetNames = () => {
    const setNames = cards.map(card => card.set_name).filter(Boolean);
    return [...new Set(setNames)].sort();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Fonctions pour le mode binder
  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      const isSelected = prev.find(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const addSelectedCardsToBinder = async () => {
    if (selectedCards.length === 0) {
      alert('Veuillez sélectionner au moins une carte');
      return;
    }

    // Vérifier qu'on est vraiment en mode binder avec un binder valide
    if (!binderMode || !targetBinderId || !targetBinder) {
      alert('Erreur: Mode binder non actif ou binder invalide. Veuillez sélectionner un binder valide.');
      return;
    }

    console.log('🎯 Début de l\'ajout des cartes au binder');
    console.log('🆔 Target Binder ID:', targetBinderId);
    console.log('📝 Target Binder:', targetBinder);
    console.log('🃏 Cartes sélectionnées:', selectedCards.length);
    console.log('👤 User actuel:', user?.id);

    setAddingToBinderLoading(true);
    
    try {
      // Ajouter chaque carte sélectionnée au binder
      for (const card of selectedCards) {
        const cardData = {
          user_card_id: card.id,
          card_id: card.card_id,
          card_name: card.card_name,
          card_image: card.card_image,
          set_name: card.set_name,
          local_id: card.local_id,
          rarity: card.rarity,
          quantity: 1 // Par défaut, ajouter 1 carte
        };
        
        await binderService.addCardToBinder(targetBinderId, cardData);
      }

      // Afficher un message de succès avec notification toast
      console.log('✅ Cartes ajoutées avec succès au binder');
      showNotification(
        `🎉 ${selectedCards.length} carte(s) ajoutée(s) au binder "${targetBinder?.name || 'Inconnu'}" avec succès !`, 
        'success'
      );

      // Réinitialiser la sélection
      setSelectedCards([]);
      
      // Optionnel : retourner automatiquement au binder après quelques secondes
      setTimeout(() => {
        console.log('🔄 Retour automatique au binder:', targetBinderId);
        navigate(`/binder/${targetBinderId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout des cartes au binder:', error);
      
      let errorMessage = 'Erreur lors de l\'ajout des cartes au binder.';
      
      // Personnaliser le message selon le type d'erreur
      if (error.message && error.message.includes('404')) {
        errorMessage = 'Le binder n\'existe plus ou n\'est plus accessible. Veuillez sélectionner un autre binder.';
        // Nettoyer l'état du binder mode
        setBinderMode(false);
        setTargetBinderId(null);
        setTargetBinder(null);
      } else if (error.message && error.message.includes('403')) {
        errorMessage = 'Vous n\'avez pas l\'autorisation d\'ajouter des cartes à ce binder.';
      } else {
        errorMessage = 'Erreur lors de l\'ajout des cartes au binder. Veuillez réessayer.';
      }
      
      setConfirmModal({
        isOpen: true,
        title: 'Erreur',
        message: errorMessage,
        type: 'danger',
        onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false })
      });
    } finally {
      setAddingToBinderLoading(false);
    }
  };

  const cancelBinderMode = () => {
    setBinderMode(false);
    setTargetBinderId(null);
    setTargetBinder(null);
    setSelectedCards([]);
    // Retirer le paramètre ID de l'URL
    navigate('/mes-cartes');
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
        {binderMode && targetBinder ? (
          <div className="binder-mode-header">
            <h2>🎯 Mode Ajout au Binder - "{targetBinder.name}"</h2>
            <div className="binder-mode-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate(`/binder/${targetBinderId}`)}
              >
                ← Retour au binder
              </button>
              <button 
                className="btn-secondary"
                onClick={cancelBinderMode}
              >
                Annuler et retour à mes cartes
              </button>
            </div>
            {selectedCards.length > 0 && (
              <p className="selection-info">
                {selectedCards.length} carte(s) sélectionnée(s)
              </p>
            )}
          </div>
        ) : (
          <p>Bienvenue {user?.username} ! Voici votre collection personnelle.</p>
        )}
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-number">{getTotalCards()}</span>
            <span className="stat-label">
              Cartes affichées
              {(filters.name || filters.setName) && ` / ${cards.reduce((total, card) => total + card.quantity, 0)} total`}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getUniqueCards()}</span>
            <span className="stat-label">
              Cartes uniques
              {(filters.name || filters.setName) && ` / ${cards.length} total`}
            </span>
          </div>
        </div>

        {/* Filtres */}
        <div className="filters-section">
          <h3>Filtres</h3>
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="name-filter">Nom :</label>
              <input
                type="text"
                id="name-filter"
                placeholder="Rechercher par nom..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="set-filter">Série / Extension :</label>
              <select
                id="set-filter"
                value={filters.setName}
                onChange={(e) => handleFilterChange('setName', e.target.value)}
              >
                <option value="">Toutes les extensions</option>
                {getUniqueSetNames().map(setName => (
                  <option key={setName} value={setName}>
                    {setName}
                  </option>
                ))}
              </select>
            </div>
            {/* Sélecteur de taille de grille */}
        <div className="filter-group">
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
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-collection">
          <h3>Votre collection est vide</h3>
          <p>Commencez par ajouter des cartes depuis la page &ldquo;Listing des Cartes&rdquo;</p>
          <p>Un bouton &ldquo;Ajouter à ma collection&rdquo; apparaîtra sur chaque carte.</p>
        </div>
      ) : getFilteredCards().length === 0 ? (
        <div className="empty-collection">
          <h3>Aucune carte trouvée</h3>
          <p>Aucune carte ne correspond aux filtres sélectionnés.</p>
          <p>Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className={`cards-grid ${getGridClass()}`} key={binderSize}>
          {getFilteredCards().map(card => {
            const isSelected = binderMode && selectedCards.find(c => c.id === card.id);
            return (
              <div 
                key={card.id} 
                className={`user-card-item ${binderMode ? 'binder-mode' : ''} ${isSelected ? 'selected' : ''}`}
              >
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
                  {binderMode && (
                    <div className={`selection-badge ${isSelected ? 'selected' : ''}`}>
                      {isSelected ? '✓' : '+'}
                    </div>
                  )}
                </div>
                
                <div className="card-info">
                  <div className="card-content">
                    <h4>{card.card_name}</h4>
                    <p className="set-name">{card.set_name}</p>
                    {card.rarity && <p className="rarity">Rareté: {card.rarity}</p>}
                    <p className="condition">État: {card.condition}</p>
                  </div>
                  
                  <div className="card-actions">
                    {binderMode ? (
                      <button 
                        className={`btn-select ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCardSelection(card)}
                      >
                        {isSelected ? 'Désélectionner' : 'Sélectionner'}
                      </button>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Bouton flottant de validation en mode binder */}
      {binderMode && targetBinder && selectedCards.length > 0 && (
        <div className="floating-validation-button">
          <button 
            className="btn-validate-selection"
            onClick={addSelectedCardsToBinder}
            disabled={addingToBinderLoading}
          >
            {addingToBinderLoading ? (
              <>
                <span className="loading-spinner"></span>
                Ajout en cours...
              </>
            ) : (
              <>
                ✓ Ajouter {selectedCards.length} carte(s) au binder
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCards;
