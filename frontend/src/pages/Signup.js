import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Nettoie automatiquement les valeurs d'autocomplétion indésirables
  useEffect(() => {
    setFormData(prevData => ({
      email: prevData.email === 'CWYHZA' ? '' : prevData.email,
      username: prevData.username === 'CWYHZA' ? '' : prevData.username,
      password: prevData.password === 'CWYHZA' ? '' : prevData.password,
      confirmPassword: prevData.confirmPassword === 'CWYHZA' ? '' : prevData.confirmPassword,
      full_name: prevData.full_name === 'CWYHZA' ? '' : prevData.full_name
    }));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value === 'CWYHZA' ? '' : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' }
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Inscription</h1>
        <p>Créez votre compte Pokémon TCG Binder</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nom d&apos;utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Nom complet (optionnel)</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={(e) => {
                if (e.target.value === 'CWYHZA') {
                  setFormData({...formData, password: ''});
                }
              }}
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={(e) => {
                if (e.target.value === 'CWYHZA') {
                  setFormData({...formData, confirmPassword: ''});
                }
              }}
              required
              disabled={loading}
              autoComplete="new-password"
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Déjà un compte ? {' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
