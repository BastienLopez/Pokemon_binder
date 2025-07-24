import React from 'react';

const MyBinders = () => {
  return (
    <div className="my-binders">
      <h2>Mes Binders</h2>
      <div className="binders-container">
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>Aucun binder pour le moment</h3>
          <p>Créez votre premier classeur virtuel pour organiser vos cartes Pokémon</p>
          <button className="btn btn-primary">
            + Créer mon premier binder
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBinders;
