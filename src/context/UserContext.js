import React, { createContext, useState, useEffect, useContext } from 'react';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Ensure wallet balance exists, defaulting if not
        if (typeof parsedUser.walletBalance === 'undefined') {
          parsedUser.walletBalance = 1500;
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userToStore = { ...userData, walletBalance: userData.walletBalance || 1500 };
    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateWalletBalance = (amount) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: user.walletBalance - amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateWalletBalance }}>
      {children}
    </UserContext.Provider>
  );
};
