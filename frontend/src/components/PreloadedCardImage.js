import React, { useState, useEffect } from 'react';
import TCGdxService from '../services/tcgdxService';

/**
 * Composant d'image avec préchargement intelligent et fallback
 */
const PreloadedCardImage = ({ 
  card, 
  className = 'card-image', 
  alt = '',
  onClick = null,
  onError = null 
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  useEffect(() => {
    if (!card) return;

    const loadImage = () => {
      // Obtenir l'URL de l'image
      let imageUrl = TCGdxService.getHighQualityImageUrl(card);
      
      // Si on a déjà essayé des fallbacks, utiliser la suivante
      if (fallbackAttempt > 0) {
        imageUrl = TCGdxService.getNextFallbackUrl(card, fallbackAttempt);
      }

      if (!imageUrl) {
        setIsError(true);
        return;
      }

      setCurrentImageUrl(imageUrl);
      setIsLoaded(false);
      setIsError(false);
    };

    loadImage();
  }, [card, fallbackAttempt]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleImageError = () => {
    console.warn('Erreur chargement image, tentative fallback...');
    
    const maxAttempts = 4;
    if (fallbackAttempt < maxAttempts) {
      setFallbackAttempt(prev => prev + 1);
    } else {
      setIsError(true);
      setIsLoaded(false);
      if (onError) onError();
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // Placeholder SVG
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3E" + (isError ? 'Image%20non' : 'Chargement...') + "%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3E" + (isError ? 'disponible' : '') + "%3C/text%3E%3C/svg%3E";

  return (
    <img
      src={isLoaded ? currentImageUrl : placeholderSvg}
      alt={alt || card?.name || 'Carte Pokémon'}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0.7,
        cursor: onClick ? 'pointer' : 'default'
      }}
    />
  );
};

export default PreloadedCardImage;
