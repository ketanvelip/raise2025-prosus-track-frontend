import React, { useState, useEffect, useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FoodOrderingPage from './pages/FoodOrderingPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import MarketplacePage from './pages/MarketplacePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import { useUser, UserContext } from './context/UserContext';
import Notification from './components/Notification';
import Sidebar from './components/Sidebar';

const ProtectedRoute = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(UserContext);

  const [conversations, setConversations] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    if (user && user.user_id) {
      const conversationsKey = `conversations_${user.user_id}`;
      const currentIdKey = `currentConversationId_${user.user_id}`;

      try {
        const savedConversations = localStorage.getItem(conversationsKey);
        const loadedConversations = savedConversations ? JSON.parse(savedConversations) : {};
        setConversations(loadedConversations);

        const savedId = localStorage.getItem(currentIdKey);
        const existingIds = Object.keys(loadedConversations);

        if (savedId && loadedConversations[savedId]) {
          setCurrentConversationId(savedId);
        } else if (existingIds.length > 0) {
          setCurrentConversationId(existingIds.sort((a, b) => b.localeCompare(a))[0]);
        } else {
          const newId = uuidv4();
          const newConversations = { [newId]: [] };
          setConversations(newConversations);
          setCurrentConversationId(newId);
          localStorage.setItem(conversationsKey, JSON.stringify(newConversations));
          localStorage.setItem(currentIdKey, newId);
        }
      } catch (error) {
        console.error('Failed to load user conversations from localStorage', error);
        setConversations({});
        setCurrentConversationId(null);
      }
    } else {
      setConversations({});
      setCurrentConversationId(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.user_id && currentConversationId) {
      const conversationsKey = `conversations_${user.user_id}`;
      const currentIdKey = `currentConversationId_${user.user_id}`;
      localStorage.setItem(conversationsKey, JSON.stringify(conversations));
      localStorage.setItem(currentIdKey, currentConversationId);
    }
  }, [conversations, currentConversationId, user]);

  const handleNewConversation = useCallback(() => {
    const newId = uuidv4();
    setConversations(prev => ({ ...prev, [newId]: [] }));
    setCurrentConversationId(newId);
  }, []);

  const setChatHistory = useCallback((updater) => {
    if (!currentConversationId) return;
    setConversations(prev => {
      const newConversations = { ...prev };
      const currentHistory = newConversations[currentConversationId] || [];
      newConversations[currentConversationId] = typeof updater === 'function' ? updater(currentHistory) : updater;
      return newConversations;
    });
  }, [currentConversationId]);

  const chatHistory = conversations[currentConversationId] || [];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage key={currentConversationId} chatHistory={chatHistory} setChatHistory={setChatHistory} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/food" element={<FoodOrderingPage />} />
            <Route path="/food/:restaurantId" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/market" element={<MarketplacePage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/profile/orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </Box>
      <Sidebar 
        open={sidebarOpen} 
        onClose={toggleSidebar} 
        conversations={conversations} 
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        currentConversationId={currentConversationId}
      />
      <Notification />
    </Box>
  );
}

export default App;
