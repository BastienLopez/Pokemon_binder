import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Nettoie automatiquement les valeurs d'autocomplétion indésirables
  useEffect(() => {
    setFormData(prevData => ({
      email: prevData.email === 'CWYHZA' ? '' : prevData.email,
      password: prevData.password === 'CWYHZA' ? '' : prevData.password
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
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/user');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Connexion</h1>
        <p>Connectez-vous à votre compte Pokémon TCG Binder</p>

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
              disabled={loading}
              autoComplete="current-password"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Pas encore de compte ? {' '}
            <Link to="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
