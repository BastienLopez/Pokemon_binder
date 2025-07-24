import React, { useEffect, useRef } from 'react';

const CleanInput = ({ onFocus, onChange, value, ...props }) => {
  const inputRef = useRef();

  const handleFocus = (e) => {
    // Nettoie les valeurs d'autocomplétion indésirables au focus
    if (e.target.value === 'CWYHZA' || e.target.value.includes('CWYHZA')) {
      e.target.value = '';
      if (onChange) {
        onChange({
          target: {
            name: e.target.name,
            value: ''
          }
        });
      }
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleChange = (e) => {
    // Nettoie les valeurs pendant la saisie
    let cleanValue = e.target.value;
    if (cleanValue === 'CWYHZA' || cleanValue.includes('CWYHZA')) {
      cleanValue = '';
    }
    
    if (onChange) {
      onChange({
        target: {
          name: e.target.name,
          value: cleanValue
        }
      });
    }
  };

  // Nettoie la valeur au montage du composant
  useEffect(() => {
    if (inputRef.current && inputRef.current.value === 'CWYHZA') {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <input
      ref={inputRef}
      {...props}
      value={value === 'CWYHZA' ? '' : value}
      onFocus={handleFocus}
      onChange={handleChange}
    />
  );
};

export default CleanInput;
