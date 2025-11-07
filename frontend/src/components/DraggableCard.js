import React, { memo } from 'react';
import './DraggableCard.css';
import { PLACEHOLDER_IMAGE } from '../utils/assets';

const DraggableCard = memo(({
  card,
  slot,
  imageUrl,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onRemove,
  isPreviewMode = false,
  onCardClick,
  onAddToComparison,
  isSelectedForComparison = false
}) => {
  const handleDragStart = (event) => {
    if (onDragStart) {
      onDragStart(event, card, slot);
    }
  };

  const handleDragEnd = (event) => {
    if (onDragEnd) {
      onDragEnd(event);
    }
  };

  const handleRemoveClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (onRemove) {
      onRemove(slot.page, slot.position);
    }
  };

  const handleCardClick = (event) => {
    if (isDragging) return;
    event.stopPropagation();
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleAddToComparisonClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isSelectedForComparison || !onAddToComparison) {
      return;
    }
    onAddToComparison(card);
  };

  return (
    <div
      className={`draggable-card ${isDragging ? 'dragging' : ''} ${isPreviewMode ? 'preview-mode' : ''} ${isSelectedForComparison ? 'selected-for-comparison' : ''}`}
      draggable={!isPreviewMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="card-content" onClick={handleCardClick}>
        <img
          src={imageUrl}
          alt={card.card_name || `Carte ${card.card_id}`}
          className="card-image"
          loading="lazy"
          onError={(event) => {
            event.target.src = PLACEHOLDER_IMAGE;
            event.target.alt = 'Image non disponible';
          }}
          draggable={false}
        />

        {!isPreviewMode && (
          <div className="card-overlay">
            <div className="drag-handle" title="Cliquez et glissez pour déplacer">
              <span className="drag-icon">⠿</span>
            </div>

            {onAddToComparison && (
              <button
                className={`comparison-btn ${isSelectedForComparison ? 'selected' : ''}`}
                onClick={handleAddToComparisonClick}
                title={isSelectedForComparison ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
                type="button"
                disabled={isSelectedForComparison}
              >
                {isSelectedForComparison ? '✔' : '⇄'}
              </button>
            )}
          </div>
        )}

        {isDragging && (
          <div className="drag-indicator">
            <span className="drag-text">Déplacement...</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="card-info">
          <span className="card-name" title={card.card_name}>
            {card.card_name}
          </span>
        </div>

        {!isPreviewMode && onRemove && (
          <button
            className="remove-card-btn-bottom"
            onClick={handleRemoveClick}
            title="Retirer cette carte"
            type="button"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
});

DraggableCard.displayName = 'DraggableCard';

export default DraggableCard;
