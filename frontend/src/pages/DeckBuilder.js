import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserCardsService from '../services/userCardsService';
import { PLACEHOLDER_IMAGE, isPlaceholderImage } from '../utils/assets';
import { estimateCardValue, formatEuro } from '../utils/value';
import './DeckBuilder.css';

const MAX_DECK_SIZE = 60;
const STORAGE_KEY = 'pb_decks_v2';

const CATEGORY_OPTIONS = [
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'trainer', label: 'Dresseur' },
  { value: 'energy', label: 'Énergie' }
];

const TYPE_CONFIG = [
  { id: 'fire', label: 'Feu', colors: ['#ff8a65', '#ff7043'] },
  { id: 'water', label: 'Eau', colors: ['#64b5f6', '#42a5f5'] },
  { id: 'grass', label: 'Plante', colors: ['#81c784', '#66bb6a'] },
  { id: 'electric', label: 'Électrique', colors: ['#ffee58', '#fdd835'] },
  { id: 'psychic', label: 'Psy', colors: ['#ba68c8', '#ab47bc'] },
  { id: 'fighting', label: 'Combat', colors: ['#a1887f', '#8d6e63'] },
  { id: 'darkness', label: 'Obscurité', colors: ['#7986cb', '#5c6bc0'] },
  { id: 'metal', label: 'Métal', colors: ['#cfd8dc', '#b0bec5'] },
  { id: 'fairy', label: 'Fée', colors: ['#f8bbd0', '#f48fb1'] },
  { id: 'dragon', label: 'Dragon', colors: ['#ffcc80', '#f48fb1'] },
  { id: 'colorless', label: 'Incolore', colors: ['#eceff1', '#cfd8dc'] }
];

const baseDeck = (name = 'Mon deck #1') => ({
  id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  cards: []
});

const loadDecks = () => {
  if (typeof window === 'undefined') {
    return [baseDeck()];
  }

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch (error) {
    console.warn('Deck storage unreadable:', error);
  }

  return [baseDeck()];
};

const resolveCardId = (card = {}) => {
  const candidates = [
    card.id,
    card.card_id,
    card.user_card_id,
    card._id,
    card.tcgdex_id,
    card.tcgplayer_id,
    card.card_uuid,
    card.card_number,
    card.number,
    card.localId,
    card.set_id && card.localId ? `${card.set_id}-${card.localId}` : null,
    card.setId && card.localId ? `${card.setId}-${card.localId}` : null,
    card.set?.id && card.localId ? `${card.set.id}-${card.localId}` : null
  ];

  const resolved = candidates.find(Boolean);
  return resolved ? String(resolved) : null;
};

const getCardImage = (card) => {
  if (!card) return PLACEHOLDER_IMAGE;
  
  console.log('DeckBuilder - getCardImage for card:', card.card_name || card.name, card);
  
  // Essayer d'abord card_image
  let url = card?.card_image || card?.image || card?.imageUrl;

  // Si c'est une URL TCGdex incomplète, l'ajouter
  if (url && url.includes('assets.tcgdex.net') && !url.endsWith('.webp')) {
    url = `${url}/high.webp`;
    console.log('Fixed TCGdex URL:', url);
    return url;
  }

  // Si pas d'URL directe, essayer de construire depuis card_id
  if (!url || isPlaceholderImage(url)) {
    if (card.card_id) {
      const [setId, number] = card.card_id.split('-');
      if (setId && number) {
        const serie = setId.replace(/[0-9]+$/, '') || setId;
        url = `https://assets.tcgdex.net/fr/${serie}/${setId}/${number}/high.webp`;
        console.log('Constructed URL from card_id:', url);
        return url;
      }
    }
  }

  // Si on a une URL d'images large/small, vérifier qu'elle est valide
  if (url && (card?.images?.large || card?.images?.small)) {
    url = card.images.large || card.images.small;
  }

  if (!url || isPlaceholderImage(url)) {
    console.log('Using placeholder for card');
    return PLACEHOLDER_IMAGE;
  }

  console.log('Using URL:', url);
  return url;
};

