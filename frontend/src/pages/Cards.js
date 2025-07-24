import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TCGdexService from '../services/tcgdexService';
import './Cards.css';

const Cards = ({ showHeader = true }) => {
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [binderSize, setBinderSize] = useState('3x3');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSets, setLoadingSets] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    rarity: ''
  });

  // Charger la liste des extensions au montage du composant
  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      setLoadingSets(true);
      const data = await TCGdexService.getSets();
      setSets(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger la liste des extensions');
    } finally {
      setLoadingSets(false);
    }
  };

  const fetchCards = async () => {
    if (!selectedSet) {
      alert('Veuillez sélectionner une extension');
      return;
    }

    try {
      setLoading(true);
      const data = await TCGdexService.getCardsBySet(selectedSet);
      setCards(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les cartes de cette extension');
    } finally {
      setLoading(false);
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
    return TCGdexService.getHighQualityImageUrl(card);
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
            <label htmlFor="set-select">Extension :</label>
            <select 
              id="set-select"
              value={selectedSet} 
              onChange={(e) => setSelectedSet(e.target.value)}
              disabled={loadingSets}
            >
              <option value="">
                {loadingSets ? 'Chargement...' : 'Sélectionnez une extension'}
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

          <button 
            className="generate-btn" 
            onClick={fetchCards}
            disabled={!selectedSet || loading}
          >
            {loading ? 'Génération...' : 'Générer le Binder'}
          </button>
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
          <div className={`cards-grid ${getGridClass()}`}>
            {filteredCards.map(card => (
              <div key={card.id} className="card-item">
                <div className="card-image-container">
                  <img 
                    src={getImageUrl(card)} 
                    alt={card.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder-card.png';
                      e.target.alt = 'Image non disponible';
                    }}
                  />
                </div>
                <div className="card-info">
                  <h4>{card.name}</h4>
                  <p>#{card.localId}</p>
                  {card.rarity && <p className="rarity">Rareté: {card.rarity}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && cards.length === 0 && selectedSet && (
          <div className="no-cards">
            <p>Aucune carte trouvée pour cette extension.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Cards;
