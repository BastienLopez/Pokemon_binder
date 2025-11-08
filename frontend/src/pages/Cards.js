import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import TCGdexService from '../services/tcgdexService';
import UserCardsService from '../services/userCardsService';
import Notification from '../components/Notification';
import CardDetailModal from '../components/CardDetailModal';
import CardComparison from '../components/CardComparison';
import useCardComparison from '../hooks/useCardComparison';
import { useAuth } from '../contexts/AuthContext';
import './Cards.css';

const DEFAULT_SERIE_ID = 'base';
const DEFAULT_SET_ID = 'base1';
const DEFAULT_BINDER_SIZE = '5x5';

const Cards = ({ showHeader = true }) => {
  const { user } = useAuth();
  const [series, setSeries] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState(DEFAULT_SERIE_ID);
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [binderSize, setBinderSize] = useState(DEFAULT_BINDER_SIZE);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingSets, setLoadingSets] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    rarity: ''
  });
  const [currentSet, setCurrentSet] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  
  // États pour le modal détaillé
  const [selectedCardForDetail, setSelectedCardForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const initialListingLoaded = useRef(false);
  
  // Hook de comparaison
  const {
    selectedCards,
    isComparisonOpen,
    addCardToComparison,
    removeCardFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    isCardSelected,
    canAddMore,
    canCompare,
    count: comparisonCount
  } = useCardComparison(5);

  // Charger la liste des séries au montage du composant
  useEffect(() => {
    // fetchSeries is stable enough for initial mount; disable exhaustive-deps here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchSeries();
  }, []);

  // Charger les extensions quand une série est sélectionnée
  useEffect(() => {
    if (selectedSerie) {
      const shouldPrefill = !initialListingLoaded.current && selectedSerie === DEFAULT_SERIE_ID;
      // fetchSetsBySerie has internal side-effects and we intentionally call it here
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchSetsBySerie(selectedSerie, {
        preferredSetId: shouldPrefill ? DEFAULT_SET_ID : '',
        autoLoadCards: shouldPrefill
      });
      if (shouldPrefill) {
        initialListingLoaded.current = true;
      }
    } else {
      setSets([]);
      setSelectedSet('');
    }
  }, [selectedSerie]);

  const fetchSeries = async () => {
    try {
      setLoadingSeries(true);
      const data = await TCGdexService.getSeries();
      setSeries(data);

      if (!selectedSerie && data.length > 0) {
        const fallbackSerie = data.find((serie) => serie.id === DEFAULT_SERIE_ID)?.id || data[0].id;
        setSelectedSerie(fallbackSerie);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger la liste des séries');
    } finally {
      setLoadingSeries(false);
    }
  };

  const fetchSetsBySerie = async (serieId, options = {}) => {
    try {
      setLoadingSets(true);
      const data = await TCGdexService.getSetsBySerie(serieId);
      setSets(data);

      let nextSetId = '';
      if (options.preferredSetId && data.some((set) => set.id === options.preferredSetId)) {
        nextSetId = options.preferredSetId;
      } else if (data.length > 0) {
        nextSetId = data[0].id;
      }

      if (nextSetId) {
        setSelectedSet(nextSetId);
        if (options.autoLoadCards) {
          await loadCardsForSet(serieId, nextSetId, { setsSource: data, silent: true });
        }
      } else {
        setSelectedSet('');
        setCards([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger la liste des extensions pour cette série');
      setSets([]);
    } finally {
      setLoadingSets(false);
    }
  };

  const loadCardsForSet = async (serieIdValue, setIdValue, options = {}) => {
    if (!serieIdValue || !setIdValue) {
      if (!options.silent) {
        alert('Veuillez sélectionner une série et une extension');
      }
      return;
    }

    try {
      setLoading(true);
      const data = await TCGdexService.getCardsBySet(setIdValue);
      setCards(data);
      const sourceSets = options.setsSource || sets;
      const selectedSetInfo = sourceSets.find((set) => set.id === setIdValue);
      setCurrentSet(selectedSetInfo || null);
    } catch (error) {
      console.error('Erreur:', error);
      if (!options.silent) {
        alert('Impossible de charger les cartes de cette extension');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = () => {
    loadCardsForSet(selectedSerie, selectedSet);
  };

  const addToCollection = async (card) => {
    console.log('🔶 Cards.js addToCollection called'); // Debug log
    
    if (!user) {
      setNotification({
        isVisible: true,
        message: 'Vous devez être connecté pour ajouter des cartes',
        type: 'error'
      });
      return;
    }

    if (!currentSet) {
      setNotification({
        isVisible: true,
        message: 'Informations sur l\'extension manquantes',
        type: 'error'
      });
      return;
    }

    try {
      const cardData = UserCardsService.formatCardForCollection(card, currentSet, 1);
      const userCard = await UserCardsService.addUserCard(cardData);
      console.log('🔶 Cards.js userCard créée:', userCard); // Debug log
      
      // Ne pas afficher de notification ici - c'est CardDetailModal qui s'en charge
      // setNotification({
      //   isVisible: true,
      //   message: `"${card.name}" ajoutée à votre collection !`,
      //   type: 'success'
      // });
      
      return userCard; // Retourner l'userCard pour CardDetailModal
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      if (error.message.includes('Token')) {
        setNotification({
          isVisible: true,
          message: 'Vous devez être connecté pour ajouter des cartes',
          type: 'error'
        });
      } else {
        setNotification({
          isVisible: true,
          message: 'Erreur lors de l\'ajout de la carte à votre collection',
          type: 'error'
        });
      }
      throw error; // Re-lancer l'erreur pour que CardDetailModal puisse la gérer
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, isVisible: false });
  };

  // Fonctions pour le modal détaillé
  const openCardDetail = (card) => {
    setSelectedCardForDetail(card);
    setIsDetailModalOpen(true);
  };

  const closeCardDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedCardForDetail(null);
  };

  // Fonctions pour la comparaison
  const handleAddToComparison = (card) => {
    if (canAddMore) {
      addCardToComparison(card);
      setNotification({
        isVisible: true,
        message: `"${card.name}" ajoutée à la comparaison (${comparisonCount + 1}/5)`,
        type: 'success'
      });
    } else {
      setNotification({
        isVisible: true,
        message: 'Comparaison pleine (5 cartes max). La plus ancienne a été remplacée.',
        type: 'info'
      });
      addCardToComparison(card);
    }
  };

  const filteredCards = TCGdexService.filterCards(cards, filters);

  const getGridClass = () => {
    switch (binderSize) {
      case '3x3':
        return 'cards-grid-3x3';
      case '4x4':
        return 'cards-grid-4x4';
      case '5x5':
        return 'cards-grid-5x5';
      default:
        return 'cards-grid-3x3';
    }
  };

  const getImageUrl = (card) => {
    console.log('📷 getImageUrl appelé pour:', card.name, 'avec données:', {
      cardId: card.id,
      cardImage: card.image,
      cardLocalId: card.localId
    });
    
    const imageUrl = TCGdexService.getHighQualityImageUrl(card);
    console.log('📷 URL finale retournée:', imageUrl);
    return imageUrl;
  };

  return (
    <>
      {showHeader && <Header />}
      <div className="cards-container">
        <div className="cards-header">
          <h1>Listing des Cartes Pokémon TCG</h1>
        </div>

        <div className="cards-controls">
          <div className="control-group">
            <label htmlFor="serie-select">Série :</label>
            <select 
              id="serie-select"
              value={selectedSerie} 
              onChange={(e) => setSelectedSerie(e.target.value)}
              disabled={loadingSeries}
            >
              <option value="">
                {loadingSeries ? 'Chargement...' : 'Sélectionnez une série'}
              </option>
              {series.map(serie => (
                <option key={serie.id} value={serie.id}>
                  {serie.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="set-select">Extension :</label>
            <select 
              id="set-select"
              value={selectedSet} 
              onChange={(e) => setSelectedSet(e.target.value)}
              disabled={loadingSets || !selectedSerie}
            >
              <option value="">
                {loadingSets ? 'Chargement...' : 
                 !selectedSerie ? 'Sélectionnez d\'abord une série' : 
                 'Sélectionnez une extension'}
              </option>
              {sets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="size-select">Taille du Binder :</label>
            <select 
              id="size-select"
              value={binderSize} 
              onChange={(e) => setBinderSize(e.target.value)}
            >
              <option value="3x3">3x3 (9 cartes par page)</option>
              <option value="4x4">4x4 (16 cartes par page)</option>
              <option value="5x5">5x5 (25 cartes par page)</option>
            </select>
          </div>

          <div className="control-group">
            <button 
              className="generate-btn" 
              onClick={fetchCards}
              disabled={!selectedSerie || !selectedSet || loading}
            >
              {loading ? 'Chargement...' : 'Afficher la série'}
            </button>

            {canCompare && (
              <button 
                className="comparison-btn" 
                onClick={openComparison}
                title={`Voir la comparaison (${comparisonCount} cartes)`}
              >
                🔄 Comparaison ({comparisonCount})
              </button>
            )}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="filters-section">
            <h3>Filtres</h3>
            <div className="filters">
              <div className="filter-group">
                <label htmlFor="name-filter">Nom :</label>
                <input
                  id="name-filter"
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="rarity-filter">Rareté :</label>
                <input
                  id="rarity-filter"
                  type="text"
                  placeholder="Rechercher par rareté..."
                  value={filters.rarity}
                  onChange={(e) => setFilters({...filters, rarity: e.target.value})}
                />
              </div>
            </div>
            <p className="results-count">
              {filteredCards.length} carte(s) trouvée(s) sur {cards.length}
            </p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>Chargement des cartes...</p>
          </div>
        )}

        {filteredCards.length > 0 && (
          <div key={binderSize} className={`cards-grid ${getGridClass()}`}>
            {filteredCards.map(card => (
              <div key={card.id} className="card-item">
                <div className="card-image-container">
                  <img 
                    src={getImageUrl(card)} 
                    alt={card.name}
                    loading="lazy"
                    onClick={() => openCardDetail(card)}
                    className="card-image-clickable"
                    title="Cliquer pour voir les détails"
                    onError={(e) => {
                      console.error(`🚫 ERREUR: Image non trouvée pour ${card.name}:`, {
                        urlTentée: e.target.src,
                        cardImage: card.image,
                        cardId: card.id,
                        cardLocalId: card.localId,
                        errorType: 'Image loading failed - URL inaccessible'
                      });
                      console.error(`🔗 URL complète qui a échoué: ${e.target.src}`);
                      
                      // Système de fallback intelligent avec compteur de tentatives
                      const imgElement = e.target;
                      let attemptCount = parseInt(imgElement.dataset.fallbackAttempt || '0');
                      
                      console.log(`🔄 Tentative ${attemptCount + 1} pour ${card.name}`);
                      
                      // Essayer les fallbacks dans l'ordre
                      if (attemptCount < 4) {
                        const nextFallback = TCGdexService.getNextFallbackUrl(card, attemptCount);
                        if (nextFallback) {
                          imgElement.dataset.fallbackAttempt = (attemptCount + 1).toString();
                          console.log(`🆘 Fallback ${attemptCount + 1} pour ${card.name}:`, nextFallback);
                          imgElement.src = nextFallback;
                          return; // Continuer avec le fallback
                        }
                      }
                      
                      // Fallback SVG si tous les autres échouent
                      console.error(`💀 Tous les fallbacks ont échoué pour ${card.name}`);
                      imgElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage non%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3Edisponible%3C/text%3E%3C/svg%3E";
                      imgElement.alt = 'Image non disponible';
                    }}
                  />
                </div>
                <div className="card-info">
                  <h4 onClick={() => openCardDetail(card)} className="card-name-clickable">
                    {card.name}
                  </h4>
                  <p>#{card.localId}</p>
                  {card.rarity && <p className="rarity">Rareté: {card.rarity}</p>}
                  
                  <div className="card-actions">
                    {user && (
                      <button 
                        className="add-to-collection-btn"
                        onClick={() => addToCollection(card)}
                        title="Ajouter à ma collection"
                      >
                        + Collection
                      </button>
                    )}
                    
                    <button 
                      className={`comparison-btn-card ${isCardSelected(card.id) ? 'selected' : ''}`}
                      onClick={() => handleAddToComparison(card)}
                      title={isCardSelected(card.id) ? 'Déjà en comparaison' : 'Ajouter à la comparaison'}
                      disabled={isCardSelected(card.id)}
                    >
                      {isCardSelected(card.id) ? '✓' : '🔄'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && cards.length === 0 && selectedSerie && selectedSet && (
          <div className="no-cards">
            <p>Aucune carte trouvée pour cette extension.</p>
          </div>
        )}
      </div>
      
      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
        duration={3000}
      />

      {/* Modal détaillé */}
      <CardDetailModal
        card={selectedCardForDetail}
        isOpen={isDetailModalOpen}
        onClose={closeCardDetail}
        onAddToCollection={addToCollection}
      />

      {/* Modal de comparaison */}
      <CardComparison
        isOpen={isComparisonOpen}
        onClose={closeComparison}
        selectedCards={selectedCards}
        onRemoveCard={removeCardFromComparison}
        onClearComparison={clearComparison}
      />
    </>
  );
};

export default Cards;
