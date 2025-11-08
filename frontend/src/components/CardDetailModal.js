import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TCGdexService from '../services/tcgdexService';
import binderService from '../services/binderService';
import Toast from './Toast';
import './CardDetailModal.css';
import { PLACEHOLDER_IMAGE } from '../utils/assets';

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    console.log('🟣 showToast appelé:', { message, type, timestamp: new Date().toISOString() });
    console.trace('🟣 Stack trace de showToast:');
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    console.log('🟤 useEffect triggered:', { isOpen, card: !!card, user: !!user, userCard });

    if (isOpen && card) {
      console.log('🟤 Conditions remplies, début de l\'initialisation');

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

      fetchCardDetails();
      if (user) {
        console.log('🟤 Utilisateur connecté, récupération des binders');
        fetchUserBinders();
        const inCollection = !!userCard;
        console.log('🟤 Setting isInCollection to:', inCollection);
        setIsInCollection(inCollection);
      }
    }
  }, [isOpen, card, user, userCard]);

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
    console.log('🔵 handleAddToCollection called');
    console.log('🔵 onAddToCollection exists:', !!onAddToCollection);
    console.log('🔵 card:', card);
    
    if (onAddToCollection) {
      try {
        console.log('🔵 Appel de onAddToCollection...');
        const result = await onAddToCollection(card);
        console.log('🔵 Résultat de onAddToCollection:', result);
        
        setIsInCollection(true);
        console.log('🔵 isInCollection mis à true');
        
        // Si onAddToCollection retourne l'userCard créée, on l'utilise
        if (result && result.id) {
          console.log('🔵 Stockage de window.userCard:', result);
          window.userCard = result; // Stockage temporaire
        } else {
          console.log('🔵 Pas de résultat avec ID, window.userCard non mis à jour');
        }
        
        console.log('🔵 Affichage du toast de succès');
        showToast('Carte ajoutée à votre collection avec succès !', 'success');
        
      } catch (error) {
        console.error('🔴 Erreur lors de l\'ajout à la collection:', error);
        showToast('Erreur lors de l\'ajout à la collection', 'error');
      }
    }
  };

  const handleRemoveFromCollection = async () => {
    if (onRemoveFromCollection && userCard) {
      await onRemoveFromCollection(userCard.id);
      setIsInCollection(false);
    }
  };

  const handleAddToBinder = async () => {
    console.log('🟡 handleAddToBinder called');
    console.log('🟡 selectedBinder:', selectedBinder);
    console.log('🟡 userCard prop:', userCard);
    console.log('🟡 window.userCard:', window.userCard);
    console.log('🟡 isInCollection:', isInCollection);
    
    if (!selectedBinder) {
      console.log('🔴 Erreur: Pas de binder sélectionné');
      showToast('Veuillez sélectionner un binder', 'error');
      return;
    }
    
    // Vérifier si la carte est dans la collection (soit via userCard prop, soit vient d'être ajoutée)
    const currentUserCard = userCard || window.userCard;
    console.log('🟡 currentUserCard calculé:', currentUserCard);
    
    if (!isInCollection) {
      console.log('🔴 Erreur: Carte pas dans la collection');
      showToast('La carte doit d\'abord être dans votre collection', 'error');
      return;
    }
    
    if (!currentUserCard) {
      console.log('🔴 Erreur: currentUserCard non trouvé');
      showToast('Impossible de trouver la carte dans votre collection', 'error');
      return;
    }

    try {
      console.log('🟡 Tentative d\'ajout au binder:', { 
        binderId: selectedBinder, 
        userCardId: currentUserCard.id,
        currentUserCard: currentUserCard
      });
      
      const binderResult = await binderService.addCardToBinder(selectedBinder, {
        user_card_id: currentUserCard.id
        // Pas de position ni page_number pour placement automatique
      });
      
      console.log('🟢 Résultat de addCardToBinder:', binderResult);
      
      // Trouver le nom du binder sélectionné
      const selectedBinderName = userBinders.find(b => b.id === selectedBinder)?.name || 'binder';
      console.log('🟢 Nom du binder trouvé:', selectedBinderName);
      
      showToast(`Carte ajoutée au binder "${selectedBinderName}" avec succès !`, 'success');
      setShowAddToBinder(false);
      setSelectedBinder('');
      console.log('🟢 Interface mise à jour avec succès');
    } catch (error) {
      console.error('🔴 Erreur lors de l\'ajout au binder:', error);
      console.error('🔴 Stack trace:', error.stack);
      showToast('Erreur lors de l\'ajout au binder', 'error');
    }
  };

  const getCardmarketExpansionId = (setName) => {
    // Mapping des extensions vers leurs IDs Cardmarket
    const expansionMapping = {
      'Neo Discovery': '1532',
      'Base Set': '1',
      'Jungle': '2',
      'Fossil': '3',
      'Team Rocket': '4',
      'Gym Heroes': '5',
      'Gym Challenge': '6',
      'Neo Genesis': '7',
      'Neo Revelation': '8',
      'Neo Destiny': '9',
      'Legendary Collection': '10',
      'Expedition Base Set': '11',
      'Aquapolis': '12',
      'Skyridge': '13',
      'Ruby & Sapphire': '14',
      'Sandstorm': '15',
      'Dragon': '16',
      'Team Magma vs Team Aqua': '17',
      'Hidden Legends': '18',
      'FireRed & LeafGreen': '19',
      'Team Rocket Returns': '20',
      'Deoxys': '21',
      'Emerald': '22',
      'Unseen Forces': '23',
      'Delta Species': '24',
      'Legend Maker': '25',
      'Holon Phantoms': '26',
      'Crystal Guardians': '27',
      'Dragon Frontiers': '28',
      'Power Keepers': '29',
      'Diamond & Pearl': '30',
      'Mysterious Treasures': '31',
      'Secret Wonders': '32',
      'Great Encounters': '33',
      'Majestic Dawn': '34',
      'Legends Awakened': '35',
      'Stormfront': '36',
      'Platinum': '37',
      'Rising Rivals': '38',
      'Supreme Victors': '39',
      'Arceus': '40',
      'HeartGold & SoulSilver': '41',
      'Unleashed': '42',
      'Undaunted': '43',
      'Triumphant': '44',
      'Call of Legends': '45',
      'Black & White': '46',
      'Emerging Powers': '47',
      'Noble Victories': '48',
      'Next Destinies': '49',
      'Dark Explorers': '50',
      'Dragons Exalted': '51',
      'Boundaries Crossed': '52',
      'Plasma Storm': '53',
      'Plasma Freeze': '54',
      'Plasma Blast': '55',
      'Legendary Treasures': '56',
      'XY': '57',
      'Flashfire': '58',
      'Furious Fists': '59',
      'Phantom Forces': '60',
      'Primal Clash': '61',
      'Roaring Skies': '62',
      'Ancient Origins': '63',
      'BREAKthrough': '64',
      'BREAKpoint': '65',
      'Generations': '66',
      'Fates Collide': '67',
      'Steam Siege': '68',
      'Evolutions': '69',
      'Sun & Moon': '70',
      'Guardians Rising': '71',
      'Burning Shadows': '72',
      'Shining Legends': '73',
      'Crimson Invasion': '74',
      'Ultra Prism': '75',
      'Forbidden Light': '76',
      'Celestial Storm': '77',
      'Dragon Majesty': '78',
      'Lost Thunder': '79',
      'Team Up': '80',
      'Detective Pikachu': '81',
      'Unbroken Bonds': '82',
      'Unified Minds': '83',
      'Hidden Fates': '84',
      'Cosmic Eclipse': '85',
      'Sword & Shield': '86',
      'Rebel Clash': '87',
      'Darkness Ablaze': '88',
      'Champion\'s Path': '89',
      'Vivid Voltage': '90',
      'Shining Fates': '91',
      'Battle Styles': '92',
      'Chilling Reign': '93',
      'Evolving Skies': '94',
      'Celebrations': '95',
      'Fusion Strike': '96',
      'Brilliant Stars': '97',
      'Astral Radiance': '98',
      'Pokémon GO': '99',
      'Lost Origin': '100',
      'Silver Tempest': '101',
      'Paldea Evolved': '102',
      'Obsidian Flames': '103',
      '151': '104',
      'Paradox Rift': '105',
      'Paldean Fates': '106',
      'Temporal Forces': '107',
      'Twilight Masquerade': '108',
      'Shrouded Fable': '109',
      'Stellar Crown': '110'
    };
    
    return expansionMapping[setName] || '0';
  };

  const getExternalLinks = () => {
    if (!cardDetails) return {};

    const cardName = encodeURIComponent(cardDetails.name);
    const setName = cardDetails.set?.name || '';
    const expansionId = getCardmarketExpansionId(setName);
    const searchQuery = setName ? `${cardName}+${setName}` : cardName;
    
    return {
      cardmarket: `https://www.cardmarket.com/fr/Pokemon/Products/Search?searchMode=v2&idCategory=0&idExpansion=${expansionId}&searchString=${cardName}&idRarity=0&perSite=30&mode=gallery`,
      ebay: `https://www.ebay.fr/sch/i.html?_nkw=${searchQuery}+pokemon+card`,
      tcgplayer: `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${searchQuery}`,
      pricecharting: `https://www.pricecharting.com/search-products?q=${searchQuery}+pokemon&type=videogames`
    };
  };

  const getEnergyIcon = (energyType) => {
    const energyIcons = {
      'Plante': '🌿',
      'Feu': '🔥',
      'Eau': '💧',
      'Électrique': '⚡',
      'Psy': '🔮',
      'Combat': '👊',
      'Obscurité': '🌑',
      'Métal': '⚙️',
      'Incolore': '⚪',
      'Dragon': '🐉',
      'Fée': '🧚'
    };

    return energyIcons[energyType] || '⚪';
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

        <Toast 
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={hideToast}
        />

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
                    e.target.src = PLACEHOLDER_IMAGE;
                    e.target.alt = 'Image non disponible';
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
                              <span 
                                key={costIndex} 
                                className={`energy-cost energy-${cost.toLowerCase()}`}
                                title={cost}
                              >
                                {getEnergyIcon(cost)}
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
