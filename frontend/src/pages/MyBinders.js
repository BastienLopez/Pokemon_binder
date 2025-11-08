import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import binderService from '../services/binderService';
import CreateBinderModal from '../components/CreateBinderModal';
import BinderCard from '../components/BinderCard';
import ConfirmModal from '../components/ConfirmModal';
import Notification from '../components/Notification';
import './MyBinders.css';

const MyBinders = () => {
  const navigate = useNavigate();
  const [binders, setBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, binder: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadBinders();
  }, []);

  const loadBinders = async () => {
    try {
      setLoading(true);
      setError('');
      const bindersData = await binderService.getUserBinders();
      setBinders(Array.isArray(bindersData) ? bindersData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des binders:', error);
      setError(error.message || 'Erreur lors du chargement des binders');
      setBinders([]); // S'assurer qu'on a toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBinder = async (binderData) => {
    try {
      setIsCreating(true);
      
      const newBinder = await binderService.createBinder(binderData);
      
      if (!newBinder) {
        throw new Error('Le serveur n\'a pas retourné de données pour le nouveau binder');
      }
      
      // S'assurer que le nouveau binder a les propriétés nécessaires
      const binderWithDefaults = {
        ...newBinder,
        total_cards: newBinder.total_cards || 0,
        total_pages: newBinder.total_pages || 1
      };
      
      setBinders(prev => [binderWithDefaults, ...prev]);
      setIsCreateModalOpen(false);
      showNotification('Binder créé avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la création du binder:', error);
      showNotification(error.message || 'Erreur lors de la création du binder', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewBinder = (binder) => {
    navigate(`/binder/${binder.id}`);
  };

  const handleEditBinder = (binder) => {
    // TODO: Implémenter l'édition
    console.log('Éditer le binder:', binder);
  };

  const handleDeleteBinder = (binder) => {
    setDeleteModal({ isOpen: true, binder });
  };

  const confirmDeleteBinder = async () => {
    try {
      await binderService.deleteBinder(deleteModal.binder.id);
      setBinders(prev => prev.filter(b => b.id !== deleteModal.binder.id));
      setDeleteModal({ isOpen: false, binder: null });
      showNotification('🗑️ Binder supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression du binder:', error);
      showNotification(error.message || 'Erreur lors de la suppression du binder', 'error');
    }
  };

  const handlePreviewBinder = (binder) => {
    // TODO: Implémenter la preview rapide
    console.log('Preview du binder:', binder);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  if (loading) {
    return (
      <div className="my-binders">
        <div className="page-header">
          <h2>🗂️ Mes Binders</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Chargement de vos binders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-binders">
        <div className="page-header">
          <h2>🗂️ Mes Binders</h2>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadBinders}>
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-binders">
      <div className="page-header">
        <div className="header-content">
          <h2>Mes Binders</h2>
          <p className="header-subtitle">
            Organisez votre collection de cartes Pokémon en classeurs virtuels
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/deck-builder')}
          >
            🎴 Créer un deck
          </button>
          <button 
            className="btn btn-primary create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Créer un binder
          </button>
        </div>
      </div>

      {!binders || binders.length === 0 ? (
        <div className="empty-state">
          <h3>Aucun binder pour le moment</h3>
          <p>Créez votre premier classeur virtuel pour organiser vos cartes Pokémon</p>
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Créer mon premier binder
          </button>
        </div>
      ) : (
        <div className="binders-container">
          <div className="binders-stats">
            <div className="stat">
              <span className="stat-value">{binders.length}</span>
              <span className="stat-label">binder{binders.length > 1 ? 's' : ''}</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {binders.reduce((total, binder) => total + (binder.total_cards || 0), 0)}
              </span>
              <span className="stat-label">cartes organisées</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {binders.reduce((total, binder) => total + (binder.total_pages || 0), 0)}
              </span>
              <span className="stat-label">pages au total</span>
            </div>
          </div>

          <div className="binders-grid">
            {binders.map((binder) => (
              <BinderCard
                key={binder.id}
                binder={binder}
                onView={handleViewBinder}
                onEdit={handleEditBinder}
                onDelete={handleDeleteBinder}
                onPreview={handlePreviewBinder}
              />
            ))}
          </div>
        </div>
      )}

      <CreateBinderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBinder}
        isLoading={isCreating}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, binder: null })}
        onConfirm={confirmDeleteBinder}
        title="Supprimer le binder"
        message={`Êtes-vous sûr de vouloir supprimer le binder "${deleteModal.binder?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        confirmType="danger"
      />

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
};

export default MyBinders;
