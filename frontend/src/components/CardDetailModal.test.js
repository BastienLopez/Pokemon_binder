import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardDetailModal from './CardDetailModal';

// Mock des contextes et services
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

jest.mock('../services/tcgdexService', () => ({
  getCard: jest.fn(),
  getHighQualityImageUrl: jest.fn()
}));

jest.mock('../services/userCardsService', () => ({
  getUserCardByCardId: jest.fn(),
  addUserCard: jest.fn(),
  updateUserCard: jest.fn(),
  deleteUserCard: jest.fn()
}));

jest.mock('../services/binderService', () => ({
  getUserBinders: jest.fn()
}));

const mockCard = {
  id: 'sv1-1',
  name: 'Bulbasaur',
  image: 'https://example.com/bulbasaur.jpg',
  types: ['Grass'],
  rarity: 'Common',
  hp: 45
};

describe('CardDetailModal', () => {
  test('renders modal when card is provided', () => {
    render(
      <CardDetailModal 
        card={mockCard}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <CardDetailModal 
        card={mockCard}
        isOpen={false}
        onClose={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});