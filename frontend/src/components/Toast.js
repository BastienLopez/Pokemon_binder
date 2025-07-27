import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3 secondes

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-show' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
