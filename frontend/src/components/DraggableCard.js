import React, { memo } from 'react';
import './DraggableCard.css';

/**
 * Composant pour une carte pouvant être déplacée par drag & drop
 */
const DraggableCard = memo(({ 
  card, 
  slot, 
  imageUrl, 
  isDragging = false,
  onDragStart,
  onDragEnd,
  onRemove,
  isPreviewMode = false 
}) => {
  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, card, slot);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemove) {
      onRemove(slot.page, slot.position);
    }
  };

  return (
    <div 
      className={`draggable-card ${isDragging ? 'dragging' : ''} ${isPreviewMode ? 'preview-mode' : ''}`}
      draggable={!isPreviewMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="card-content">
        <img
          src={imageUrl}
          alt={card.card_name || `Carte ${card.card_id}`}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder-card.png';
            e.target.alt = 'Image non disponible';
          }}
          draggable={false} // Empêcher le drag de l'image elle-même
        />
        
        {/* Overlay avec actions */}
        {!isPreviewMode && (
          <div className="card-overlay">
            {/* Indicateur de drag */}
            <div className="drag-handle" title="Cliquez et glissez pour déplacer">
              <span className="drag-icon">⌘</span>
            </div>
            
            {/* Bouton de suppression */}
            {onRemove && (
              <button
                className="remove-card-btn"
                onClick={handleRemoveClick}
                title="Retirer cette carte"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        {/* Indicateur de drag en cours */}
        {isDragging && (
          <div className="drag-indicator">
            <span className="drag-text">Déplacement...</span>
          </div>
        )}
      </div>
      
      {/* Informations de la carte (optionnel) */}
      <div className="card-info">
        <span className="card-name" title={card.card_name}>
          {card.card_name}
        </span>
      </div>
    </div>
  );
});

DraggableCard.displayName = 'DraggableCard';

export default DraggableCard;
