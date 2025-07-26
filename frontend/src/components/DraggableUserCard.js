import React, { memo } from 'react';
import './DraggableUserCard.css';

/**
 * Composant pour une carte de la collection utilisateur pouvant être glissée vers un binder
 */
const DraggableUserCard = memo(({ 
  userCard, 
  imageUrl, 
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
  isSelected = false,
  binderMode = false
}) => {
  const handleDragStart = (e) => {
    if (onDragStart && binderMode) {
      const dragData = {
        type: 'user-card',
        userCard,
        sourceType: 'collection'
      };
      
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'copy';
      
      onDragStart(e, userCard);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(userCard);
    }
  };

  return (
    <div 
      className={`draggable-user-card ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${binderMode ? 'binder-mode' : ''}`}
      draggable={binderMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="card-content">
        <img
          src={imageUrl}
          alt={userCard.card_name || `Carte ${userCard.card_id}`}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder-card.png';
            e.target.alt = 'Image non disponible';
          }}
          draggable={false}
        />
        
        {/* Badge de quantité */}
        {userCard.quantity > 1 && (
          <div className="quantity-badge">
            {userCard.quantity}
          </div>
        )}
        
        {/* Badge de condition */}
        {userCard.condition && userCard.condition !== 'nm' && (
          <div className="condition-badge">
            {userCard.condition.toUpperCase()}
          </div>
        )}
        
        {/* Overlay pour mode binder */}
        {binderMode && (
          <div className="binder-mode-overlay">
            <div className="drag-indicator">
              <span className="drag-icon">⌘</span>
              <span className="drag-text">Glisser vers binder</span>
            </div>
          </div>
        )}
        
        {/* Overlay de sélection */}
        {isSelected && (
          <div className="selection-overlay">
            <div className="selection-indicator">
              <span className="selection-icon">✓</span>
            </div>
          </div>
        )}
        
        {/* Indicateur de drag en cours */}
        {isDragging && (
          <div className="drag-active-indicator">
            <span className="drag-active-text">Déplacement...</span>
          </div>
        )}
      </div>
      
      {/* Informations de la carte */}
      <div className="card-info">
        <div className="card-name" title={userCard.card_name}>
          {userCard.card_name}
        </div>
        {userCard.set_name && (
          <div className="card-set" title={userCard.set_name}>
            {userCard.set_name}
          </div>
        )}
      </div>
    </div>
  );
});

DraggableUserCard.displayName = 'DraggableUserCard';

export default DraggableUserCard;
