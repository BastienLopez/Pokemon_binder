import TCGdexService from '../tcgdexService';

// Mock de fetch
global.fetch = jest.fn();

describe('TCGdexService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getSets', () => {
    test('récupère la liste des extensions avec succès', async () => {
      const mockSets = [
        { id: 'base1', name: 'Set de Base' },
        { id: 'sv1', name: 'Écarlate & Violet 1' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSets,
      });

      const result = await TCGdexService.getSets();

      expect(fetch).toHaveBeenCalledWith('https://api.tcgdex.net/v2/fr/sets');
      expect(result).toEqual(mockSets);
    });

    test('gère les erreurs HTTP', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(TCGdexService.getSets()).rejects.toThrow('Erreur HTTP: 404');
    });

    test('gère les erreurs réseau', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TCGdexService.getSets()).rejects.toThrow('Network error');
    });
  });

  describe('getCardsBySet', () => {
    test('récupère les cartes d\'une extension avec succès', async () => {
      const mockCards = [
        {
          id: 'base1-1',
          localId: '1',
          name: 'Alakazam',
          image: 'https://assets.tcgdex.net/fr/base/base1/1'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCards,
      });

      const result = await TCGdexService.getCardsBySet('base1');

      expect(fetch).toHaveBeenCalledWith('https://api.tcgdex.net/v2/fr/cards?set.id=base1');
      expect(result).toEqual(mockCards);
    });

    test('rejette si aucun setId n\'est fourni', async () => {
      await expect(TCGdexService.getCardsBySet()).rejects.toThrow('L\'ID de l\'extension est requis');
      await expect(TCGdexService.getCardsBySet('')).rejects.toThrow('L\'ID de l\'extension est requis');
    });

    test('gère les erreurs HTTP', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(TCGdexService.getCardsBySet('base1')).rejects.toThrow('Erreur HTTP: 500');
    });
  });

  describe('getCard', () => {
    test('récupère une carte spécifique avec succès', async () => {
      const mockCard = {
        id: 'base1-1',
        localId: '1',
        name: 'Alakazam',
        image: 'https://assets.tcgdex.net/fr/base/base1/1'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      const result = await TCGdexService.getCard('base1-1');

      expect(fetch).toHaveBeenCalledWith('https://api.tcgdex.net/v2/fr/cards/base1-1');
      expect(result).toEqual(mockCard);
    });

    test('rejette si aucun cardId n\'est fourni', async () => {
      await expect(TCGdexService.getCard()).rejects.toThrow('L\'ID de la carte est requis');
      await expect(TCGdexService.getCard('')).rejects.toThrow('L\'ID de la carte est requis');
    });
  });

  describe('getHighQualityImageUrl', () => {
    test('retourne l\'URL de l\'image haute qualité', () => {
      const card = {
        image: 'https://assets.tcgdex.net/fr/base/base1/1'
      };

      const result = TCGdexService.getHighQualityImageUrl(card);
      expect(result).toBe('https://assets.tcgdex.net/fr/base/base1/1/high.jpg');
    });

    test('retourne une chaîne vide si pas d\'image', () => {
      expect(TCGdexService.getHighQualityImageUrl({})).toBe('');
      expect(TCGdexService.getHighQualityImageUrl(null)).toBe('');
      expect(TCGdexService.getHighQualityImageUrl(undefined)).toBe('');
    });
  });

  describe('filterCards', () => {
    const mockCards = [
      {
        id: 'base1-1',
        name: 'Alakazam',
        rarity: 'Rare Holo',
        types: ['Psychic']
      },
      {
        id: 'base1-4',
        name: 'Dracaufeu',
        rarity: 'Rare Holo',
        types: ['Fire']
      },
      {
        id: 'base1-7',
        name: 'Carapuce',
        rarity: 'Common',
        types: ['Water']
      }
    ];

    test('filtre par nom', () => {
      const result = TCGdexService.filterCards(mockCards, { name: 'Alakazam' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alakazam');
    });

    test('filtre par rareté', () => {
      const result = TCGdexService.filterCards(mockCards, { rarity: 'Rare' });
      expect(result).toHaveLength(2);
      expect(result.every(card => card.rarity.includes('Rare'))).toBe(true);
    });

    test('filtre par type', () => {
      const result = TCGdexService.filterCards(mockCards, { type: 'Fire' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dracaufeu');
    });

    test('combine plusieurs filtres', () => {
      const result = TCGdexService.filterCards(mockCards, {
        name: 'a',
        rarity: 'Rare'
      });
      expect(result).toHaveLength(2); // Alakazam et Dracaufeu contiennent 'a' et ont 'Rare'
    });

    test('retourne un tableau vide pour des données invalides', () => {
      expect(TCGdexService.filterCards(null)).toEqual([]);
      expect(TCGdexService.filterCards(undefined)).toEqual([]);
      expect(TCGdexService.filterCards('invalid')).toEqual([]);
    });

    test('est insensible à la casse', () => {
      const result = TCGdexService.filterCards(mockCards, { name: 'ALAKAZAM' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alakazam');
    });
  });

  describe('getAvailableRarities', () => {
    const mockCards = [
      { rarity: 'Rare Holo' },
      { rarity: 'Common' },
      { rarity: 'Rare Holo' },
      { rarity: 'Uncommon' },
      { rarity: null }
    ];

    test('retourne les raretés uniques triées', () => {
      const result = TCGdexService.getAvailableRarities(mockCards);
      expect(result).toEqual(['Common', 'Rare Holo', 'Uncommon']);
    });

    test('gère les données invalides', () => {
      expect(TCGdexService.getAvailableRarities(null)).toEqual([]);
      expect(TCGdexService.getAvailableRarities(undefined)).toEqual([]);
      expect(TCGdexService.getAvailableRarities([])).toEqual([]);
    });
  });

  describe('getAvailableTypes', () => {
    const mockCards = [
      { types: ['Fire', 'Flying'] },
      { types: ['Water'] },
      { types: ['Fire'] },
      { types: ['Psychic'] },
      { types: undefined }
    ];

    test('retourne les types uniques triés', () => {
      const result = TCGdexService.getAvailableTypes(mockCards);
      expect(result).toEqual(['Fire', 'Flying', 'Psychic', 'Water']);
    });

    test('gère les données invalides', () => {
      expect(TCGdexService.getAvailableTypes(null)).toEqual([]);
      expect(TCGdexService.getAvailableTypes(undefined)).toEqual([]);
      expect(TCGdexService.getAvailableTypes([])).toEqual([]);
    });
  });
});
