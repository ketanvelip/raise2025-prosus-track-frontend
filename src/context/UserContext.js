import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    avatar: '/static/images/avatar/1.jpg',
    walletBalance: 150.75,
  });

  const updateWalletBalance = (amount) => {
    setUser((prevUser) => ({
      ...prevUser,
      walletBalance: prevUser.walletBalance - amount,
    }));
  };

  const value = {
    user,
    updateWalletBalance,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
