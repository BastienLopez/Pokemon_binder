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
        
        {/* Bouton de suppression juste en dessous de l'image */}
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
        
        {/* Overlay avec indicateur de drag */}
        {!isPreviewMode && (
          <div className="card-overlay">
            {/* Indicateur de drag */}
            <div className="drag-handle" title="Cliquez et glissez pour déplacer">
              <span className="drag-icon">⌘</span>
            </div>
          </div>
        )}
        
        {/* Indicateur de drag en cours */}
        {isDragging && (
          <div className="drag-indicator">
            <span className="drag-text">Déplacement...</span>
          </div>
        )}
      </div>
      
      {/* Informations de la carte */}
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
