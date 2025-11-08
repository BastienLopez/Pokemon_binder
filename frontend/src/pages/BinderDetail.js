import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import binderService from '../services/binderService';
import TCGdexService from '../services/tcgdexService';
import UserCardsService from '../services/userCardsService';
import Notification from '../components/Notification';
import DraggableCard from '../components/DraggableCard';
import DroppableSlot from '../components/DroppableSlot';
import CardDetailModal from '../components/CardDetailModal';
import CardComparison from '../components/CardComparison';
import useCardComparison from '../hooks/useCardComparison';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { PLACEHOLDER_IMAGE, isPlaceholderImage } from '../utils/assets';
import { estimateCardValue, formatEuro } from '../utils/value';
import './BinderDetail.css';
import './UserDashboard.css';

const BinderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [binder, setBinder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userCollectionMap, setUserCollectionMap] = useState({});
  const [binderInsights, setBinderInsights] = useState({ cards: 0, value: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [selectedCardForDetail, setSelectedCardForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    selectedCards: comparisonCards,
    isComparisonOpen,
    addCardToComparison,
    removeCardFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    isCardSelected,
    hasCards: hasComparisonCards,
    canCompare
  } = useCardComparison();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleCardMove = useCallback(async (sourceSlot, targetSlot, card) => {
    try {
      const moveData = {
        source_page: sourceSlot.page,
        source_position: sourceSlot.position,
        destination_page: targetSlot.page,
        destination_position: targetSlot.position
      };

      const updatedBinder = await binderService.moveCardInBinder(id, moveData);
      setBinder(updatedBinder);
      showNotification('Carte déplacée avec succès !', 'success');
    } catch (err) {
      console.error('Erreur lors du déplacement:', err);
      showNotification(err.message || 'Erreur lors du déplacement de la carte', 'error');
    }
  }, [id]);

  const { dragState, handlers } = useDragAndDrop(handleCardMove, binder);

  useEffect(() => {
    document.addEventListener('keydown', handlers.onKeyDown);
    return () => {
      document.removeEventListener('keydown', handlers.onKeyDown);
    };
  }, [handlers.onKeyDown]);

  useEffect(() => {
    loadBinder();
  }, [id]);

  useEffect(() => {
    if (user) {
      loadUserCards();
    }
  }, [user]);

  useEffect(() => {
    if (binder) {
      computeBinderInsights(binder);
    }
  }, [binder, userCollectionMap]);

  const loadBinder = async () => {
    try {
      setLoading(true);
      setError('');
      const binderData = await binderService.getBinderById(id);
      setBinder(binderData);
    } catch (err) {
      console.error('Erreur lors du chargement du binder:', err);
      setError(err.message || 'Erreur lors du chargement du binder');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCards = async () => {
    try {
      const cards = await UserCardsService.getUserCards();
      const map = {};
      cards.forEach((card) => {
        const cardId = card.card_id || card.id || card._id;
        if (cardId) {
          map[cardId] = card;
        }
      });
      setUserCollectionMap(map);
    } catch (err) {
      console.error('Erreur lors du chargement de la collection utilisateur:', err);
    }
  };

  const computeBinderInsights = (binderData) => {
    if (!binderData?.pages) {
      setBinderInsights({ cards: 0, value: 0 });
      return;
    }
    let cardCount = 0;
    let totalValue = 0;

    binderData.pages.forEach((page) => {
      page.slots?.forEach((slot) => {
        if (!slot.card_id) return;
        cardCount += 1;
        const userCardMeta = userCollectionMap[slot.card_id];
        totalValue += estimateCardValue(userCardMeta || slot);
      });
    });

    setBinderInsights({
      cards: cardCount,
      value: Number(totalValue.toFixed(2))
    });
  };

  const copyBinderLink = async () => {
    if (!binder) return;
    const basePath = process.env.PUBLIC_URL || '';
    const shareUrl = `${window.location.origin}${basePath}/binder/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: binder.name,
          url: shareUrl
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showNotification('Lien du binder copié dans le presse-papier', 'success');
      }
    } catch (err) {
      console.error('Erreur lors du partage du binder:', err);
      showNotification('Impossible de partager le binder', 'error');
    }
  };

  const getCardImageUrl = (slot) => {
    console.log('getCardImageUrl - slot data:', slot);
    
    // Vérifier si card_image existe et est valide
    if (slot.card_image && !isPlaceholderImage(slot.card_image)) {
      console.log('slot.card_image found:', slot.card_image);
      
      // Si c'est une URL TCGdex sans /high.webp, l'ajouter
      if (slot.card_image.includes('assets.tcgdex.net') && !slot.card_image.endsWith('.webp')) {
        const fixedUrl = `${slot.card_image}/high.webp`;
        console.log('Fixed TCGdex URL:', fixedUrl);
        return fixedUrl;
      }
      
      // Sinon retourner l'URL telle quelle
      return slot.card_image;
    }

    // Construire l'URL depuis card_id si card_image n'existe pas
    if (slot.card_id) {
      const [setId, number] = slot.card_id.split('-');
      if (setId && number) {
        const serie = setId.replace(/[0-9]+$/, '') || setId;
        const url = `https://assets.tcgdex.net/fr/${serie}/${setId}/${number}/high.webp`;
        console.log('Constructed URL from card_id:', url);
        return url;
      }
    }

    console.log('Using PLACEHOLDER_IMAGE');
    return PLACEHOLDER_IMAGE;
  };

  const openCardDetail = (card) => {
    const meta = userCollectionMap[card.card_id] || card;
    setSelectedCardForDetail(meta);
    setIsDetailModalOpen(true);
  };

  const closeCardDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedCardForDetail(null);
  };

  const handleAddToComparison = (card) => {
    addCardToComparison(card);
    showNotification(`${card.card_name || card.name} ajoutée à la comparaison`, 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Pokémon TCG Binder</h2>
        <div className="user-info">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <span className="username">{user?.username}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item" onClick={() => navigate('/user')}>
          <span className="nav-icon" aria-hidden="true">{'\u{1F3E0}'}</span>
          Mon Profil
        </button>
        <button className="nav-item" onClick={() => navigate('/user#mes-cartes')}>
          <span className="nav-icon" aria-hidden="true">{'\u{1F0CF}'}</span>
          Mes Cartes
        </button>
        <button className="nav-item" onClick={() => navigate('/user#listing')}>
          <span className="nav-icon" aria-hidden="true">{'\u{1F4D1}'}</span>
          Listing des Cartes
        </button>
        <button className="nav-item active" onClick={() => navigate('/user#mes-binders')}>
          <span className="nav-icon" aria-hidden="true">{'\u{1F4DA}'}</span>
          Mes Binders
        </button>
        <button className="nav-item" onClick={() => navigate('/deck-builder')}>
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
  );

  const renderPageNavigation = () => (
    <div className="binder-navigation">
      <div className="page-controls">
        <button
          className="nav-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        >
          ← Page précédente
        </button>
        <div className="page-info">
          <span>Page {currentPage} sur {binder.total_pages}</span>
        </div>
        <button
          className="nav-btn"
          disabled={currentPage === binder.total_pages}
          onClick={() => setCurrentPage((prev) => Math.min(binder.total_pages, prev + 1))}
        >
          Page suivante →
        </button>
        <button className="btn btn-primary add-page-btn" onClick={handleAddPage}>
          Ajouter une page
        </button>
      </div>
    </div>
  );

  const handleAddPage = async () => {
    try {
      const updatedBinder = await binderService.addPageToBinder(id);
      setBinder(updatedBinder);
      setCurrentPage(updatedBinder.total_pages);
      showNotification('Nouvelle page ajoutée !', 'success');
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Erreur lors de l’ajout de page', 'error');
    }
  };

  const handleAddCards = () => {
    navigate(`/mes-cartes?id_binder=${id}&user_id=${user?.id}`);
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <Sidebar />
        <div className="main-content">
          <div className="content-container">
            <div className="binder-detail loading-container">
              <div className="loading-spinner large"></div>
              <p>Chargement du binder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <Sidebar />
        <div className="main-content">
          <div className="content-container">
            <div className="binder-detail error-container">
              <div className="error-icon">⚠️</div>
              <h3>Erreur de chargement</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadBinder}>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!binder) {
    return null;
  }

  console.log('DEBUG - Pages structure:', binder.pages);
  console.log('DEBUG - currentPage value:', currentPage, 'type:', typeof currentPage);
  
  // Trouver la page en comparant page_number (backend) avec currentPage (frontend)
  const currentPageData = binder.pages?.find((page) => {
    console.log('DEBUG - Checking page:', page, 'page.page_number:', page.page_number, 'page.number:', page.number);
    // Le backend utilise "page_number", pas "number"
    return Number(page.page_number || page.number) === Number(currentPage);
  });
  
  const gridSize = binder.size?.split('x') || ['3', '3'];
  const rows = Number(gridSize[0]);
  const cols = Number(gridSize[1]);

  console.log('BinderDetail - Render data:', {
    binder: binder,
    currentPage,
    currentPageData,
    pages: binder.pages,
    slotsCount: currentPageData?.slots?.length,
    gridSize: binder.size,
    rows,
    cols
  });

  return (
    <div className="user-dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <div className="binder-detail">
            <div className="binder-header">
              <div className="binder-title">
                <h1>{binder.name}</h1>
                {binder.description && <p>{binder.description}</p>}
              </div>
              <div className="binder-actions">
                <div className="binder-insights">
                  <span>{binder.pages?.length || 0} pages</span>
                  <span>{binderInsights.cards} cartes</span>
                  <span>{formatEuro(binderInsights.value)}</span>
                </div>
                <button className="btn btn-secondary" onClick={copyBinderLink}>
                  Partager ce binder
                </button>
                <button className="btn btn-primary" onClick={handleAddCards}>
                  Ajouter des cartes
                </button>
              </div>
            </div>

            {renderPageNavigation()}

            <div
              className="card-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
              }}
            >
              {!currentPageData ? (
                <div className="empty-state">Aucune page trouvée</div>
              ) : !currentPageData.slots ? (
                <div className="empty-state">Aucun slot sur cette page</div>
              ) : (
                currentPageData.slots.map((slot, index) => {
                  const enrichedSlot = { ...slot, page: currentPage, position: index };
                  const isDropTarget =
                    dragState.dropTarget &&
                    dragState.dropTarget.page === currentPage &&
                    dragState.dropTarget.position === index;

                  return (
                    <DroppableSlot
                      key={index}
                      slot={enrichedSlot}
                      isDropTarget={isDropTarget}
                      onDragOver={handlers.onDragOver}
                      onDragEnter={handlers.onDragEnter}
                      onDragLeave={handlers.onDragLeave}
                      onDrop={handlers.onDrop}
                      onClick={() => slot.card_id && openCardDetail(slot)}
                    >
                      {slot.card_id && (
                        <DraggableCard
                          card={{
                            card_id: slot.card_id,
                            card_name: slot.card_name || `Carte ${slot.card_id}`,
                            user_card_id: slot.user_card_id
                          }}
                          slot={enrichedSlot}
                          imageUrl={getCardImageUrl(slot)}
                          isDragging={
                            dragState.isDragging &&
                            dragState.draggedSlot?.page === currentPage &&
                            dragState.draggedSlot?.position === index
                          }
                          onDragStart={handlers.onDragStart}
                          onDragEnd={handlers.onDragEnd}
                          onRemove={handleRemoveCard}
                          onCardClick={() => openCardDetail(slot)}
                          onAddToComparison={handleAddToComparison}
                          isSelectedForComparison={isCardSelected(slot.card_id)}
                        />
                      )}
                    </DroppableSlot>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {canCompare && (
        <button className="comparison-fab" onClick={openComparison}>
          📊 Comparer ({comparisonCards.length})
        </button>
      )}

      {isDetailModalOpen && selectedCardForDetail && (
        <CardDetailModal
          card={selectedCardForDetail}
          isOpen={isDetailModalOpen}
          onClose={closeCardDetail}
        />
      )}

      <CardComparison
        selectedCards={comparisonCards}
        isOpen={isComparisonOpen}
        onClose={closeComparison}
        onRemoveCard={removeCardFromComparison}
        onClearComparison={clearComparison}
      />

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );

  function handleRemoveCard(page, position) {
    binderService.removeCardFromBinder(id, { page, position })
      .then((updatedBinder) => {
        setBinder(updatedBinder);
        showNotification('Carte retirée du binder', 'success');
      })
      .catch((err) => {
        console.error(err);
        showNotification(err.message || 'Erreur lors du retrait de la carte', 'error');
      });
  }
};

export default BinderDetail;
