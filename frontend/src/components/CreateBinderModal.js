import React, { useState } from 'react';
import './CreateBinderModal.css';

const BINDER_SIZES = [
  { value: '3x3', label: '3x3 (9 cartes par page)', description: 'Compact et idéal pour les petites collections' },
  { value: '4x4', label: '4x4 (16 cartes par page)', description: 'Équilibré pour la plupart des collections' },
  { value: '5x5', label: '5x5 (25 cartes par page)', description: 'Grand format pour les collections importantes' }
];

const CreateBinderModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    size: '4x4',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Nettoyer les erreurs quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du binder est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const binderData = {
      name: formData.name.trim(),
      size: formData.size,
      description: formData.description.trim() || undefined
    };

    onSubmit(binderData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      size: '4x4',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-binder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🗂️ Créer un nouveau binder</h2>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="binder-form">
          <div className="form-group">
            <label htmlFor="name">
              Nom du binder <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Collection Écarlate et Violet"
              className={errors.name ? 'error' : ''}
              disabled={isLoading}
              maxLength={100}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="size">Taille du binder</label>
            <div className="size-options">
              {BINDER_SIZES.map((size) => (
                <div 
                  key={size.value}
                  className={`size-option ${formData.size === size.value ? 'selected' : ''}`}
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, size: size.value }))}
                >
                  <div className="size-preview">
                    <div className={`grid-preview grid-${size.value.replace('x', '-')}`}>
                      {Array.from({ length: parseInt(size.value[0]) * parseInt(size.value[2]) }).map((_, i) => (
                        <div key={i} className="grid-cell"></div>
                      ))}
                    </div>
                  </div>
                  <div className="size-info">
                    <h4>{size.label}</h4>
                    <p>{size.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="size"
                    value={size.value}
                    checked={formData.size === size.value}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optionnelle)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre binder... (optionnel)"
              rows={3}
              className={errors.description ? 'error' : ''}
              disabled={isLoading}
              maxLength={500}
            />
            <div className="char-counter">
              {formData.description.length}/500
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Création...
                </>
              ) : (
                '✨ Créer le binder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBinderModal;
