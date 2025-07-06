import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import theme from './theme/theme';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FoodOrderingPage from './pages/FoodOrderingPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import MarketplacePage from './pages/MarketplacePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import { CartProvider } from './context/CartContext';
import { UserProvider, UserContext } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrderProvider } from './context/OrderContext';
import { OptionsProvider } from './context/OptionsContext';
import LoginPage from './pages/LoginPage';
import { useContext } from 'react';
import Notification from './components/Notification';

const ProtectedRoute = () => {
  const { user, loading } = useContext(UserContext);

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <UserProvider>
            <OrderProvider>
              <OptionsProvider>
                <CartProvider>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<ProtectedRoute />}>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/food" element={<FoodOrderingPage />} />
                          <Route path="/food/:restaurantId" element={<MenuPage />} />
                          <Route path="/cart" element={<CartPage />} />
                          {/* <Route path="/travel" element={<TravelPage />} /> */}
                          <Route path="/market" element={<MarketplacePage />} />
                          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                          <Route path="/profile/orders" element={<OrdersPage />} />
                        </Route>
                      </Routes>
                    </Box>
                    <Footer />
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
