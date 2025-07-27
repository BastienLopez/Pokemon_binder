import { useState, useCallback } from 'react';

const useCardComparison = (maxCards = 5) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const addCardToComparison = useCallback((card) => {
    setSelectedCards(prev => {
      // Vérifier si la carte est déjà dans la comparaison
      const isAlreadyAdded = prev.some(c => c.id === card.id);
      if (isAlreadyAdded) {
        return prev; // Ne pas ajouter de doublons
      }

      // Vérifier la limite
      if (prev.length >= maxCards) {
        // Remplacer la première carte par la nouvelle
        return [...prev.slice(1), card];
      }

      return [...prev, card];
    });
  }, [maxCards]);

  const removeCardFromComparison = useCallback((index) => {
    setSelectedCards(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const openComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  const isCardSelected = useCallback((cardId) => {
    return selectedCards.some(card => card.id === cardId);
  }, [selectedCards]);

  const canAddMore = selectedCards.length < maxCards;
  const hasCards = selectedCards.length > 0;
  const canCompare = selectedCards.length >= 2;

  return {
    selectedCards,
    isComparisonOpen,
    addCardToComparison,
    removeCardFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    isCardSelected,
    canAddMore,
    hasCards,
    canCompare,
    count: selectedCards.length,
    maxCards
  };
};

export default useCardComparison;
