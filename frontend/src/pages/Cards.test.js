import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cards from './Cards';

// Mock des contextes et services
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

jest.mock('../services/tcgdexService', () => ({
  getSeries: jest.fn(),
  getSetsBySerie: jest.fn(),
  getCardsBySet: jest.fn(),
  filterCards: jest.fn(),
  getHighQualityImageUrl: jest.fn(),
}));

jest.mock('../hooks/useCardComparison', () => ({
  __esModule: true,
  default: () => ({
    comparisonCards: [],
    addCardToComparison: jest.fn(),
    removeCardFromComparison: jest.fn(),
    clearComparison: jest.fn()
  })
}));

describe('Cards Component', () => {
  test('renders Cards component', () => {
    render(
      <BrowserRouter>
        <Cards />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cartes disponibles')).toBeInTheDocument();
  });
});
