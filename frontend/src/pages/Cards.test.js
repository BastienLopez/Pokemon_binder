impor// Mock du service TCGdx
jest.mock('../services/tcgdexService', () => ({
  getSets: jest.fn(),
  getCardsBySet: jest.fn(),
  filterCards: jest.fn(),
  getHighQualityImageUrl: jest.fn(),
}));

import TCGdexService from '../services/tcgdexService';rom 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cards from '../Cards';

// Mock du service TCGdex
jest.mock('../../services/tcgdexService', () => ({
  getSets: jest.fn(),
  getCardsBySet: jest.fn(),
  filterCards: jest.fn(),
  getHighQualityImageUrl: jest.fn(),
}));

import TCGdexService from '../../services/tcgdexService';

// Données de test
const mockSets = [
  { id: 'base1', name: 'Set de Base' },
  { id: 'sv1', name: 'Écarlate & Violet 1' },
];

const mockCards = [
  {
    id: 'base1-1',
    localId: '1',
    name: 'Alakazam',
    image: 'https://assets.tcgdex.net/fr/base/base1/1',
    rarity: 'Rare Holo'
  },
  {
    id: 'base1-4',
    localId: '4',
    name: 'Dracaufeu',
    image: 'https://assets.tcgdex.net/fr/base/base1/4',
    rarity: 'Rare Holo'
  },
];

const renderCards = () => {
  return render(
    <BrowserRouter>
      <Cards />
    </BrowserRouter>
  );
};

describe('Cards Component', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    TCGdexService.getSets.mockResolvedValue(mockSets);
    TCGdexService.getCardsBySet.mockResolvedValue(mockCards);
    TCGdexService.filterCards.mockReturnValue(mockCards);
    TCGdexService.getHighQualityImageUrl.mockReturnValue('https://example.com/image.jpg');
  });

  test('affiche le titre de la page', () => {
    renderCards();
    expect(screen.getByText('Listing des Cartes Pokémon TCG')).toBeInTheDocument();
  });

  test('charge et affiche la liste des extensions', async () => {
    renderCards();

    await waitFor(() => {
      expect(TCGdexService.getSets).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Set de Base')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Écarlate & Violet 1')).toBeInTheDocument();
    });
  });

  test('affiche les options de taille de binder', () => {
    renderCards();
    
    expect(screen.getByText('3x3 (9 cartes par page)')).toBeInTheDocument();
    expect(screen.getByText('4x4 (16 cartes par page)')).toBeInTheDocument();
  });

  test('le bouton générer est désactivé sans extension sélectionnée', () => {
    renderCards();
    
    const generateButton = screen.getByText('Générer le Binder');
    expect(generateButton).toBeDisabled();
  });

  test('permet de sélectionner une extension et de générer le binder', async () => {
    renderCards();

    // Attendre que les extensions soient chargées
    await waitFor(() => {
      expect(screen.getByDisplayValue('Set de Base')).toBeInTheDocument();
    });

    // Sélectionner une extension
    const setSelect = screen.getByLabelText('Extension :');
    fireEvent.change(setSelect, { target: { value: 'base1' } });

    // Le bouton doit maintenant être activé
    const generateButton = screen.getByText('Générer le Binder');
    expect(generateButton).not.toBeDisabled();

    // Cliquer sur le bouton
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(TCGdexService.getCardsBySet).toHaveBeenCalledWith('base1');
    });
  });

  test('affiche les cartes après génération', async () => {
    renderCards();

    // Attendre le chargement des extensions
    await waitFor(() => {
      expect(screen.getByDisplayValue('Set de Base')).toBeInTheDocument();
    });

    // Sélectionner et générer
    const setSelect = screen.getByLabelText('Extension :');
    fireEvent.change(setSelect, { target: { value: 'base1' } });
    
    const generateButton = screen.getByText('Générer le Binder');
    fireEvent.click(generateButton);

    // Vérifier que les cartes sont affichées
    await waitFor(() => {
      expect(screen.getByText('Alakazam')).toBeInTheDocument();
      expect(screen.getByText('Dracaufeu')).toBeInTheDocument();
    });
  });

  test('permet de filtrer les cartes par nom', async () => {
    // Mock pour retourner seulement la carte filtrée
    TCGdexService.filterCards.mockReturnValue([mockCards[0]]);

    renderCards();

    // Sélectionner et générer des cartes
    await waitFor(() => {
      expect(screen.getByDisplayValue('Set de Base')).toBeInTheDocument();
    });

    const setSelect = screen.getByLabelText('Extension :');
    fireEvent.change(setSelect, { target: { value: 'base1' } });
    
    const generateButton = screen.getByText('Générer le Binder');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Alakazam')).toBeInTheDocument();
    });

    // Utiliser le filtre par nom
    const nameFilter = screen.getByLabelText('Nom :');
    fireEvent.change(nameFilter, { target: { value: 'Alakazam' } });

    // Vérifier que le service de filtrage a été appelé
    expect(TCGdexService.filterCards).toHaveBeenCalledWith(
      mockCards,
      expect.objectContaining({ name: 'Alakazam' })
    );
  });

  test('change la taille du binder', () => {
    renderCards();
    
    const sizeSelect = screen.getByLabelText('Taille du Binder :');
    fireEvent.change(sizeSelect, { target: { value: '4x4' } });
    
    expect(sizeSelect.value).toBe('4x4');
  });

  test('gère les erreurs de chargement des extensions', async () => {
    TCGdexService.getSets.mockRejectedValue(new Error('Erreur API'));
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderCards();

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Impossible de charger la liste des extensions');
    });

    alertSpy.mockRestore();
  });

  test('gère les erreurs de chargement des cartes', async () => {
    TCGdexService.getCardsBySet.mockRejectedValue(new Error('Erreur API'));
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderCards();

    // Attendre le chargement des extensions
    await waitFor(() => {
      expect(screen.getByDisplayValue('Set de Base')).toBeInTheDocument();
    });

    // Sélectionner et essayer de générer
    const setSelect = screen.getByLabelText('Extension :');
    fireEvent.change(setSelect, { target: { value: 'base1' } });
    
    const generateButton = screen.getByText('Générer le Binder');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Impossible de charger les cartes de cette extension');
    });

    alertSpy.mockRestore();
  });
});
