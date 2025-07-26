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
      // Créer une image personnalisée pour le drag avec taille réduite de 50%
      const img = e.currentTarget.querySelector('.card-image');
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          // Obtenir les dimensions réelles de l'image affichée
          const imgRect = img.getBoundingClientRect();
          const actualWidth = Math.max(imgRect.width, 80); // Minimum 80px
          const actualHeight = Math.max(imgRect.height, 112); // Minimum 112px
          
          // Diviser les dimensions par 2
          const dragWidth = Math.floor(actualWidth * 0.5);
          const dragHeight = Math.floor(actualHeight * 0.5);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Utiliser les dimensions réduites de moitié
            canvas.width = dragWidth;
            canvas.height = dragHeight;
            
            // Dessiner l'image directement depuis l'élément HTML
            ctx.drawImage(img, 0, 0, dragWidth, dragHeight);
            
            // Définir l'image de drag personnalisée avec offset au centre
            e.dataTransfer.setDragImage(canvas, Math.floor(dragWidth / 2), Math.floor(dragHeight / 2));
          }
        } catch (error) {
          console.log('Erreur lors de la création de l\'image de drag:', error);
        }
      }
      
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
