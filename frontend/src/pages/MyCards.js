import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MyCards = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Mes Cartes</h1>
        <p>Bienvenue {user?.username} ! Voici votre collection personnelle.</p>
        <p><em>Cette fonctionnalité sera développée en Phase 4</em></p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Fonctionnalités prévues :</h3>
          <ul>
            <li>Affichage de vos cartes possédées</li>
            <li>Ajout de cartes à votre collection</li>
            <li>Modification/suppression de cartes</li>
            <li>Gestion des quantités et états</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
          <p><strong>✅ Authentification fonctionnelle !</strong></p>
          <p>Vous êtes maintenant connecté et pouvez accéder à cette page protégée.</p>
        </div>
      </div>
    </div>
  );
};

export default MyCards;
