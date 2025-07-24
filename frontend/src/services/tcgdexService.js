// Service pour interagir avec l'API TCGdex
const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/fr';

class TCGdexService {
  /**
   * Récupère la liste de toutes les extensions Pokémon TCG en français
   * @returns {Promise<Array>} Liste des extensions
   */
  static async getSets() {
    try {
      const response = await fetch(`${TCGDEX_BASE_URL}/sets`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des extensions:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les cartes d'une extension spécifique
   * @param {string} setId - L'ID de l'extension
   * @returns {Promise<Array>} Liste des cartes de l'extension
   */
  static async getCardsBySet(setId) {
    if (!setId) {
      throw new Error('L\'ID de l\'extension est requis');
    }

    try {
      const response = await fetch(`${TCGDEX_BASE_URL}/cards?set.id=${setId}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des cartes pour l'extension ${setId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'une carte spécifique
   * @param {string} cardId - L'ID de la carte
   * @returns {Promise<Object>} Détails de la carte
   */
  static async getCard(cardId) {
    if (!cardId) {
      throw new Error('L\'ID de la carte est requis');
    }

    try {
      const response = await fetch(`${TCGDEX_BASE_URL}/cards/${cardId}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la carte ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Formate l'URL de l'image haute qualité d'une carte
   * @param {Object} card - Objet carte contenant le champ image
   * @returns {string} URL de l'image haute qualité
   */
  static getHighQualityImageUrl(card) {
    if (!card || !card.image) {
      return '';
    }
    return `${card.image}/high.webp`;
  }

  /**
   * Filtre une liste de cartes selon des critères
   * @param {Array} cards - Liste des cartes à filtrer
   * @param {Object} filters - Critères de filtrage
   * @param {string} filters.name - Nom de la carte (recherche partielle)
   * @param {string} filters.rarity - Rareté de la carte
   * @param {string} filters.type - Type de la carte
   * @returns {Array} Liste des cartes filtrées
   */
  static filterCards(cards, filters = {}) {
    if (!Array.isArray(cards)) {
      return [];
    }

    return cards.filter(card => {
      // Filtre par nom (insensible à la casse)
      if (filters.name && !card.name?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filtre par rareté
      if (filters.rarity && !card.rarity?.toLowerCase().includes(filters.rarity.toLowerCase())) {
        return false;
      }

      // Filtre par type
      if (filters.type && !card.types?.some(type => 
        type.toLowerCase().includes(filters.type.toLowerCase())
      )) {
        return false;
      }

      return true;
    });
  }

  /**
   * Retourne les raretés disponibles dans une liste de cartes
   * @param {Array} cards - Liste des cartes
   * @returns {Array} Liste unique des raretés
   */
  static getAvailableRarities(cards) {
    if (!Array.isArray(cards)) {
      return [];
    }

    const rarities = cards
      .map(card => card.rarity)
      .filter(rarity => rarity) // Filtre les valeurs nulles/undefined
      .filter((rarity, index, array) => array.indexOf(rarity) === index); // Valeurs uniques

    return rarities.sort();
  }

  /**
   * Retourne les types disponibles dans une liste de cartes
   * @param {Array} cards - Liste des cartes
   * @returns {Array} Liste unique des types
   */
  static getAvailableTypes(cards) {
    if (!Array.isArray(cards)) {
      return [];
    }

    const types = cards
      .flatMap(card => card.types || [])
      .filter((type, index, array) => array.indexOf(type) === index); // Valeurs uniques

    return types.sort();
  }
}

export default TCGdexService;
