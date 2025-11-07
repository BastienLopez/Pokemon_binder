import { useState, useCallback } from 'react';

const resolveCardId = (cardOrId) => {
  if (typeof cardOrId === 'string' || typeof cardOrId === 'number') {
    return String(cardOrId);
  }

  if (!cardOrId) {
    return null;
  }

  const possibleIds = [
    cardOrId.id,
    cardOrId.card_id,
    cardOrId.cardId,
    cardOrId._id,
    cardOrId.user_card_id,
    cardOrId.set_id && cardOrId.localId ? `${cardOrId.set_id}-${cardOrId.localId}` : null,
    cardOrId.setId && cardOrId.localId ? `${cardOrId.setId}-${cardOrId.localId}` : null,
    cardOrId.comparisonId,
    cardOrId.localId && cardOrId.set?.id ? `${cardOrId.set.id}-${cardOrId.localId}` : null,
    cardOrId.card?.id
  ];

  const foundId = possibleIds.find(Boolean);
  return foundId ? String(foundId) : null;
};

const normalizeCardForComparison = (card) => {
  const comparisonId = resolveCardId(card);

  if (!comparisonId) {
    return null;
  }

  const normalizedCard = {
    ...card,
    comparisonId
  };

  if (!normalizedCard.id) {
    normalizedCard.id = comparisonId;
  }
  if (!normalizedCard.name && normalizedCard.card_name) {
    normalizedCard.name = normalizedCard.card_name;
  }
  if (!normalizedCard.image && normalizedCard.card_image) {
    normalizedCard.image = normalizedCard.card_image;
  }

  return normalizedCard;
};

const useCardComparison = (maxCards = 5) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const addCardToComparison = useCallback((card) => {
    setSelectedCards((prev) => {
      const normalizedCard = normalizeCardForComparison(card);
      if (!normalizedCard) {
        return prev;
      }

      const alreadySelected = prev.some(
        (existingCard) => existingCard.comparisonId === normalizedCard.comparisonId
      );

      if (alreadySelected) {
        return prev;
      }

      if (prev.length >= maxCards) {
        return [...prev.slice(1), normalizedCard];
      }

      return [...prev, normalizedCard];
    });
  }, [maxCards]);

  const removeCardFromComparison = useCallback((index) => {
    setSelectedCards((prev) => prev.filter((_, i) => i !== index));
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

  const isCardSelected = useCallback((cardOrId) => {
    const comparisonId = resolveCardId(cardOrId);
    if (!comparisonId) {
      return false;
    }
    return selectedCards.some((card) => card.comparisonId === comparisonId);
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
