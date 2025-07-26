import React, { memo } from 'react';
import './DroppableSlot.css';

/**
 * Composant pour un slot pouvant recevoir des cartes par drag & drop
 */
const DroppableSlot = memo(({ 
  slot, 
  isDropTarget = false,
  isDragOver = false,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick,
  children,
  disabled = false 
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onDragOver) {
      onDragOver(e, slot);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onDragEnter) {
      onDragEnter(e, slot);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onDragLeave) {
      onDragLeave(e, slot);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onDrop) {
      onDrop(e, slot);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (!disabled && onClick) {
      onClick(slot);
    }
  };

  const slotClasses = [
    'droppable-slot',
    slot.card_id ? 'occupied' : 'empty',
    isDropTarget ? 'drop-target' : '',
    isDragOver ? 'drag-over' : '',
    disabled ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={slotClasses}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-slot-page={slot.page}
      data-slot-position={slot.position}
    >
      {children || (
        <div className="slot-content">
          {slot.card_id ? (
            // Le contenu sera fourni par le parent (DraggableCard)
            <div className="slot-placeholder occupied">
              {/* Contenu géré par le parent */}
            </div>
          ) : (
            // Slot vide
            <div className="slot-placeholder empty">
              <div className="slot-icon">
                {isDropTarget ? '⬇️' : '➕'}
              </div>
              <div className="slot-text">
                {isDropTarget ? 'Déposer ici' : 'Slot vide'}
              </div>
              <div className="slot-number">
                {slot.position + 1}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Indicateur de drop en cours */}
      {isDropTarget && (
        <div className="drop-indicator">
          <div className="drop-animation">
            <span className="drop-icon">⬇️</span>
            <span className="drop-text">Déposer la carte</span>
          </div>
        </div>
      )}
      
      {/* Overlay de survol */}
      {isDragOver && !slot.card_id && (
        <div className="drag-over-overlay">
          <div className="drop-zone-indicator">
            <span className="drop-zone-icon">✨</span>
            <span className="drop-zone-text">Zone de dépôt</span>
          </div>
        </div>
      )}
    </div>
  );
});

DroppableSlot.displayName = 'DroppableSlot';

export default DroppableSlot;
