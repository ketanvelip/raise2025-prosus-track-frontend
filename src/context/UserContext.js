import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = Cookies.get('userEmail');
    if (userEmail) {
      setUser({ email: userEmail, walletBalance: 1500 }); // Mock wallet balance
    }
    setLoading(false);
  }, []);

  const login = (email) => {
    Cookies.set('userEmail', email, { expires: 7 });
    setUser({ email, walletBalance: 1500 });
  };

  const logout = () => {
    Cookies.remove('userEmail');
    setUser(null);
  };

  const updateWalletBalance = (amount) => {
    if (user) {
      setUser((prevUser) => ({ ...prevUser, walletBalance: prevUser.walletBalance - amount }));
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateWalletBalance }}>
      {children}
    </UserContext.Provider>
  );
};
