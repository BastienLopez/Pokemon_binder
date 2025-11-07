import React from 'react';
import './BinderCard.css';
import { PLACEHOLDER_IMAGE, isPlaceholderImage } from '../utils/assets';

const BinderCard = ({ 
  binder, 
  onView, 
  onEdit, 
  onDelete, 
  onPreview 
}) => {
  console.log('🎯 [BinderCard] Binder reçu:', binder);
  console.log('🎯 [BinderCard] Preview cards:', binder.preview_cards);
  
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

  const getCardImageUrl = (cardData) => {
    console.log('🔍 [BinderCard] Données de carte reçues:', cardData);
    console.log('🔍 [BinderCard] Type de données:', typeof cardData);
    
    // Si on a une image directe
    if (cardData && cardData.card_image) {
      console.log('✅ [BinderCard] Image directe trouvée:', cardData.card_image);
      return cardData.card_image;
    }
    
    // Si on a un card_id, essayer de construire l'URL
    if (cardData && cardData.card_id) {
      console.log('🔍 [BinderCard] Construction URL pour card_id:', cardData.card_id);
      
      // Parsing du format "série-set-numéro" (ex: "hgss2-94")
      const parts = cardData.card_id.split('-');
      console.log('🔍 [BinderCard] Parts du card_id:', parts);
      
      if (parts.length >= 2) {
        // Pour "hgss2-94" -> série="hgss", setId="hgss2", cardNumber="94"
        const cardNumber = parts[parts.length - 1]; // Le dernier élément est toujours le numéro
        const setId = parts.slice(0, -1).join('-'); // Tout sauf le dernier élément
        
        // Déterminer la série principale (sans le numéro de sous-set)
        let mainSerie = setId;
        // Si c'est un format comme "hgss2", extraire "hgss"
        const serieMatch = setId.match(/^([a-zA-Z]+)/);
        if (serieMatch) {
          mainSerie = serieMatch[1];
        }
        
        console.log('🔍 [BinderCard] Série principale:', mainSerie, 'SetId:', setId, 'Numéro:', cardNumber);
        
        // URL corrigée avec tcgdex (pas tcgdx)
        const imageUrl = `https://assets.tcgdex.net/fr/${mainSerie}/${setId}/${cardNumber}/high.webp`;
        console.log('✅ [BinderCard] Image URL construite depuis card_id:', imageUrl);
        return imageUrl;
      }
    }
    
    // Si on a juste un cardId simple (string), appliquer le même parsing
    if (typeof cardData === 'string') {
      console.log('🔍 [BinderCard] CardData est une string:', cardData);
      
      // Parsing du format "série-set-numéro" (ex: "hgss2-94")
      const parts = cardData.split('-');
      console.log('🔍 [BinderCard] Parts du card_id string:', parts);
      
      if (parts.length >= 2) {
        // Pour "hgss2-94" -> série="hgss", setId="hgss2", cardNumber="94"
        const cardNumber = parts[parts.length - 1]; // Le dernier élément est toujours le numéro
        const setId = parts.slice(0, -1).join('-'); // Tout sauf le dernier élément
        
        // Déterminer la série principale (sans le numéro de sous-set)
        let mainSerie = setId;
        // Si c'est un format comme "hgss2", extraire "hgss"
        const serieMatch = setId.match(/^([a-zA-Z]+)/);
        if (serieMatch) {
          mainSerie = serieMatch[1];
        }
        
        console.log('🔍 [BinderCard] String - Série principale:', mainSerie, 'SetId:', setId, 'Numéro:', cardNumber);
        
        // URL corrigée avec tcgdex (pas tcgdx)
        const imageUrl = `https://assets.tcgdex.net/fr/${mainSerie}/${setId}/${cardNumber}/high.webp`;
        console.log('✅ [BinderCard] Image URL construite depuis string:', imageUrl);
        return imageUrl;
      }
      
      // Fallback pour les strings non parsables
      const fallbackUrl = `https://assets.tcgdx.net/fr/sv/sv1/${cardData}/low.webp`;
      console.log('🔍 [BinderCard] URL de fallback:', fallbackUrl);
      return fallbackUrl;
    }
    
    console.log('❌ [BinderCard] Pas d\'image valide trouvée, utilisation du placeholder');
    console.log('❌ [BinderCard] CardData final:', cardData);
    return PLACEHOLDER_IMAGE;
  };

  return (
    <div className="binder-card" onClick={() => onView && onView(binder)}>
      <div className="binder-header">
        <div className="binder-meta">
          {binder.is_public && (
            <span className="public-badge" title="Binder public">
              🌐
            </span>
          )}
        </div>
      </div>

      <div className="binder-content">
        <div className="binder-title-section">
          <h3 className="binder-name" title={binder.name}>
            {binder.name}
          </h3>
          <div className="binder-badges">
            <span 
              className="binder-size-badge"
              style={{ backgroundColor: getSizeColor(binder.size) }}
            >
              {getSizeLabel(binder.size)}
            </span>
          </div>
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
        </div>
        <br /><br />
        {binder.preview_cards && binder.preview_cards.length > 0 && (
          <div className="binder-preview">
            <div className="preview-cards">
              {binder.preview_cards.slice(0, 10).map((card, index) => {
                console.log(`🃏 [BinderCard] Carte ${index + 1}:`, card);
                return (
                  <div key={index} className="preview-card">
                    <img
                      src={getCardImageUrl(card)}
                      alt={`Carte ${card.card_id || card}`}
                      onError={(e) => {
                        console.log(`❌ [BinderCard] Erreur de chargement image pour carte ${index + 1}:`, e.target.src);
                        e.target.src = PLACEHOLDER_IMAGE;
                        e.target.alt = 'Image non disponible';
                      }}
                      onLoad={(e) => {
                        console.log(`✅ [BinderCard] Image chargée avec succès pour carte ${index + 1}:`, e.target.src);
                      }}
                    />
                  </div>
                );
              })}
              {binder.preview_cards.length > 10 && (
                <div className="preview-more">
                  +{binder.preview_cards.length - 10}
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
