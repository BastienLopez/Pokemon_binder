import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Rediriger vers l'accueil (compat Pages et dev)
    const base = process.env.NODE_ENV === 'production' ? (process.env.PUBLIC_URL || '') : '';
    window.location.href = base + '/';
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const userData = await apiService.get('/auth/me');
      setUser(userData);
    } catch (error) {
      // Token invalid or expired
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token, checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Get user info
      const userData = await apiService.get('/auth/me');
      setUser(userData);
      
      return { success: true, userId: userData.id };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de connexion' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      await apiService.post('/auth/signup', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur lors de l&apos;inscription' 
      };
    }
  };

  // logout is defined above with useCallback

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
