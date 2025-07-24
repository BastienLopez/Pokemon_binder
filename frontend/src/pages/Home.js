import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const Home = () => {
  const [apiStatus, setApiStatus] = useState('Vérification...');

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await apiService.get('/health');
      setApiStatus('✅ API connectée');
    } catch (error) {
      setApiStatus('❌ API non accessible');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Bienvenue sur Pokémon TCG Binder</h1>
        <p>Gérez votre collection de cartes Pokémon TCG facilement !</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🚀 Phase 1 - Infrastructure</h3>
          <p><strong>Status API:</strong> {apiStatus}</p>
          <ul>
            <li>✅ Frontend React configuré</li>
            <li>✅ Backend FastAPI configuré</li>
            <li>✅ Base de données MongoDB (via Docker)</li>
            <li>✅ Docker Compose pour le développement</li>
            <li>✅ Outils de développement (ESLint, Prettier)</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>📋 Prochaines étapes</h3>
          <p>Phase 2 : Authentification utilisateur (inscription/connexion)</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
