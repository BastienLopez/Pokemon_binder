import React, { useState, useEffect, useRef } from 'react';
import TCGdxService from '../services/tcgdexService';
import useImagePreloader from '../hooks/useImagePreloader';
import './OptimizedCardImage.css';

const OptimizedCardImage = ({ 
  card, 
  className = '', 
  alt = '',
  onClick = null,
  priority = false, // Pour précharger en priorité
  lazy = true // Lazy loading par défaut
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  const imgRef = useRef(null);
  const { preloadImage, isImageCached } = useImagePreloader();

  // Observer pour le lazy loading
  const [isInView, setIsInView] = useState(!lazy);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!card || !isInView) return;

    const loadImage = async () => {
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

      // Si l'image est déjà en cache, l'afficher immédiatement
      if (isImageCached(imageUrl)) {
        setIsLoaded(true);
        setIsError(false);
        return;
      }

      // Si c'est prioritaire, précharger l'image
      if (priority) {
        try {
          await preloadImage(imageUrl);
          setIsLoaded(true);
          setIsError(false);
        } catch (error) {
          console.warn('Erreur préchargement prioritaire:', error);
          handleImageError();
        }
      }
    };

    loadImage();
  }, [card, isInView, fallbackAttempt, priority, preloadImage, isImageCached]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleImageError = () => {
    console.warn('Erreur chargement image, tentative fallback...');
    
    const maxAttempts = 4; // TCGdx + 3 fallbacks
    if (fallbackAttempt < maxAttempts) {
      setFallbackAttempt(prev => prev + 1);
      setIsError(false);
    } else {
      setIsError(true);
      setIsLoaded(false);
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e, card);
    }
  };

  // Placeholder pendant le chargement
  const PlaceholderSVG = () => (
    <div className={`card-image-placeholder ${className}`}>
      <svg width="200" height="280" viewBox="0 0 200 280">
        <rect width="200" height="280" fill="#f0f0f0" stroke="#ddd" strokeWidth="2"/>
        <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="14">
          {isError ? 'Image non' : 'Chargement...'}
        </text>
        <text x="100" y="160" textAnchor="middle" fill="#666" fontSize="14">
          {isError ? 'disponible' : ''}
        </text>
        {!isError && (
          <circle cx="100" cy="120" r="8" fill="#666">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        )}
      </svg>
    </div>
  );

  return (
    <div 
      ref={imgRef} 
      className={`optimized-card-image ${className} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      {!isInView ? (
        <PlaceholderSVG />
      ) : !isLoaded || isError ? (
        <PlaceholderSVG />
      ) : (
        <img
          src={currentImageUrl}
          alt={alt || card?.name || 'Carte Pokémon'}
          className={`card-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {/* Badge de cache pour debug */}
      {process.env.NODE_ENV === 'development' && isImageCached(currentImageUrl) && (
        <div className="cache-badge">✅</div>
      )}
      
      {/* Badge de fallback pour debug */}
      {process.env.NODE_ENV === 'development' && fallbackAttempt > 0 && (
        <div className="fallback-badge">F{fallbackAttempt}</div>
      )}
    </div>
  );
};

export default OptimizedCardImage;
