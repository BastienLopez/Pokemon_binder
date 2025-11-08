import React, { useState, useEffect } from 'react';
import TCGdexService from '../services/tcgdexService';
import './CardComparison.css';

const CardComparison = ({ 
  isOpen, 
  onClose, 
  selectedCards = [], 
  onRemoveCard,
  onClearComparison 
}) => {
  const [cardDetails, setCardDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('details'); // 'details', 'stats', 'prices'

  useEffect(() => {
    if (isOpen && selectedCards.length > 0) {
      const fetchCardDetails = async () => {
        try {
          setLoading(true);
          const details = await Promise.all(
            selectedCards.map(async (card) => {
              try {
                if (card.id) {
                  const fullDetails = await TCGdexService.getCard(card.id);
                  return {
                    ...fullDetails,
                    estimatedPrice: generateMockPrice(fullDetails)
                  };
                }
                return {
                  ...card,
                  estimatedPrice: generateMockPrice(card)
                };
              } catch (error) {
                console.error(`Erreur lors de la récupération de ${card.name}:`, error);
                return {
                  ...card,
                  estimatedPrice: generateMockPrice(card)
                };
              }
            })
          );
          setCardDetails(details);
        } catch (error) {
          console.error('Erreur lors de la récupération des détails:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCardDetails();
    }
  }, [isOpen, selectedCards]);

  const generateMockPrice = (cardData) => {
    const rarityPrices = {
      'Common': { min: 0.10, max: 0.50 },
      'Uncommon': { min: 0.25, max: 1.00 },
      'Rare': { min: 1.00, max: 5.00 },
      'Rare Holo': { min: 3.00, max: 15.00 },
      'Ultra Rare': { min: 10.00, max: 50.00 },
      'Secret Rare': { min: 25.00, max: 100.00 },
      'Hyper Rare': { min: 50.00, max: 200.00 }
    };

    const rarity = cardData.rarity || 'Common';
    const priceRange = rarityPrices[rarity] || rarityPrices['Common'];
    const basePrice = Math.random() * (priceRange.max - priceRange.min) + priceRange.min;
    
    return {
      current: Number(basePrice.toFixed(2)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Number((Math.random() * 10 - 5).toFixed(2))
    };
  };

  const getComparisonData = () => {
    if (cardDetails.length === 0) {
      return {
        names: [],
        images: [],
        sets: [],
        rarities: [],
        types: [],
        hp: [],
        attacks: [],
        prices: [],
        illustrators: [],
        localIds: []
      };
    }

    return {
      names: cardDetails.map(card => card.name),
      images: cardDetails.map(card => TCGdexService.getHighQualityImageUrl(card)),
      sets: cardDetails.map(card => card.set?.name || 'N/A'),
      rarities: cardDetails.map(card => card.rarity || 'N/A'),
      types: cardDetails.map(card => card.types || []),
      hp: cardDetails.map(card => card.hp || 'N/A'),
      attacks: cardDetails.map(card => card.attacks || []),
      prices: cardDetails.map(card => card.estimatedPrice),
      illustrators: cardDetails.map(card => card.illustrator || 'N/A'),
      localIds: cardDetails.map(card => card.localId || 'N/A')
    };
  };

  const renderComparisonTable = () => {
    const data = getComparisonData();
    
    // Vérifier que les données sont disponibles
    if (!data.images || data.images.length === 0) {
      return (
        <div className="empty-comparison">
          <p>Aucune donnée de comparaison disponible.</p>
        </div>
      );
    }
    
    if (comparisonMode === 'details') {
      return (
        <div className="comparison-table">
          <div className="comparison-row">
            <div className="comparison-label">Image</div>
            {data.images.map((image, index) => (
              <div key={index} className="comparison-cell image-cell">
                <img 
                  src={image} 
                  alt={data.names[index]}
                  className="comparison-card-image"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage non%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3Edisponible%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Nom</div>
            {data.names.map((name, index) => (
              <div key={index} className="comparison-cell">
                <strong>{name}</strong>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Numéro</div>
            {data.localIds.map((id, index) => (
              <div key={index} className="comparison-cell">
                #{id}
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Extension</div>
            {data.sets.map((set, index) => (
              <div key={index} className="comparison-cell">
                {set}
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Rareté</div>
            {data.rarities.map((rarity, index) => (
              <div key={index} className="comparison-cell">
                <span className={`rarity-badge rarity-${rarity.toLowerCase().replace(' ', '-')}`}>
                  {rarity}
                </span>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Type(s)</div>
            {data.types.map((types, index) => (
              <div key={index} className="comparison-cell">
                <div className="types-list">
                  {types.map((type, typeIndex) => (
                    <span key={typeIndex} className={`type-badge type-${type.toLowerCase()}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Illustrateur</div>
            {data.illustrators.map((illustrator, index) => (
              <div key={index} className="comparison-cell">
                {illustrator}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (comparisonMode === 'stats') {
      return (
        <div className="comparison-table">
          <div className="comparison-row">
            <div className="comparison-label">Carte</div>
            {data.names.map((name, index) => (
              <div key={index} className="comparison-cell">
                <div className="card-mini">
                  <img 
                    src={data.images[index]} 
                    alt={name}
                    className="card-mini-image"
                  />
                  <strong>{name}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Points de Vie</div>
            {data.hp.map((hp, index) => (
              <div key={index} className="comparison-cell">
                <span className="hp-value">{hp} {hp !== 'N/A' ? 'HP' : ''}</span>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Nombre d'attaques</div>
            {data.attacks.map((attacks, index) => (
              <div key={index} className="comparison-cell">
                {attacks.length} attaque{attacks.length > 1 ? 's' : ''}
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Attaques</div>
            {data.attacks.map((attacks, index) => (
              <div key={index} className="comparison-cell">
                <div className="attacks-summary">
                  {attacks.map((attack, attackIndex) => (
                    <div key={attackIndex} className="attack-summary">
                      <div className="attack-header">
                        <strong>{attack.name}</strong>
                        {attack.damage && <span className="damage">({attack.damage})</span>}
                      </div>
                      {(attack.effect || attack.description || attack.text) && (
                        <div className="attack-description">
                          {attack.effect || attack.description || attack.text}
                        </div>
                      )}
                    </div>
                  ))}
                  {attacks.length === 0 && <span className="no-attacks">Aucune attaque</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (comparisonMode === 'prices') {
      return (
        <div className="comparison-table">
          <div className="comparison-row">
            <div className="comparison-label">Carte</div>
            {data.names.map((name, index) => (
              <div key={index} className="comparison-cell">
                <div className="card-mini">
                  <img 
                    src={data.images[index]} 
                    alt={name}
                    className="card-mini-image"
                  />
                  <strong>{name}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Prix estimé</div>
            {data.prices.map((price, index) => (
              <div key={index} className="comparison-cell">
                <div className="price-comparison">
                  <span className="price-value">{price.current}€</span>
                  <span className={`price-trend ${price.trend}`}>
                    {price.trend === 'up' ? '↗' : '↘'} {price.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Rareté</div>
            {data.rarities.map((rarity, index) => (
              <div key={index} className="comparison-cell">
                <span className={`rarity-badge rarity-${rarity.toLowerCase().replace(' ', '-')}`}>
                  {rarity}
                </span>
              </div>
            ))}
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Valeur par rareté</div>
            {data.rarities.map((rarity, index) => (
              <div key={index} className="comparison-cell">
                <span className="rarity-value-indicator">
                  {getRarityValue(rarity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Valeur de retour par défaut si aucun mode ne correspond
    return (
      <div className="empty-comparison">
        <p>Mode de comparaison non reconnu.</p>
      </div>
    );
  };

  const getRarityValue = (rarity) => {
    const values = {
      'Common': '⭐',
      'Uncommon': '⭐⭐',
      'Rare': '⭐⭐⭐',
      'Rare Holo': '⭐⭐⭐⭐',
      'Ultra Rare': '⭐⭐⭐⭐⭐',
      'Secret Rare': '⭐⭐⭐⭐⭐⭐',
      'Hyper Rare': '⭐⭐⭐⭐⭐⭐⭐'
    };
    return values[rarity] || '⭐';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card-comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h2>Comparaison de cartes ({selectedCards.length})</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {selectedCards.length === 0 ? (
          <div className="empty-comparison">
            <p>Aucune carte sélectionnée pour la comparaison.</p>
            <p>Cliquez sur le bouton "Comparer" sur les cartes que vous souhaitez comparer.</p>
          </div>
        ) : selectedCards.length === 1 ? (
          <div className="empty-comparison">
            <p>Une seule carte sélectionnée.</p>
            <p>Ajoutez au moins une autre carte pour commencer la comparaison.</p>
            <p>Vous pouvez comparer de 2 à 5 cartes simultanément.</p>
          </div>
        ) : (
          <>
            <div className="comparison-controls">
              <div className="view-modes">
                <button 
                  className={`mode-btn ${comparisonMode === 'details' ? 'active' : ''}`}
                  onClick={() => setComparisonMode('details')}
                >
                  📋 Détails
                </button>
                <button 
                  className={`mode-btn ${comparisonMode === 'stats' ? 'active' : ''}`}
                  onClick={() => setComparisonMode('stats')}
                >
                  ⚔️ Statistiques
                </button>
                <button 
                  className={`mode-btn ${comparisonMode === 'prices' ? 'active' : ''}`}
                  onClick={() => setComparisonMode('prices')}
                >
                  💰 Prix
                </button>
              </div>

              <div className="comparison-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={onClearComparison}
                >
                  Vider la comparaison
                </button>
              </div>
            </div>

            <div className="comparison-content">
              {loading ? (
                <div className="comparison-loading">
                  <p>Chargement de la comparaison...</p>
                </div>
              ) : (
                <>
                  <div className="selected-cards-list">
                    {selectedCards.map((card, index) => (
                      <div key={card.id || index} className="selected-card-item">
                        <img 
                          src={TCGdexService.getHighQualityImageUrl(card)} 
                          alt={card.name}
                          className="selected-card-thumb"
                        />
                        <span className="selected-card-name">{card.name}</span>
                        <button 
                          className="remove-card-btn"
                          onClick={() => onRemoveCard(index)}
                          title="Retirer de la comparaison"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {renderComparisonTable()}
                </>
              )}
            </div>
          </>
        )}

        <div className="comparison-footer">
          <p className="comparison-tip">
            💡 Astuce : Vous pouvez comparer de 2 à 5 cartes simultanément
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardComparison;
