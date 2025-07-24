import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const Home = () => {
  const { user } = useAuth();

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (user) {
    return <Navigate to="/user" replace />;
  }

  // Sinon afficher la landing page
  return <LandingPage />;
};

export default Home;
