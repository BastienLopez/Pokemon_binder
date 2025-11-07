const RARITY_VALUE_MAP = {
  common: 0.25,
  "commune": 0.25,
  uncommon: 0.75,
  rare: 2,
  "rare holo": 3.5,
  "rare holo ex": 5,
  "rare ultra": 8,
  "rare secret": 15,
  "ultra rare": 12,
  "secret rare": 18,
  "hyper rare": 25
};

const CONDITION_MULTIPLIERS = {
  "mint": 1.3,
  "near mint": 1,
  "excellent": 0.9,
  "lightly played": 0.8,
  "moderately played": 0.7,
  "heavily played": 0.5
};

export const estimateCardValue = (card = {}) => {
  const rarityKey = (card.rarity || card.card_rarity || '').toLowerCase();
  const baseValue = RARITY_VALUE_MAP[rarityKey] ?? 0.5;
  const conditionKey = (card.condition || '').toLowerCase();
  const conditionMultiplier = CONDITION_MULTIPLIERS[conditionKey] ?? 1;
  const quantity = card.quantity ?? 1;
  return Number((baseValue * conditionMultiplier * quantity).toFixed(2));
};

export const formatEuro = (value = 0) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
};

