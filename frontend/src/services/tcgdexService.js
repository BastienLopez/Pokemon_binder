// Service pour interagir avec l'API TCGdex
const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/fr';

class TCGdexService {
  /**
   * Récupère la liste de toutes les séries Pokémon TCG en français
   * @returns {Promise<Array>} Liste des séries
   */
  static async getSeries() {
    try {
      const response = await fetch(`${TCGDEX_BASE_URL}/series`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des séries:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des extensions d'une série spécifique
   * @param {string} serieId - L'ID de la série
   * @returns {Promise<Array>} Liste des extensions de la série
   */
  static async getSetsBySerie(serieId) {
    if (!serieId) {
      throw new Error('L\'ID de la série est requis');
    }

    try {
      const response = await fetch(`${TCGDEX_BASE_URL}/sets?serie=${serieId}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des extensions pour la série ${serieId}:`, error);
      throw error;
    }
  }

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
   * Formate l'URL de l'image haute qualité d'une carte avec fallback API
   * @param {Object} card - Objet carte contenant le champ image
   * @returns {string} URL de l'image haute qualité ou placeholder
   */
  static getHighQualityImageUrl(card) {
    console.log('🔍 getHighQualityImageUrl - Carte reçue:', {
      cardName: card?.name,
      cardId: card?.id,
      cardImage: card?.image,
      hasImageField: !!card?.image
    });

    // 1. Essayer d'abord TCGdx si le champ image existe
    if (card?.image) {
      const imageUrl = `${card.image}/high.webp`;
      console.log('✅ URL TCGdx trouvée:', imageUrl, 'pour la carte:', card.name);
      return imageUrl;
    }

    // 2. Si pas d'image TCGdx, essayer de construire l'URL TCGdx manuellement
    if (card?.id) {
      const cardId = card.id;
      const setId = cardId.split('-')[0];
      
      const tcgdxUrl = `https://assets.tcgdx.net/fr/${setId}/${cardId}/high.webp`;
      console.log('🔧 Tentative URL TCGdx construite:', tcgdxUrl, 'pour:', card.name);
      
      // Retourner l'URL avec un flag pour indiquer que c'est un fallback TCGdx
      return tcgdxUrl + '?fallback=tcgdx';
    }

    // 3. Si aucune solution TCGdx, essayer l'API Pokémon TCG comme fallback
    if (card?.name) {
      const fallbackUrl = this.getFallbackImageUrl(card);
      if (fallbackUrl) {
        console.log('🆘 URL fallback API trouvée:', fallbackUrl, 'pour:', card.name);
        return fallbackUrl;
      }
    }

    // 4. Dernier recours : placeholder SVG
    console.log('❌ Aucune image disponible pour:', card?.name || 'carte inconnue');
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage non%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3Edisponible%3C/text%3E%3C/svg%3E";
  }

  /**
   * Génère une URL d'image depuis l'API Pokémon TCG comme fallback
   * @param {Object} card - Objet carte
   * @returns {string|null} URL de l'image ou null si non trouvée
   */
  static getFallbackImageUrl(card) {
    try {
      // Construire une URL basée sur l'API Pokémon TCG
      if (card.id) {
        const [setId, cardNumber] = card.id.split('-');
        
        // Essayer plusieurs APIs de fallback
        const fallbackApis = [
          // API 1: Pokemon TCG
          `https://images.pokemontcg.io/${setId}/${cardNumber}_hires.png`,
          // API 2: Alternative format
          `https://images.pokemontcg.io/${setId}/${cardNumber}.png`,
          // API 3: PkmnCards (format différent)
          `https://pkmncards.com/wp-content/uploads/en_${setId}-${cardNumber}.jpg`,
          // API 4: Dernière tentative avec un autre service
          `https://assets.pokemon.com/assets/cms2/img/cards/web/${setId}/${setId}_EN_${cardNumber}.png`
        ];
        
        const fallbackUrl = fallbackApis[0]; // Utiliser le premier par défaut
        console.log('🔄 Tentative fallback API Pokemon TCG:', fallbackUrl);
        console.log('🔄 Alternatives disponibles:', fallbackApis.slice(1, 2));
        
        return fallbackUrl;
      }
    } catch (error) {
      console.warn('Erreur lors de la génération de l\'URL fallback:', error);
    }
    
    return null;
  }

  /**
   * Obtient l'URL de fallback suivante si la première échoue
   * @param {Object} card - Objet carte
   * @param {number} attemptIndex - Index de la tentative (0, 1, 2...)
   * @returns {string|null} URL de fallback suivante
   */
  static getNextFallbackUrl(card, attemptIndex = 0) {
    if (!card?.id) return null;
    
    const [setId, cardNumber] = card.id.split('-');
    const fallbackUrls = [
      `https://images.pokemontcg.io/${setId}/${cardNumber}_hires.png`,
      `https://images.pokemontcg.io/${setId}/${cardNumber}.png`,
      `https://pkmncards.com/wp-content/uploads/en_${setId}-${cardNumber}.jpg`,
      `https://assets.pokemon.com/assets/cms2/img/cards/web/${setId}/${setId}_EN_${cardNumber}.png`
    ];
    
    return fallbackUrls[attemptIndex] || null;
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
