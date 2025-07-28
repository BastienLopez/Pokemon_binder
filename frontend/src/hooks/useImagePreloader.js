import { useState, useEffect, useCallback } from 'react';

// Cache global pour les images préchargées
const imageCache = new Map();
const preloadingQueue = new Set();

/**
 * Hook personnalisé pour le préchargement d'images
 */
const useImagePreloader = () => {
  const [cacheStats, setCacheStats] = useState({
    cached: 0,
    preloading: 0,
    totalMemory: '0MB'
  });

  /**
   * Précharge une image et la met en cache
   * @param {string} imageUrl - URL de l'image à précharger
   * @returns {Promise<HTMLImageElement>} Image préchargée
   */
  const preloadImage = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.startsWith('data:image/svg+xml')) {
      return Promise.resolve(null);
    }

    // Si l'image est déjà en cache, la retourner
    if (imageCache.has(imageUrl)) {
      return Promise.resolve(imageCache.get(imageUrl));
    }

    // Si l'image est en cours de préchargement, attendre
    if (preloadingQueue.has(imageUrl)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (imageCache.has(imageUrl)) {
            resolve(imageCache.get(imageUrl));
          } else {
            setTimeout(checkCache, 50);
          }
        };
        checkCache();
      });
    }

    // Commencer le préchargement
    preloadingQueue.add(imageUrl);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log('✅ Image préchargée:', imageUrl.substring(0, 60) + '...');
        imageCache.set(imageUrl, img);
        preloadingQueue.delete(imageUrl);
        updateCacheStats();
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn('❌ Erreur préchargement image:', imageUrl.substring(0, 60) + '...');
        preloadingQueue.delete(imageUrl);
        updateCacheStats();
        reject(new Error('Impossible de précharger l\'image'));
      };
      
      img.src = imageUrl;
    });
  }, []);

  /**
   * Précharge plusieurs images en parallèle
   * @param {Array<string>} imageUrls - URLs des images à précharger
   * @param {number} batchSize - Nombre d'images à précharger en parallèle
   * @returns {Promise<Array>} Promesse de préchargement
   */
  const preloadImages = useCallback(async (imageUrls, batchSize = 6) => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return [];

    const batches = [];
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      batches.push(imageUrls.slice(i, i + batchSize));
    }

    console.log(`🚀 Préchargement de ${imageUrls.length} images par batch de ${batchSize}`);
    
    const results = [];
    for (const batch of batches) {
      try {
        const batchResults = await Promise.allSettled(
          batch.map(url => preloadImage(url))
        );
        results.push(...batchResults);
      } catch (error) {
        console.warn('Erreur lors du préchargement batch:', error);
      }
    }
    
    return results;
  }, [preloadImage]);

  /**
   * Précharge les images d'une liste de cartes
   * @param {Array} cards - Liste des cartes
   * @param {Function} getImageUrl - Fonction pour obtenir l'URL de l'image
   * @returns {Promise<void>}
   */
  const preloadCardImages = useCallback(async (cards, getImageUrl) => {
    if (!Array.isArray(cards) || typeof getImageUrl !== 'function') return;
    
    const imageUrls = cards
      .map(getImageUrl)
      .filter(url => url && !url.startsWith('data:image/svg+xml'));
    
    if (imageUrls.length > 0) {
      console.log(`🖼️ Préchargement de ${imageUrls.length} images de cartes...`);
      await preloadImages(imageUrls);
    }
  }, [preloadImages]);

  /**
   * Vide le cache des images
   */
  const clearCache = useCallback(() => {
    imageCache.clear();
    preloadingQueue.clear();
    updateCacheStats();
    console.log('🗑️ Cache d\'images vidé');
  }, []);

  /**
   * Met à jour les statistiques du cache
   */
  const updateCacheStats = useCallback(() => {
    setCacheStats({
      cached: imageCache.size,
      preloading: preloadingQueue.size,
      totalMemory: `~${Math.round(imageCache.size * 0.1)}MB`
    });
  }, []);

  /**
   * Vérifie si une image est en cache
   */
  const isImageCached = useCallback((imageUrl) => {
    return imageCache.has(imageUrl);
  }, []);

  // Mettre à jour les stats au montage du hook
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  return {
    preloadImage,
    preloadImages,
    preloadCardImages,
    clearCache,
    isImageCached,
    cacheStats
  };
};

export default useImagePreloader;
