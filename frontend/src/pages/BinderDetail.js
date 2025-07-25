import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import binderService from '../services/binderService';
import Notification from '../components/Notification';
import './BinderDetail.css';

const BinderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [binder, setBinder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

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

  if (loading) {
    return (
      <div className="binder-detail">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Chargement du binder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="binder-detail">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={loadBinder}>
              🔄 Réessayer
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/mes-binders')}>
              ← Retour aux binders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!binder) {
    return (
      <div className="binder-detail">
        <div className="error-container">
          <div className="error-icon">📂</div>
          <h3>Binder non trouvé</h3>
          <p>Le binder demandé n'existe pas ou a été supprimé.</p>
          <button className="btn btn-primary" onClick={() => navigate('/mes-binders')}>
            ← Retour aux binders
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = binder.pages[currentPage - 1];
  const { rows, cols } = getGridDimensions(binder.size);

  return (
    <div className="binder-detail">
      <div className="binder-header">
        <div className="header-nav">
          <button 
            className="back-btn"
            onClick={() => navigate('/mes-binders')}
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
        </div>
        
        <button className="btn btn-primary" onClick={handleAddPage}>
          ➕ Ajouter une page
        </button>
      </div>

      <div className="binder-page">
        <div className="page-header">
          <h3>Page {currentPage}</h3>
        </div>
        
        <div 
          className={`card-grid grid-${binder.size.replace('x', '-')}`}
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {currentPageData?.slots.map((slot, index) => (
            <div key={index} className="card-slot">
              {slot.card_id ? (
                <div className="card-container">
                  <img
                    src={`https://assets.tcgdx.net/fr/sv/sv1/${slot.card_id}/low.webp`}
                    alt={`Carte ${slot.card_id}`}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-card.png';
                    }}
                  />
                  <div className="card-overlay">
                    <button
                      className="remove-card-btn"
                      onClick={() => handleRemoveCard(currentPage, index)}
                      title="Retirer cette carte"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="empty-slot" 
                  onClick={() => handleSlotClick(currentPage, index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="slot-placeholder">
                    <span className="slot-icon">➕</span>
                    <span className="slot-text">Slot vide</span>
                  </div>
                </div>
              )}
              <div className="slot-number">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="binder-actions">
        <button className="btn btn-secondary" onClick={handleEditBinder}>
          ✏️ Modifier le binder
        </button>
        <button className="btn btn-primary" onClick={handleAddCards}>
          🃏 Ajouter des cartes
        </button>
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
};

export default BinderDetail;
