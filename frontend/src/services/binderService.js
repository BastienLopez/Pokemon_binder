import { apiService } from './apiService';

class BinderService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Récupère tous les binders de l'utilisateur
   */
  async getUserBinders() {
    try {
      const response = await this.apiService.get('/user/binders/');
      return response; // apiService.get retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des binders:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la récupération des binders'
      );
    }
  }

  /**
   * Crée un nouveau binder
   */
  async createBinder(binderData) {
    try {
      const response = await this.apiService.post('/user/binders/', binderData);
      return response; // apiService.post retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de la création du binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la création du binder'
      );
    }
  }

  /**
   * Récupère un binder spécifique par son ID
   */
  async getBinderById(binderId) {
    try {
      const response = await this.apiService.get(`/user/binders/${binderId}`);
      return response; // apiService.get retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de la récupération du binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la récupération du binder'
      );
    }
  }

  /**
   * Met à jour un binder
   */
  async updateBinder(binderId, updateData) {
    try {
      const response = await this.apiService.patch(`/user/binders/${binderId}`, updateData);
      return response; // apiService.patch retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la mise à jour du binder'
      );
    }
  }

  /**
   * Supprime un binder
   */
  async deleteBinder(binderId) {
    try {
      await this.apiService.delete(`/user/binders/${binderId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la suppression du binder'
      );
    }
  }

  /**
   * Ajoute une carte au binder
   */
  async addCardToBinder(binderId, cardData) {
    try {
      const response = await this.apiService.post(`/user/binders/${binderId}/cards`, cardData);
      return response; // apiService.post retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de l\'ajout de carte au binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de l\'ajout de la carte au binder'
      );
    }
  }

  /**
   * Retire une carte du binder
   */
  async removeCardFromBinder(binderId, removeData) {
    try {
      const response = await this.apiService.delete(`/user/binders/${binderId}/cards`, {
        data: removeData
      });
      return response; // apiService.delete retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de la suppression de carte du binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de la suppression de la carte du binder'
      );
    }
  }

  /**
   * Ajoute une nouvelle page au binder
   */
  async addPageToBinder(binderId) {
    try {
      const response = await this.apiService.post(`/user/binders/${binderId}/pages`);
      return response; // apiService.post retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors de l\'ajout de page au binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors de l\'ajout de la page au binder'
      );
    }
  }

  /**
   * Déplace une carte dans le binder (drag & drop)
   */
  async moveCardInBinder(binderId, moveData) {
    try {
      const response = await this.apiService.patch(`/user/binders/${binderId}/cards/move`, moveData);
      return response; // apiService.patch retourne déjà response.data
    } catch (error) {
      console.error('Erreur lors du déplacement de carte dans le binder:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Erreur lors du déplacement de la carte'
      );
    }
  }

  /**
   * Calcule le nombre de slots par page selon la taille
   */
  getSlotsPerPage(size) {
    switch (size) {
      case '3x3':
        return 9;
      case '4x4':
        return 16;
      case '5x5':
        return 25;
      default:
        return 9;
    }
  }

  /**
   * Calcule les dimensions de la grille selon la taille
   */
  getGridDimensions(size) {
    switch (size) {
      case '3x3':
        return { rows: 3, cols: 3 };
      case '4x4':
        return { rows: 4, cols: 4 };
      case '5x5':
        return { rows: 5, cols: 5 };
      default:
        return { rows: 3, cols: 3 };
    }
  }

  /**
   * Convertit une position linéaire en coordonnées de grille
   */
  positionToGrid(position, size) {
    const { cols } = this.getGridDimensions(size);
    return {
      row: Math.floor(position / cols),
      col: position % cols
    };
  }

  /**
   * Convertit des coordonnées de grille en position linéaire
   */
  gridToPosition(row, col, size) {
    const { cols } = this.getGridDimensions(size);
    return row * cols + col;
  }
}

// Instance singleton
const binderService = new BinderService();

export default binderService;
