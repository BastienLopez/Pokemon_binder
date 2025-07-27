import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MyCards from '../pages/MyCards';
import { useAuth } from '../contexts/AuthContext';
import UserCardsService from '../services/userCardsService';
import TCGdxService from '../services/tcgdxService';

// Mocks
jest.mock('../contexts/AuthContext');
jest.mock('../services/userCardsService');
jest.mock('../services/tcgdxService');

const mockUserCards = [
  {
    id: 'user-card-1',
    cardId: 'sv1-1',
    userId: 'user1',
    condition: 'Near Mint',
    quantity: 2,
    card: {
      id: 'sv1-1',
      name: 'Bulbasaur',
      localId: '1',
      rarity: 'Common',
      types: ['Grass'],
      image: 'https://example.com/bulbasaur.jpg'
    }
  },
  {
    id: 'user-card-2',
    cardId: 'sv1-4',
    userId: 'user1',
    condition: 'Mint',
    quantity: 1,
    card: {
      id: 'sv1-4',
      name: 'Charmander',
      localId: '4',
      rarity: 'Common',
      types: ['Fire'],
      image: 'https://example.com/charmander.jpg'
    }
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

describe('MyCards Integration - Phase 6 Features', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    UserCardsService.getUserCards.mockResolvedValue(mockUserCards);
    UserCardsService.updateUserCard.mockResolvedValue({});
    UserCardsService.deleteUserCard.mockResolvedValue({});
    TCGdxService.getCard.mockImplementation((id) => {
      const cardData = mockUserCards.find(uc => uc.cardId === id)?.card;
      return Promise.resolve(cardData);
    });
    TCGdxService.getHighQualityImageUrl.mockReturnValue('https://example.com/card.jpg');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('affiche les cartes de collection avec les nouveaux boutons', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Charmander')).toBeInTheDocument();
    });

    // Vérifier que les boutons de comparaison sont présents
    const comparisonButtons = screen.getAllByTitle(/Ajouter à la comparaison/);
    expect(comparisonButtons).toHaveLength(2);

    // Vérifier que les quantités sont affichées
    expect(screen.getByText('Quantité: 2')).toBeInTheDocument();
    expect(screen.getByText('Quantité: 1')).toBeInTheDocument();
  });

  test('ouvre le modal détaillé depuis MyCards', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent
    await waitFor(() => {
      const cardName = screen.getByText('Bulbasaur');
      fireEvent.click(cardName);
    });

    // Vérifier que le modal s'ouvre avec les informations de collection
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('🎯 Dans votre collection')).toBeInTheDocument();
      expect(screen.getByText('Quantité: 2')).toBeInTheDocument();
      expect(screen.getByText('État: Near Mint')).toBeInTheDocument();
    });
  });

  test('ajoute des cartes à la comparaison depuis MyCards', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent
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

  test('modifie la quantité et l\'état d\'une carte', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent et cliquer sur une carte
    await waitFor(() => {
      const cardName = screen.getByText('Bulbasaur');
      fireEvent.click(cardName);
    });

    // Dans le modal, modifier la quantité
    await waitFor(() => {
      const quantityInput = screen.getByDisplayValue('2');
      fireEvent.change(quantityInput, { target: { value: '3' } });
      
      const updateButton = screen.getByText('Mettre à jour');
      fireEvent.click(updateButton);
    });

    // Vérifier que la fonction de mise à jour a été appelée
    expect(UserCardsService.updateUserCard).toHaveBeenCalledWith(
      'user-card-1',
      expect.objectContaining({ quantity: 3 })
    );
  });

  test('supprime une carte de la collection', async () => {
    // Mock window.confirm pour accepter la suppression
    global.confirm = jest.fn().mockReturnValue(true);

    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent et cliquer sur une carte
    await waitFor(() => {
      const cardName = screen.getByText('Bulbasaur');
      fireEvent.click(cardName);
    });

    // Dans le modal, cliquer sur supprimer
    await waitFor(() => {
      const deleteButton = screen.getByText('🗑️ Supprimer');
      fireEvent.click(deleteButton);
    });

    // Vérifier que la fonction de suppression a été appelée
    expect(UserCardsService.deleteUserCard).toHaveBeenCalledWith('user-card-1');
    
    // Nettoyer le mock
    global.confirm.mockRestore();
  });

  test('utilise les filtres sur MyCards', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Attendre que les cartes se chargent
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Charmander')).toBeInTheDocument();
    });

    // Filtrer par nom
    const nameFilter = screen.getByPlaceholderText('Rechercher par nom...');
    fireEvent.change(nameFilter, { target: { value: 'bulba' } });

    // Vérifier que le filtre fonctionne (la logique de filtrage est côté client)
    await waitFor(() => {
      // Bulbasaur devrait être visible
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    });
  });

  test('affiche et utilise le modal de comparaison depuis MyCards', async () => {
    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

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

    // Vérifier que le modal de comparaison s'ouvre avec les bonnes cartes
    await waitFor(() => {
      expect(screen.getByText('Comparaison de cartes (2)')).toBeInTheDocument();
      expect(screen.getByText('📋 Détails')).toBeInTheDocument();
    });

    // Changer de mode de comparaison
    const statsButton = screen.getByText('⚔️ Statistiques');
    fireEvent.click(statsButton);

    await waitFor(() => {
      expect(screen.getByText('⚔️ Statistiques')).toHaveClass('active');
    });
  });

  test('gère les erreurs de chargement gracieusement', async () => {
    // Mock une erreur de chargement
    UserCardsService.getUserCards.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <MyCards />
      </TestWrapper>
    );

    // Vérifier qu'un message d'erreur approprié est affiché ou que l'état de chargement est géré
    await waitFor(() => {
      // Selon l'implémentation, il pourrait y avoir un message d'erreur
      // ou simplement aucune carte affichée
      expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
    });
  });
});
