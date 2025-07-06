import React, { createContext, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = (cartItems, total) => {
    const newOrder = {
      id: uuidv4(),
      date: new Date(),
      items: cartItems,
      total,
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    return newOrder;
  };

  const value = {
    orders,
    addOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
