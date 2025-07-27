import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardComparison from './CardComparison';

// Mock du service
jest.mock('../services/tcgdexService', () => ({
  getHighQualityImageUrl: jest.fn(() => 'https://example.com/card.jpg')
}));

const mockCards = [
  {
    id: 'card1',
    name: 'Bulbasaur',
    image: 'https://example.com/bulbasaur.jpg',
    types: ['Grass'],
    rarity: 'Common',
    hp: 45
  }
];

describe('CardComparison', () => {
  test('renders comparison modal when open', () => {
    render(
      <CardComparison 
        cards={mockCards}
        isOpen={true}
        onClose={jest.fn()}
        onRemoveCard={jest.fn()}
      />
    );

    expect(screen.getByText('Comparaison de cartes (1)')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <CardComparison 
        cards={mockCards}
        isOpen={false}
        onClose={jest.fn()}
        onRemoveCard={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});