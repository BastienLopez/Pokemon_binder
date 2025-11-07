import { apiService } from './apiService';

class UserCardsService {
  static async getUserCards() {
    try {
      return await apiService.get('/user/cards');
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes:', error);
      throw error;
    }
  }

  static async addUserCard(cardData) {
    try {
      return await apiService.post('/user/cards', cardData);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte:", error);
      throw error;
    }
  }

  static async updateUserCard(cardId, updateData) {
    try {
      return await apiService.patch(`/user/cards/${cardId}`, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
      throw error;
    }
  }

  static async deleteUserCard(cardId) {
    try {
      await apiService.delete(`/user/cards/${cardId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte:', error);
      throw error;
    }
  }

  static async getUserCard(cardId) {
    try {
      return await apiService.get(`/user/cards/${cardId}`);
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error);
      throw error;
    }
  }

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

