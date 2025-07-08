import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import theme from './theme/theme';
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
import { UserProvider, useUser } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import { OptionsProvider } from './context/OptionsContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
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

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('conversations');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to parse conversations from localStorage', error);
      return {};
    }
  });

  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem('currentConversationId');
    const existingIds = Object.keys(conversations);

    if (savedId && conversations[savedId]) {
      setCurrentConversationId(savedId);
    } else if (existingIds.length > 0) {
      setCurrentConversationId(existingIds.sort((a, b) => b.localeCompare(a))[0]); // Get the most recent
    } else {
      const newId = uuidv4();
      setConversations({ [newId]: [] });
      setCurrentConversationId(newId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial load

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
    }
  }, [conversations, currentConversationId]);

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
    <ThemeProvider theme={theme}>
      <Router>
        <NotificationProvider>
          <UserProvider>
            <OrderProvider>
              <OptionsProvider>
                <CartProvider>
                  <CssBaseline />
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
                </CartProvider>
              </OptionsProvider>
            </OrderProvider>
          </UserProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