const DeckBuilder = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initialDecksRef = useRef(loadDecks());
  const [decks, setDecks] = useState(initialDecksRef.current);
  const [activeDeckId, setActiveDeckId] = useState(initialDecksRef.current[0]?.id || null);
  const [userCards, setUserCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [copyMessage, setCopyMessage] = useState('');

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) || decks[0],
    [decks, activeDeckId]
  );
  const deckCards = React.useMemo(() => activeDeck?.cards || [], [activeDeck]);

  useEffect(() => {
    if (!activeDeckId && decks.length) {
      setActiveDeckId(decks[0].id);
    }
  }, [activeDeckId, decks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks]);

  useEffect(() => {
    if (user) {
      loadUserCards();
    }
  }, [user]);

  useEffect(() => {
    validateDeck(deckCards);
  }, [deckCards]);

  const loadUserCards = async () => {
    try {
      const cards = await UserCardsService.getUserCards();
      setUserCards(cards);
    } catch (error) {
      console.error('Impossible de charger les cartes utilisateur:', error);
    }
  };

  const updateActiveDeck = (updater) => {
    if (!activeDeck) {
      return;
    }

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === activeDeck.id ? { ...deck, cards: updater(deck.cards || []) } : deck
      )
    );
  };

  const getCardById = (cardId) => userCards.find((card) => resolveCardId(card) === cardId);

  const deriveCardCategory = (card) => {
    const raw =
      (card.category ||
        card.card_category ||
        card.supertype ||
        (card.types && card.types.includes('Trainer') ? 'trainer' : '') ||
        '').toLowerCase();

    if (raw.includes('energy') || raw.includes('énergie')) return 'energy';
    if (raw.includes('trainer') || raw.includes('dresseur')) return 'trainer';
    return 'pokemon';
  };

  const isBasicEnergy = (card) => {
    if (deriveCardCategory(card) !== 'energy') return false;
    const name = (card.card_name || card.name || '').toLowerCase();
    return name.includes('énergie de base') || name.includes('basic energy');
  };

  const addCardToDeck = (card, quantity = 1) => {
    const cardId = resolveCardId(card);
    if (!cardId) return;

    updateActiveDeck((prevCards) => {
      const category = deriveCardCategory(card);
      const basicEnergy = isBasicEnergy(card);
      const allowed = basicEnergy || category === 'energy' ? MAX_DECK_SIZE : 4;
      const currentTotal = prevCards.reduce((sum, item) => sum + item.quantity, 0);

      if (currentTotal + quantity > MAX_DECK_SIZE) {
        setMessages(['Le deck ne peut pas dépasser 60 cartes.']);
        return prevCards;
      }

      let alreadyPresent = false;
      const nextCards = prevCards.map((entry) => {
        if (entry.cardId !== cardId) {
          return entry;
        }
        alreadyPresent = true;
        return {
          ...entry,
          quantity: Math.min(allowed, entry.quantity + quantity)
        };
      });

      if (!alreadyPresent) {
        nextCards.push({
          cardId,
          name: card.card_name || card.name || 'Carte sans nom',
          quantity,
          category,
          isBasicEnergy: basicEnergy,
          rarity: card.rarity,
          condition: card.condition || 'Near Mint'
        });
      }

      return nextCards;
    });
  };

  const removeCard = (cardId) => {
    updateActiveDeck((prev) => prev.filter((entry) => entry.cardId !== cardId));
  };

  const updateCardQuantity = (cardId, delta) => {
    updateActiveDeck((prev) =>
      prev
        .map((entry) => {
          if (entry.cardId !== cardId) return entry;
          const maxCopies = entry.isBasicEnergy || entry.category === 'energy' ? MAX_DECK_SIZE : 4;
          return {
            ...entry,
            quantity: Math.min(maxCopies, Math.max(1, entry.quantity + delta))
          };
        })
        .filter((entry) => entry.quantity > 0)
    );
  };

  const validateDeck = (cardsToValidate) => {
    const warnings = [];
    const total = cardsToValidate.reduce((sum, card) => sum + card.quantity, 0);

    if (total < MAX_DECK_SIZE) {
      warnings.push(`Le deck doit contenir 60 cartes (actuellement ${total}).`);
    }
    if (total > MAX_DECK_SIZE) {
      warnings.push('Le deck dépasse 60 cartes.');
    }

    const pokemonCount = cardsToValidate
      .filter((card) => card.category === 'pokemon')
      .reduce((sum, card) => sum + card.quantity, 0);

    if (pokemonCount === 0) {
      warnings.push('Ajoutez au moins un Pokémon au deck.');
    }

    cardsToValidate.forEach((card) => {
      if (!card.isBasicEnergy && card.category !== 'energy' && card.quantity > 4) {
        warnings.push(`${card.name} dépasse la limite de 4 exemplaires.`);
      }
    });

    setMessages(warnings);
  };

  const copyDeckList = async () => {
    const lines = deckCards.map((card) => `${card.quantity}x ${card.name}`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMessage('Deck copié !');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      setCopyMessage('Copie impossible');
    }
  };

  const exportDeckList = () => {
    const rows = [
      `Deck: ${activeDeck?.name || 'Deck'}`,
      `Total: ${deckCards.reduce((sum, card) => sum + card.quantity, 0)} cartes`,
      `Valeur estimée: ${formatEuro(deckCards.reduce((sum, card) => sum + estimateCardValue(card), 0))}`,
      '',
      ...deckCards.map((card) => `${card.quantity}x ${card.name} [${card.category}]`)
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeDeck?.name || 'deck').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeckRename = (value) => {
    if (!activeDeck) return;
    const nextValue = value || 'Deck sans nom';
    setDecks((prev) =>
      prev.map((deck) => (deck.id === activeDeck.id ? { ...deck, name: nextValue } : deck))
    );
  };

  const handleCreateDeck = () => {
    const newDeck = baseDeck(`Deck ${decks.length + 1}`);
    setDecks((prev) => [...prev, newDeck]);
    setActiveDeckId(newDeck.id);
  };

  const handleDeleteDeck = (deckId) => {
    if (decks.length <= 1) return;
    const remaining = decks.filter((deck) => deck.id !== deckId);
    setDecks(remaining);
    if (deckId === activeDeckId) {
      setActiveDeckId(remaining[0]?.id || null);
    }
  };

  const totalCards = useMemo(
    () => deckCards.reduce((sum, card) => sum + card.quantity, 0),
    [deckCards]
  );

  const deckValue = useMemo(
    () => deckCards.reduce((sum, card) => sum + estimateCardValue(card), 0),
    [deckCards]
  );

  const categoryBreakdown = useMemo(() => {
    return deckCards.reduce(
      (acc, card) => {
        const category = card.category || 'pokemon';
        acc[category] = (acc[category] || 0) + card.quantity;
        return acc;
      },
      { pokemon: 0, trainer: 0, energy: 0 }
    );
  }, [deckCards]);

  const availableTypes = useMemo(() => {
    console.log('Computing availableTypes from userCards:', userCards.length, 'cards');
    const typeSet = new Set();
    userCards.forEach((card) => {
      const types = card.types || card.card_types || [];
      if (Array.isArray(types)) {
        types.forEach((type) => {
          if (type) {
            const normalizedType = String(type).toLowerCase();
            console.log('Found type:', normalizedType, 'from card:', card.card_name);
            typeSet.add(normalizedType);
          }
        });
      }
    });
    console.log('Available types:', Array.from(typeSet));
    return typeSet;
  }, [userCards]);

  const filteredUserCards = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    console.log('Filtering with typeFilter:', typeFilter);
    const filtered = userCards.filter((card) => {
      const identifier = resolveCardId(card);
      if (!identifier) {
        return false;
      }

      const name = (card.card_name || card.name || '').toLowerCase();
      const setName = (card.set_name || card.set?.name || '').toLowerCase();
      const matchesSearch =
        !lowerSearch || name.includes(lowerSearch) || setName.includes(lowerSearch);
      if (!matchesSearch) {
        return false;
      }

      if (typeFilter === 'all') return true;
      const types = card.types || card.card_types || [];
      if (!Array.isArray(types)) {
        console.log('Card has no types array:', card.card_name);
        return false;
      }
      const hasType = types.some(type => String(type).toLowerCase() === typeFilter);
      if (typeFilter !== 'all') {
        console.log('Card:', card.card_name, 'types:', types, 'matches filter:', hasType);
      }
      return hasType;
    });
    console.log('Filtered cards:', filtered.length, 'out of', userCards.length);
    return filtered;
  }, [userCards, searchTerm, typeFilter]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="user-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Pokémon TCG Binder</h2>
          <div className="user-info">
            <div className="user-avatar">{user.username?.charAt(0).toUpperCase() || 'U'}</div>
            <span className="username">{user.username}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/user')}>
            <span className="nav-icon" aria-hidden="true">
              🏠
            </span>
            Mon profil
          </button>
          <button className="nav-item" onClick={() => navigate('/mes-cartes')}>
            <span className="nav-icon" aria-hidden="true">
              🃏
            </span>
            Mes cartes
          </button>
          <button className="nav-item" onClick={() => navigate('/cartes')}>
            <span className="nav-icon" aria-hidden="true">
              📑
            </span>
            Listing des cartes
          </button>
          <button className="nav-item" onClick={() => navigate('/mes-binders')}>
            <span className="nav-icon" aria-hidden="true">
              📚
            </span>
            Mes binders
          </button>
          <button className="nav-item active">
            <span className="nav-icon" aria-hidden="true">
              🎴
            </span>
            Créer un deck
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <span className="nav-icon" aria-hidden="true">
              🚪
            </span>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-container deck-builder">
          <div className="deck-tabs">
            {decks.map((deck) => {
              const count = (deck.cards || []).reduce((sum, card) => sum + card.quantity, 0);
              return (
                <button
                  type="button"
                  key={deck.id}
                  className={`deck-tab ${deck.id === activeDeck?.id ? 'active' : ''}`}
                  onClick={() => setActiveDeckId(deck.id)}
                >
                  <span>{deck.name}</span>
                  <span className="deck-tab-count">{count}/60</span>
                  {decks.length > 1 && (
                    <span
                      className="deck-tab-delete"
                      role="button"
                      tabIndex={0}
                      aria-label={`Supprimer ${deck.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleDeleteDeck(deck.id);
                        }
                      }}
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}
            <button type="button" className="deck-tab add" onClick={handleCreateDeck}>
              + Nouveau deck
            </button>
          </div>

          <div className="deck-header">
            <div className="deck-header-copy">
              <button
                type="button"
                className="btn btn-secondary deck-back-btn"
                onClick={() => navigate('/mes-binders')}
              >
                ← Retour
              </button>
              <h1>Créer un deck</h1>
              <p>Composez un deck conforme aux règles officielles du JCC Pokémon.</p>
            </div>

            <div className="deck-header-actions">
              <input
                className="deck-name-input"
                value={activeDeck?.name || ''}
                onChange={(event) => handleDeckRename(event.target.value)}
                placeholder="Nom du deck"
              />
              <button type="button" className="btn btn-secondary" onClick={copyDeckList}>
                Copier la liste
              </button>
              <button type="button" className="btn" onClick={exportDeckList}>
                Exporter (.txt)
              </button>
            </div>
          </div>

          {copyMessage && <p className="copy-feedback">{copyMessage}</p>}

          {messages.length > 0 && (
            <div className="deck-messages" role="alert">
              <ul>
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="deck-summary">
            <div
              className={`summary-chip ${
                totalCards === MAX_DECK_SIZE ? 'valid' : totalCards > MAX_DECK_SIZE ? 'warning' : ''
              }`}
            >
              <p className="summary-label">Cartes totales</p>
              <strong>
                {totalCards} / {MAX_DECK_SIZE}
              </strong>
            </div>
            {CATEGORY_OPTIONS.map((category) => (
              <div key={category.value} className="summary-chip">
                <p className="summary-label">{category.label}</p>
                <strong>{categoryBreakdown[category.value] || 0}</strong>
              </div>
            ))}
            <div className="summary-chip">
              <p className="summary-label">Valeur estimée</p>
              <strong>{formatEuro(deckValue)}</strong>
            </div>
          </div>

          <div className="deck-builder-grid">
            <section className="cards-panel">
              <div className="panel-header">
                <div>
                  <h3>Mes cartes</h3>
                  <p>Cliquer sur une carte pour l’ajouter au deck.</p>
                </div>
                <span>{filteredUserCards.length} cartes</span>
              </div>

              <div className="card-picker-header">
                <input
                  type="search"
                  placeholder="Rechercher par nom ou extension"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="type-filters">
                <button
                  type="button"
                  className={`type-chip ${typeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTypeFilter('all')}
                >
                  Tous les types
                </button>
                {TYPE_CONFIG.map((type) => {
                  const isActive = typeFilter === type.id;
                  const isAvailable = availableTypes.has(type.id);
                  return (
                    <button
                      type="button"
                      key={type.id}
                      className={`type-chip ${isActive ? 'active' : ''}`}
                      disabled={!isAvailable}
                      style={
                        isActive
                          ? {
                              background: `linear-gradient(135deg, ${type.colors[0]}, ${type.colors[1]})`,
                              borderColor: 'transparent',
                              color: '#fff'
                            }
                          : undefined
                      }
                      onClick={() => setTypeFilter(type.id)}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>

              <div className="card-picker-grid">
                {filteredUserCards.length === 0 && (
                  <div className="empty-state">
                    Aucune carte ne correspond à votre recherche.
                  </div>
                )}
                {filteredUserCards.map((card) => {
                  const identifier = resolveCardId(card);
                  if (!identifier) {
                    return null;
                  }
                  const imageSrc = getCardImage(card);
                  return (
                    <div
                      key={identifier}
                      className="card-picker-item"
                      onClick={() => addCardToDeck(card)}
                    >
                      <img
                        src={imageSrc}
                        alt={card.card_name || card.name}
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <div>
                        <h4>{card.card_name || card.name}</h4>
                        <p>{card.set_name || card.set?.name || 'Extension inconnue'}</p>
                        <p>Disponibles : {card.quantity || 1}</p>
                      </div>
                      <div className="card-picker-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={(event) => {
                            event.stopPropagation();
                            addCardToDeck(card);
                          }}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="deck-panel">
              <div className="panel-header">
                <div>
                  <h3>Contenu du deck</h3>
                  <p>
                    {totalCards} / {MAX_DECK_SIZE} cartes
                  </p>
                </div>
                <span>{formatEuro(deckValue)}</span>
              </div>

              <div className="deck-panel-inner">
                {deckCards.length === 0 ? (
                  <div className="empty-state">
                    Sélectionnez des cartes pour composer votre deck.
                  </div>
                ) : (
                  <div className="deck-list">
                    {deckCards.map((entry) => {
                      const sourceCard = getCardById(entry.cardId) || {};
                      const imageSrc = getCardImage(sourceCard);
                      return (
                        <div className="deck-card" key={entry.cardId}>
                          <img
                            src={imageSrc}
                            alt={entry.name}
                            onError={(event) => {
                              event.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="deck-card-info">
                            <h4>{entry.name}</h4>
                            <p>
                              {entry.category === 'pokemon'
                                ? 'Pokémon'
                                : entry.category === 'trainer'
                                ? 'Dresseur'
                                : 'Énergie'}
                            </p>
                            {sourceCard.set_name && <p>{sourceCard.set_name}</p>}
                          </div>
                          <div className="deck-card-actions">
                            <button
                              type="button"
                              aria-label="Retirer un exemplaire"
                              onClick={() => updateCardQuantity(entry.cardId, -1)}
                            >
                              −
                            </button>
                            <span>{entry.quantity}</span>
                            <button
                              type="button"
                              aria-label="Ajouter un exemplaire"
                              onClick={() => updateCardQuantity(entry.cardId, 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="deck-remove"
                            aria-label="Supprimer la carte du deck"
                            onClick={() => removeCard(entry.cardId)}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
