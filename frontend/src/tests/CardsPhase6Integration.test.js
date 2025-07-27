import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Cards from '../pages/Cards';
import { useAuth } from '../contexts/AuthContext';
import TCGdxService from '../services/tcgdxService';
import UserCardsService from '../services/userCardsService';

// Mocks
jest.mock('../contexts/AuthContext');
jest.mock('../services/tcgdxService');
jest.mock('../services/userCardsService');

const mockSeries = [
  { id: 'sv', name: 'Scarlet & Violet' }
];

const mockSets = [
  { id: 'sv1', name: 'Scarlet & Violet Base Set' }
];

const mockCards = [
  {
    id: 'sv1-1',
    name: 'Bulbasaur',
    localId: '1',
    rarity: 'Common',
    types: ['Grass'],
    image: 'https://example.com/bulbasaur.jpg'
  },
  {
    id: 'sv1-4',
    name: 'Charmander',
    localId: '4',
    rarity: 'Common',
    types: ['Fire'],
    image: 'https://example.com/charmander.jpg'
  }
];

const mockUser = {
  id: 'user1',
  username: 'testuser'
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Cards Integration - Phase 6 Features', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    TCGdxService.getSeries.mockResolvedValue(mockSeries);
    TCGdxService.getSetsBySerie.mockResolvedValue(mockSets);
    TCGdxService.getCardsBySet.mockResolvedValue(mockCards);
    TCGdxService.getCard.mockImplementation((id) => {
      return Promise.resolve(mockCards.find(card => card.id === id));
    });
    TCGdxService.getHighQualityImageUrl.mockReturnValue('https://example.com/card.jpg');
    TCGdxService.filterCards.mockImplementation((cards, filters) => {
      if (!filters.name && !filters.rarity) return cards;
      return cards.filter(card => 
        (!filters.name || card.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.rarity || card.rarity.toLowerCase().includes(filters.rarity.toLowerCase()))
      );
    });
    UserCardsService.formatCardForCollection.mockReturnValue({});
    UserCardsService.addUserCard.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('affiche les cartes avec les nouveaux boutons d\'interaction', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    // Générer les cartes
    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Attendre que les cartes s'affichent
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Charmander')).toBeInTheDocument();
    });

    // Vérifier que les boutons de comparaison sont présents
    const comparisonButtons = screen.getAllByTitle(/Ajouter à la comparaison/);
    expect(comparisonButtons).toHaveLength(2);
  });

  test('ouvre le modal détaillé quand on clique sur une carte', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    // Générer les cartes
    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Attendre que les cartes s'affichent
    await waitFor(() => {
      const cardName = screen.getByText('Bulbasaur');
      fireEvent.click(cardName);
    });

    // Vérifier que le modal s'ouvre
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Ajouter à ma collection')).toBeInTheDocument();
    });
  });

  test('ajoute des cartes à la comparaison et affiche le bouton flottant', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension et générer les cartes
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Attendre que les cartes s'affichent
    await waitFor(() => {
      const comparisonButtons = screen.getAllByTitle(/Ajouter à la comparaison/);
      
      // Ajouter la première carte à la comparaison
      fireEvent.click(comparisonButtons[0]);
    });

    // Vérifier que le bouton de comparaison apparaît
    await waitFor(() => {
      expect(screen.getByText(/Comparaison \(1\)/)).toBeInTheDocument();
    });

    // Ajouter une deuxième carte
    await waitFor(() => {
      const comparisonButtons = screen.getAllByTitle(/Ajouter à la comparaison/);
      fireEvent.click(comparisonButtons[1]);
    });

    // Vérifier que le compteur est mis à jour
    await waitFor(() => {
      expect(screen.getByText(/Comparaison \(2\)/)).toBeInTheDocument();
    });
  });

  test('ouvre le modal de comparaison avec les cartes sélectionnées', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension et générer les cartes
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Ajouter des cartes à la comparaison
    await waitFor(() => {
      const comparisonButtons = screen.getAllByTitle(/Ajouter à la comparaison/);
      fireEvent.click(comparisonButtons[0]);
      fireEvent.click(comparisonButtons[1]);
    });

    // Ouvrir le modal de comparaison
    await waitFor(() => {
      const comparisonModalButton = screen.getByText(/Comparaison \(2\)/);
      fireEvent.click(comparisonModalButton);
    });

    // Vérifier que le modal de comparaison s'ouvre
    await waitFor(() => {
      expect(screen.getByText('Comparaison de cartes (2)')).toBeInTheDocument();
      expect(screen.getByText('📋 Détails')).toBeInTheDocument();
      expect(screen.getByText('⚔️ Statistiques')).toBeInTheDocument();
      expect(screen.getByText('💰 Prix')).toBeInTheDocument();
    });
  });

  test('ajoute une carte à la collection depuis le modal détaillé', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension et générer les cartes
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Cliquer sur une carte pour ouvrir le modal
    await waitFor(() => {
      const cardName = screen.getByText('Bulbasaur');
      fireEvent.click(cardName);
    });

    // Dans le modal, cliquer sur "Ajouter à ma collection"
    await waitFor(() => {
      const addButton = screen.getByText('Ajouter à ma collection');
      fireEvent.click(addButton);
    });

    // Vérifier que la fonction d'ajout a été appelée
    expect(UserCardsService.addUserCard).toHaveBeenCalled();
  });

  test('utilise les filtres de recherche avec les nouvelles fonctionnalités', async () => {
    render(
      <TestWrapper>
        <Cards />
      </TestWrapper>
    );

    // Sélectionner série et extension et générer les cartes
    const seriesSelect = screen.getByLabelText('Série :');
    fireEvent.change(seriesSelect, { target: { value: 'sv' } });

    await waitFor(() => {
      const setsSelect = screen.getByLabelText('Extension :');
      fireEvent.change(setsSelect, { target: { value: 'sv1' } });
    });

    const generateButton = screen.getByText('Afficher la série');
    fireEvent.click(generateButton);

    // Attendre que les cartes s'affichent
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Charmander')).toBeInTheDocument();
    });

    // Filtrer par nom
    const nameFilter = screen.getByPlaceholderText('Rechercher par nom...');
    fireEvent.change(nameFilter, { target: { value: 'bulba' } });

    // Vérifier que seule Bulbasaur est affichée (basé sur le mock)
    await waitFor(() => {
      expect(TCGdxService.filterCards).toHaveBeenCalledWith(
        mockCards,
        { name: 'bulba', rarity: '' }
      );
    });
  });
});
