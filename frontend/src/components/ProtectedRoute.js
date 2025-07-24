import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserParam } from '../hooks/useUserParam';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const userIdFromUrl = useUserParam();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si pas d'ID dans l'URL et que l'utilisateur est connecté, rediriger avec l'ID
  if (!userIdFromUrl && user && user.id) {
    const currentPath = location.pathname;
    return <Navigate to={`${currentPath}?id=${user.id}`} replace />;
  }

  // Vérifier que l'ID dans l'URL correspond à l'utilisateur connecté
  if (userIdFromUrl && user && userIdFromUrl !== user.id) {
    const currentPath = location.pathname;
    return <Navigate to={`${currentPath}?id=${user.id}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
