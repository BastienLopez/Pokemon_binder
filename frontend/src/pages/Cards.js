import React from 'react';

const Cards = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Cartes Pokémon TCG</h1>
        <p>Cette page affichera le listing des cartes Pokémon TCG.</p>
        <p><em>À implémenter en Phase 3</em></p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Fonctionnalités prévues :</h3>
          <ul>
            <li>Listing des cartes par extension</li>
            <li>Filtres (extension, rareté, nom)</li>
            <li>Pagination ou scroll infini</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Cards;
