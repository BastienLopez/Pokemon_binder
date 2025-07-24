import React from 'react';

const MyCards = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Mes Cartes</h1>
        <p>Cette page permettra de gérer votre collection personnelle.</p>
        <p><em>À implémenter en Phase 4</em></p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Fonctionnalités prévues :</h3>
          <ul>
            <li>Affichage de vos cartes possédées</li>
            <li>Ajout de cartes à votre collection</li>
            <li>Modification/suppression de cartes</li>
            <li>Gestion des quantités et états</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>Note :</strong> Cette fonctionnalité nécessite d&apos;être connecté (Phase 2)</p>
        </div>
      </div>
    </div>
  );
};

export default MyCards;
