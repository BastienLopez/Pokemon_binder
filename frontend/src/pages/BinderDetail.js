import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import binderService from '../services/binderService';
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

const BinderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const loadBinder = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    loadBinder();
  }, [loadBinder]);

  const loadUserCards = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (user) {
      loadUserCards();
    }
  }, [user, loadUserCards]);

  const computeBinderInsights = useCallback((binderData) => {
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
  }, [userCollectionMap]);

  useEffect(() => {
    if (binder) {
      computeBinderInsights(binder);
    }
  }, [binder, computeBinderInsights]);

  useEffect(() => {
    if (!binder) {
      return;
    }
    const pagesCount = binder.total_pages || binder.pages?.length || 1;
    if (currentPage > pagesCount) {
      setCurrentPage(pagesCount);
    }
  }, [binder, currentPage]);

  // moved and memoized above

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

  const renderPageNavigation = (totalPagesValue, currentPageValue) => (
    <div className="binder-navigation">
      <div className="page-controls">
        <button
          className="nav-btn"
          disabled={currentPageValue === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        >
          {'<< Page precedente'}
        </button>
        <div className="page-info">
          <span>Page {currentPageValue} sur {totalPagesValue}</span>
        </div>
        <button
          className="nav-btn"
          disabled={currentPageValue === totalPagesValue}
          onClick={() => setCurrentPage((prev) => Math.min(totalPagesValue, prev + 1))}
        >
          {'Page suivante >>'}
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

  let pageContent = null;
  let totalPages = 1;
  let safePage = currentPage;

  if (loading) {
    pageContent = (
      <div className="binder-detail loading-container">
        <div className="loading-spinner large"></div>
        <p>Chargement du binder...</p>
      </div>
    );
  } else if (error) {
    pageContent = (
      <div className="binder-detail error-container">
        <div className="error-icon">!</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadBinder}>
          Reessayer
        </button>
      </div>
    );
  } else if (binder) {
    const pages = binder.pages || [];
    totalPages = binder.total_pages || pages.length || 1;
    safePage = Math.min(Math.max(1, currentPage), totalPages);
    const currentPageData = pages.find((page, index) => {
      const value = Number(page.page_number ?? page.number ?? index + 1);
      return value === safePage;
    }) || pages[safePage - 1] || null;

    const gridSize = binder.size?.split('x') || ['3', '3'];
    const rows = Number(gridSize[0]);
    const cols = Number(gridSize[1]);

    pageContent = (
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

        {renderPageNavigation(totalPages, safePage)}

        <div
          className="card-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {!currentPageData ? (
            <div className="empty-state">Aucune page trouvee</div>
          ) : !currentPageData.slots ? (
            <div className="empty-state">Aucun slot sur cette page</div>
          ) : (
            currentPageData.slots.map((slot, index) => {
              const enrichedSlot = { ...slot, page: safePage, position: index };
              const isDropTarget =
                dragState.dropTarget &&
                dragState.dropTarget.page === safePage &&
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
                        dragState.draggedSlot?.page === safePage &&
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
    );
  }

  return (
    <>
      {pageContent}
      {canCompare && binder && (
        <button className="comparison-fab" onClick={openComparison}>
          Comparer ({comparisonCards.length})
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
    </>
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
