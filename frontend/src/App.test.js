import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

test('renders Pokemon TCG Binder title', () => {
  render(<AppWithRouter />);
  const titleElement = screen.getByText(/Pokémon TCG Binder/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<AppWithRouter />);
  const homeLink = screen.getByText('Accueil');
  const cardsLink = screen.getByText('Cartes');
  const myCardsLink = screen.getByText('Mes Cartes');
  
  expect(homeLink).toBeInTheDocument();
  expect(cardsLink).toBeInTheDocument();
  expect(myCardsLink).toBeInTheDocument();
});
