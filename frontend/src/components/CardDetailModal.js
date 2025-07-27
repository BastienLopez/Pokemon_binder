import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TCGdexService from '../services/tcgdexService';
import UserCardsService from '../services/userCardsService';
import binderService from '../services/binderService';
import './CardDetailModal.css';

const CardDetailModal = ({ 
  card, 
  isOpen, 
  onClose, 
  onAddToCollection,
  onRemoveFromCollection,
  userCard = null // Si la carte est déjà dans la collection de l'utilisateur
}) => {
  const { user } = useAuth();
  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userBinders, setUserBinders] = useState([]);
  const [selectedBinder, setSelectedBinder] = useState('');
  const [isInCollection, setIsInCollection] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [showAddToBinder, setShowAddToBinder] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      fetchCardDetails();
      if (user) {
        fetchUserBinders();
        setIsInCollection(!!userCard);
      }
    }
  }, [isOpen, card, user, userCard]);

  const fetchCardDetails = async () => {
    if (!card.id) return;
    
    try {
      setLoading(true);
      const details = await TCGdexService.getCard(card.id);
      setCardDetails(details);
      
      // Simulation d'un prix estimé (à remplacer par une vraie API)
      const mockPrice = generateMockPrice(details);
      setEstimatedPrice(mockPrice);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBinders = async () => {
    try {
      const binders = await binderService.getUserBinders();
      setUserBinders(binders);
    } catch (error) {
      console.error('Erreur lors de la récupération des binders:', error);
    }
  };

  const generateMockPrice = (cardData) => {
    // Simulation de prix basée sur la rareté
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
      change: Number((Math.random() * 10 - 5).toFixed(2)) // -5% à +5%
    };
  };

  const handleAddToCollection = async () => {
    if (onAddToCollection) {
      await onAddToCollection(card);
      setIsInCollection(true);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (onRemoveFromCollection && userCard) {
      await onRemoveFromCollection(userCard.id);
      setIsInCollection(false);
    }
  };

  const handleAddToBinder = async () => {
    if (!selectedBinder || !userCard) return;

    try {
      await binderService.addCardToBinder(selectedBinder, {
        user_card_id: userCard.id,
        position: 'auto' // Placement automatique
      });
      
      // Notification de succès
      alert(`Carte ajoutée au binder avec succès !`);
      setShowAddToBinder(false);
      setSelectedBinder('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au binder:', error);
      alert('Erreur lors de l\'ajout au binder');
    }
  };

  const getExternalLinks = () => {
    if (!cardDetails) return {};

    const cardName = encodeURIComponent(cardDetails.name);
    const setName = encodeURIComponent(cardDetails.set?.name || '');
    
    return {
      cardmarket: `https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=${cardName}`,
      ebay: `https://www.ebay.fr/sch/i.html?_nkw=${cardName}+pokemon+card`,
      tcgplayer: `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${cardName}`,
      pricecharting: `https://www.pricecharting.com/search-products?q=${cardName}+pokemon&type=videogames`
    };
  };

  const handleShare = (platform) => {
    if (!cardDetails) return;

    const shareText = `Découvrez cette carte Pokémon : ${cardDetails.name} de l'extension ${cardDetails.set?.name || 'N/A'}`;
    const shareUrl = window.location.href;

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`
    };

    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  const displayCard = cardDetails || card;
  const externalLinks = getExternalLinks();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        {loading ? (
          <div className="modal-loading">
            <p>Chargement des détails...</p>
          </div>
        ) : (
          <div className="modal-content">
            {/* Image et informations principales */}
            <div className="modal-main">
              <div className="card-image-section">
                <img
                  src={TCGdexService.getHighQualityImageUrl(displayCard)}
                  alt={displayCard.name}
                  className="card-image-large"
                  onError={(e) => {
                    e.target.src = '/placeholder-card.png';
                  }}
                />
                
                {estimatedPrice && (
                  <div className="price-section">
                    <h4>Prix estimé</h4>
                    <div className="price-info">
                      <span className="current-price">{estimatedPrice.current}€</span>
                      <span className={`price-trend ${estimatedPrice.trend}`}>
                        {estimatedPrice.trend === 'up' ? '↗' : '↘'} {estimatedPrice.change}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-info-section">
                <div className="card-header">
                  <h2>{displayCard.name}</h2>
                  <p className="card-number">#{displayCard.localId}</p>
                </div>

                <div className="card-details">
                  {displayCard.set && (
                    <div className="detail-item">
                      <label>Extension :</label>
                      <span>{displayCard.set.name}</span>
                    </div>
                  )}
                  
                  {displayCard.rarity && (
                    <div className="detail-item">
                      <label>Rareté :</label>
                      <span className={`rarity-badge rarity-${displayCard.rarity.toLowerCase().replace(' ', '-')}`}>
                        {displayCard.rarity}
                      </span>
                    </div>
                  )}

                  {displayCard.types && displayCard.types.length > 0 && (
                    <div className="detail-item">
                      <label>Type(s) :</label>
                      <div className="types-list">
                        {displayCard.types.map((type, index) => (
                          <span key={index} className={`type-badge type-${type.toLowerCase()}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayCard.hp && (
                    <div className="detail-item">
                      <label>Points de Vie :</label>
                      <span className="hp-value">{displayCard.hp} HP</span>
                    </div>
                  )}

                  {displayCard.illustrator && (
                    <div className="detail-item">
                      <label>Illustrateur :</label>
                      <span>{displayCard.illustrator}</span>
                    </div>
                  )}

                  {userCard && (
                    <div className="collection-info">
                      <h4>Dans votre collection</h4>
                      <div className="detail-item">
                        <label>Quantité :</label>
                        <span>{userCard.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <label>État :</label>
                        <span>{userCard.condition}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attaques */}
                {displayCard.attacks && displayCard.attacks.length > 0 && (
                  <div className="attacks-section">
                    <h4>Attaques</h4>
                    {displayCard.attacks.map((attack, index) => (
                      <div key={index} className="attack-item">
                        <div className="attack-header">
                          <span className="attack-name">{attack.name}</span>
                          {attack.damage && <span className="attack-damage">{attack.damage}</span>}
                        </div>
                        {attack.effect && (
                          <p className="attack-effect">{attack.effect}</p>
                        )}
                        {attack.cost && attack.cost.length > 0 && (
                          <div className="attack-cost">
                            {attack.cost.map((cost, costIndex) => (
                              <span key={costIndex} className={`energy-cost energy-${cost.toLowerCase()}`}>
                                {cost}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <div className="collection-actions">
                {user && (
                  <>
                    {!isInCollection ? (
                      <button 
                        className="btn btn-primary"
                        onClick={handleAddToCollection}
                      >
                        Ajouter à ma collection
                      </button>
                    ) : (
                      <div className="collection-controls">
                        <button 
                          className="btn btn-danger"
                          onClick={handleRemoveFromCollection}
                        >
                          Retirer de ma collection
                        </button>
                        
                        {userBinders.length > 0 && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setShowAddToBinder(!showAddToBinder)}
                          >
                            Ajouter à un binder
                          </button>
                        )}
                      </div>
                    )}

                    {showAddToBinder && (
                      <div className="binder-selection">
                        <select 
                          value={selectedBinder} 
                          onChange={(e) => setSelectedBinder(e.target.value)}
                        >
                          <option value="">Choisir un binder</option>
                          {userBinders.map(binder => (
                            <option key={binder.id} value={binder.id}>
                              {binder.name} ({binder.size})
                            </option>
                          ))}
                        </select>
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={handleAddToBinder}
                          disabled={!selectedBinder}
                        >
                          Ajouter
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Liens externes */}
              <div className="external-links">
                <h4>Liens externes</h4>
                <div className="links-grid">
                  <a 
                    href={externalLinks.cardmarket} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link cardmarket"
                  >
                    <span>📊</span> Cardmarket
                  </a>
                  
                  <a 
                    href={externalLinks.ebay} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link ebay"
                  >
                    <span>🛒</span> eBay
                  </a>
                  
                  <a 
                    href={externalLinks.tcgplayer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link tcgplayer"
                  >
                    <span>🃏</span> TCGPlayer
                  </a>
                  
                  <a 
                    href={externalLinks.pricecharting} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link pricecharting"
                  >
                    <span>💰</span> Price Charting
                  </a>
                </div>
              </div>

              {/* Partage social */}
              <div className="social-share">
                <h4>Partager</h4>
                <div className="share-buttons">
                  <button 
                    className="share-btn twitter"
                    onClick={() => handleShare('twitter')}
                  >
                    🐦 Twitter
                  </button>
                  
                  <button 
                    className="share-btn facebook"
                    onClick={() => handleShare('facebook')}
                  >
                    📘 Facebook
                  </button>
                  
                  <button 
                    className="share-btn reddit"
                    onClick={() => handleShare('reddit')}
                  >
                    🔴 Reddit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetailModal;
