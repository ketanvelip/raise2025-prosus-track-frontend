import React, { createContext, useState, useContext, useCallback } from 'react';
import { generateOptions } from '../services/api';

const OptionsContext = createContext();

export const useOptions = () => useContext(OptionsContext);

export const OptionsProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async (email, inputText) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateOptions(email, inputText);
      setOptions(data);
    } catch (err) {
      setError('Failed to fetch options. Please try again.');
      console.error(err);
    }
    setLoading(false);
  }, []);

  const clearOptions = useCallback(() => {
    setOptions(null);
  }, []);

  const value = {
    options,
    loading,
    error,
    fetchOptions,
    clearOptions,
  };

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  );
};
