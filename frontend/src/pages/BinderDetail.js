import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import binderService from '../services/binderService';
import TCGdexService from '../services/tcgdexService';
import Notification from '../components/Notification';
import DraggableCard from '../components/DraggableCard';
import DroppableSlot from '../components/DroppableSlot';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import './BinderDetail.css';
import './UserDashboard.css'; // Importer les styles de la sidebar

const BinderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [binder, setBinder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Callback pour gérer le déplacement de carte par drag & drop
  const handleCardMove = useCallback(async (sourceSlot, targetSlot, card) => {
    try {
      console.log('🎯 [BinderDetail] Déplacement de carte:', {
        from: sourceSlot,
        to: targetSlot,
        card
      });

      // Appel API pour déplacer la carte
      const moveData = {
        source_page: sourceSlot.page,
        source_position: sourceSlot.position,
        destination_page: targetSlot.page,
        destination_position: targetSlot.position
      };

      const updatedBinder = await binderService.moveCardInBinder(id, moveData);
      setBinder(updatedBinder);
      
      showNotification('✅ Carte déplacée avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ [BinderDetail] Erreur lors du déplacement:', error);
      showNotification(error.message || 'Erreur lors du déplacement de la carte', 'error');
    }
  }, [id]);

  // Hook pour le drag & drop
  const { dragState, handlers } = useDragAndDrop(handleCardMove, binder);

  // Gestion du clavier pour annulation
  useEffect(() => {
    document.addEventListener('keydown', handlers.onKeyDown);
    return () => {
      document.removeEventListener('keydown', handlers.onKeyDown);
    };
  }, [handlers.onKeyDown]);

  useEffect(() => {
    loadBinder();
  }, [id]);

  const loadBinder = async () => {
    try {
      setLoading(true);
      setError('');
      const binderData = await binderService.getBinderById(id);
      setBinder(binderData);
    } catch (error) {
      console.error('Erreur lors du chargement du binder:', error);
      setError(error.message || 'Erreur lors du chargement du binder');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = async () => {
    try {
      const updatedBinder = await binderService.addPageToBinder(id);
      setBinder(updatedBinder);
      setCurrentPage(updatedBinder.total_pages);
      showNotification('📄 Nouvelle page ajoutée !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de page:', error);
      showNotification(error.message || 'Erreur lors de l\'ajout de la page', 'error');
    }
  };

  const handleRemoveCard = async (pageNumber, position) => {
    try {
      const updatedBinder = await binderService.removeCardFromBinder(id, {
        page_number: pageNumber,
        position: position
      });
      setBinder(updatedBinder);
      showNotification('🗑️ Carte retirée du binder', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de carte:', error);
      showNotification(error.message || 'Erreur lors de la suppression de la carte', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleEditBinder = () => {
    // TODO: Implémenter l'édition du binder
    console.log('Édition du binder:', binder);
    showNotification('🚧 Fonction d\'édition en cours de développement', 'info');
  };

  const handleAddCards = () => {
    // Console logs pour déboguer
    console.log('🎯 BinderDetail - handleAddCards appelé');
    console.log('🆔 Binder ID:', id);
    console.log('👤 User ID:', user?.id);
    
    // Naviguer vers la page de sélection de cartes avec l'ID du binder dans l'URL
    navigate(`/mes-cartes?id_binder=${id}&user_id=${user?.id}`);
  };

  const handleSlotClick = (pageNumber, position) => {
    // TODO: Ouvrir un modal de sélection de carte ou naviguer vers les cartes
    console.log('Clic sur slot:', { pageNumber, position });
    showNotification('🚧 Sélection de carte à implémenter', 'info');
  };

  const getGridDimensions = (size) => {
    switch (size) {
      case '3x3': return { rows: 3, cols: 3 };
      case '4x4': return { rows: 4, cols: 4 };
      case '5x5': return { rows: 5, cols: 5 };
      default: return { rows: 3, cols: 3 };
    }
  };

  const getSizeLabel = (size) => {
    switch (size) {
      case '3x3': return '3×3';
      case '4x4': return '4×4';
      case '5x5': return '5×5';
      default: return size;
    }
  };

  const getCardImageUrl = (slot) => {
    // Console logs pour déboguer les images
    console.log('🖼️ Debug image slot:', slot);
    
    // Priorité à l'image stockée depuis TCGdx
    if (slot.card_image && slot.card_image !== '/placeholder-card.png') {
      const imageUrl = TCGdxService.getHighQualityImageUrl({ image: slot.card_image });
      console.log('✅ Image URL générée depuis card_image:', imageUrl);
      return imageUrl;
    }
    
    // Fallback : construire l'URL depuis card_id selon le format assets.tcgdx.net
    if (slot.card_id) {
      // Parser le card_id pour extraire série et numéro
      // Format: "hgss2-94" -> serie="hgss", set="hgss2", numero="94"
      // Format: "neo4-14" -> serie="neo", set="neo4", numero="14"
      const parts = slot.card_id.split('-');
      if (parts.length >= 2) {
        const setId = parts[0]; // "hgss2", "neo4"
        const cardNumber = parts[1]; // "94", "14"
        
        // Extraire la série de base depuis le set
        let serie = setId;
        if (setId.match(/^hgss/)) {
          serie = 'hgss'; // "hgss2" -> "hgss"
        } else if (setId.match(/^neo/)) {
          serie = 'neo'; // "neo4" -> "neo"
        } else if (setId.match(/^sv/)) {
          serie = 'sv'; // "sv1" -> "sv"
        } else {
          // Pour d'autres formats, garder tel quel
          serie = setId;
        }
        
        // Essayer plusieurs domaines possibles
        const possibleDomains = [
          'https://assets.tcgdex.net',
          'https://assets.tcgdex.dev', 
          'https://tcgdx.dev/assets',
          'https://api.tcgdx.net/v2/assets'
        ];
        
        const imageUrl = `${possibleDomains[0]}/fr/${serie}/${setId}/${cardNumber}/high.webp`;
        console.log('✅ Image URL construite depuis card_id:', imageUrl);
        console.log(`   Card ID: ${slot.card_id} -> Serie: ${serie}, Set: ${setId}, Numero: ${cardNumber}`);
        return imageUrl;
      }
    }
    
    console.log('❌ Pas d\'image card_image ni card_id valide, utilisation du placeholder');
    // Fallback : image par défaut
    return '/placeholder-card.png';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Composant sidebar réutilisable
  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Pokémon TCG Binder</h2>
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="username">{user?.username}</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <button
          className="nav-item"
          onClick={() => navigate(`/user?id=${user?.id}`)}
        >
          <span className="nav-icon">👤</span>
          Mon Profil
        </button>
        
        <button
          className="nav-item"
          onClick={() => navigate(`/user?id=${user?.id}#mes-cartes`)}
        >
          <span className="nav-icon">🃏</span>
          Mes Cartes
        </button>
        
        <button
          className="nav-item"
          onClick={() => navigate(`/user?id=${user?.id}#listing`)}
        >
          <span className="nav-icon">📋</span>
          Listing des Cartes
        </button>
        
        <button
          className="nav-item active"
          onClick={() => navigate(`/user?id=${user?.id}#mes-binders`)}
        >
          <span className="nav-icon">📂</span>
          Mes Binders
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Déconnexion
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="user-dashboard">
        <Sidebar />
        <div className="main-content">
          <div className="content-container">
            <div className="binder-detail">
              <div className="loading-container">
                <div className="loading-spinner large"></div>
                <p>Chargement du binder...</p>
              </div>
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
            <div className="binder-detail">
              <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Erreur de chargement</h3>
                <p>{error}</p>
                <div className="error-actions">
                  <button className="btn btn-primary" onClick={loadBinder}>
                    🔄 Réessayer
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate(`/user?id=${user?.id}#mes-binders`)}>
                    ← Retour aux binders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!binder) {
    return (
      <div className="user-dashboard">
        <Sidebar />
        <div className="main-content">
          <div className="content-container">
            <div className="binder-detail">
              <div className="error-container">
                <div className="error-icon">📂</div>
                <h3>Binder non trouvé</h3>
                <p>Le binder demandé n'existe pas ou a été supprimé.</p>
                <button className="btn btn-primary" onClick={() => navigate(`/user?id=${user?.id}#mes-binders`)}>
                  ← Retour aux binders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPageData = binder.pages[currentPage - 1];
  const { rows, cols } = getGridDimensions(binder.size);

  return (
    <div className="user-dashboard">
      <Sidebar />
      
      {/* Contenu principal du binder */}
      <div className="main-content">
        <div className="content-container">
          <div className="binder-detail">
            <div className="binder-header">
              <div className="header-nav">
                <button 
                  className="btn btn-primary create-btn"
                  onClick={() => navigate(`/user?id=${user?.id}#mes-binders`)}
                >
                  ← Mes binders
                </button>
              </div>
              
              <div className="binder-info">
                <div className="binder-title">
                  <h1>{binder.name}</h1>
                  <div className="binder-badges">
                    <span className="size-badge">{getSizeLabel(binder.size)}</span>
                    {binder.is_public && <span className="public-badge">🌐 Public</span>}
                  </div>
                </div>
                
                {binder.description && (
                  <p className="binder-description">{binder.description}</p>
                )}
                
                <div className="binder-stats">
                  <div className="stat">
                    <span className="stat-icon">🃏</span>
                    <span className="stat-value">{binder.total_cards}</span>
                    <span className="stat-label">cartes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📄</span>
                    <span className="stat-value">{binder.total_pages}</span>
                    <span className="stat-label">pages</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="binder-navigation">
              <div className="page-controls">
                <button 
                  className="nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  ← Page précédente
                </button>
                
                <div className="page-info">
                  <span>Page {currentPage} sur {binder.total_pages}</span>
                </div>
                
                <button 
                  className="nav-btn"
                  disabled={currentPage === binder.total_pages}
                  onClick={() => setCurrentPage(prev => Math.min(binder.total_pages, prev + 1))}
                >
                  Page suivante →
                </button>
                
                <button className="btn btn-primary" onClick={handleAddPage}>
                  Ajouter une page
                </button>
              </div>
            </div>

            <div className="binder-page">
              <div className="page-header">
                <button className="btn btn-primary" onClick={handleEditBinder}>
                  ✏️ Modifier le binder
                </button>
                <h3>Page {currentPage}</h3>
                <button className="btn btn-primary" onClick={handleAddCards}>
                  🃏 Ajouter des cartes
                </button>
              </div>
              
              <div 
                className={`card-grid grid-${binder.size.replace('x', '-')} ${dragState.isDragging ? 'drag-active' : ''}`}
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`
                }}
              >
                {/* Message d'aide pour le drag & drop */}
                <div className="drag-help">
                  💡 Glissez-déposez les cartes pour les réorganiser
                </div>
                
                {currentPageData?.slots.map((slot, index) => {
                  // Enrichir les données du slot pour le drag & drop
                  const enrichedSlot = {
                    ...slot,
                    page: currentPage,
                    position: index
                  };

                  const isDropTarget = dragState.dropTarget && 
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
                      onClick={() => handleSlotClick(currentPage, index)}
                    >
                      {slot.card_id ? (
                        <DraggableCard
                          card={{
                            card_id: slot.card_id,
                            card_name: slot.card_name || `Carte ${slot.card_id}`,
                            user_card_id: slot.user_card_id
                          }}
                          slot={enrichedSlot}
                          imageUrl={getCardImageUrl(slot)}
                          isDragging={dragState.isDragging && 
                            dragState.draggedSlot?.page === currentPage && 
                            dragState.draggedSlot?.position === index}
                          onDragStart={handlers.onDragStart}
                          onDragEnd={handlers.onDragEnd}
                          onRemove={handleRemoveCard}
                        />
                      ) : null}
                    </DroppableSlot>
                  );
                })}
              </div>
            </div>

            <Notification
              show={notification.show}
              message={notification.message}
              type={notification.type}
              onClose={hideNotification}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinderDetail;
