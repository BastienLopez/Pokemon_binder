const API_BASE_URL = 'http://localhost:8000';

class UserCardsService {
  /**
   * Récupère toutes les cartes de l'utilisateur connecté
   * @returns {Promise<Array>} Liste des cartes de l'utilisateur
   */
  static async getUserCards() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes:', error);
      throw error;
    }
  }

  /**
   * Ajoute une carte à la collection de l'utilisateur
   * @param {Object} cardData - Données de la carte à ajouter
   * @returns {Promise<Object>} Carte ajoutée
   */
  static async addUserCard(cardData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/cards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
      throw error;
    }
  }

  /**
   * Met à jour une carte de l'utilisateur
   * @param {string} cardId - ID de la carte à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Carte mise à jour
   */
  static async updateUserCard(cardId, updateData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
      throw error;
    }
  }

  /**
   * Supprime une carte de la collection de l'utilisateur
   * @param {string} cardId - ID de la carte à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteUserCard(cardId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte:', error);
      throw error;
    }
  }

  /**
   * Récupère une carte spécifique de l'utilisateur
   * @param {string} cardId - ID de la carte
   * @returns {Promise<Object>} Détails de la carte
   */
  static async getUserCard(cardId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error);
      throw error;
    }
  }

  /**
   * Formate les données d'une carte TCGdx pour l'ajout à la collection
   * @param {Object} card - Carte depuis TCGdx
   * @param {Object} set - Extension depuis TCGdx
   * @param {number} quantity - Quantité à ajouter
   * @param {string} condition - État de la carte
   * @returns {Object} Données formatées pour l'API
   */
  static formatCardForCollection(card, set, quantity = 1, condition = 'Near Mint') {
    return {
      card_id: card.id,
      card_name: card.name,
      card_image: card.image,
      set_id: set.id,
      set_name: set.name,
      quantity: quantity,
      condition: condition,
      version: card.variants && card.variants.length > 0 ? card.variants[0] : null,
      rarity: card.rarity || null,
      local_id: card.localId || null,
    };
  }
}

export default UserCardsService;
