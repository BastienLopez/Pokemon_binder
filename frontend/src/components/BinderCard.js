import React from 'react';
import './BinderCard.css';

const BinderCard = ({ 
  binder, 
  onView, 
  onEdit, 
  onDelete, 
  onPreview 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSizeLabel = (size) => {
    switch (size) {
      case '3x3':
        return '3×3';
      case '4x4':
        return '4×4';
      case '5x5':
        return '5×5';
      default:
        return size;
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case '3x3':
        return '#27ae60';
      case '4x4':
        return '#3498db';
      case '5x5':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="binder-card" onClick={() => onView && onView(binder)}>
      <div className="binder-header">
        <div className="binder-icon">🗂️</div>
        <div className="binder-meta">
          <span 
            className="binder-size-badge"
            style={{ backgroundColor: getSizeColor(binder.size) }}
          >
            {getSizeLabel(binder.size)}
          </span>
          {binder.is_public && (
            <span className="public-badge" title="Binder public">
              🌐
            </span>
          )}
        </div>
      </div>

      <div className="binder-content">
        <h3 className="binder-name" title={binder.name}>
          {binder.name}
        </h3>
        
        {binder.description && (
          <p className="binder-description" title={binder.description}>
            {binder.description}
          </p>
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

        {binder.preview_cards && binder.preview_cards.length > 0 && (
          <div className="binder-preview">
            <div className="preview-cards">
              {binder.preview_cards.slice(0, 4).map((cardId, index) => (
                <div key={index} className="preview-card">
                  <img
                    src={`https://assets.tcgdx.net/fr/sv/sv1/${cardId}/low.webp`}
                    alt={`Carte ${cardId}`}
                    onError={(e) => {
                      e.target.src = '/placeholder-card.png';
                    }}
                  />
                </div>
              ))}
              {binder.preview_cards.length > 4 && (
                <div className="preview-more">
                  +{binder.preview_cards.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="binder-footer">
        <div className="binder-date">
          <span>Créé le {formatDate(binder.created_at)}</span>
          {binder.updated_at !== binder.created_at && (
            <span className="updated">• Modifié le {formatDate(binder.updated_at)}</span>
          )}
        </div>

        <div className="binder-actions" onClick={(e) => e.stopPropagation()}>
          {onPreview && (
            <button
              className="action-btn preview-btn"
              onClick={() => onPreview(binder)}
              title="Aperçu rapide"
            >
              👁️
            </button>
          )}
          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(binder)}
              title="Modifier"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(binder)}
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinderCard;
