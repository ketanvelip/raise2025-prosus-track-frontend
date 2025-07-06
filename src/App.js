import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import theme from './theme/theme';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FoodOrderingPage from './pages/FoodOrderingPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import TravelPage from './pages/TravelPage';
import MarketplacePage from './pages/MarketplacePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrderProvider } from './context/OrderContext';
import Notification from './components/Notification';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <UserProvider>
            <OrderProvider>
              <CartProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header />
                  <Box component="main" sx={{ flexGrow: 1 }}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/food" element={<FoodOrderingPage />} />
                      <Route path="/food/:restaurantId" element={<MenuPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      {/* <Route path="/travel" element={<TravelPage />} /> */}
                      <Route path="/market" element={<MarketplacePage />} />
                      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                      <Route path="/profile/orders" element={<OrdersPage />} />
                      {/* Define other routes here */}
                    </Routes>
                  </Box>
                  <Footer />
                  <Notification />
                </Box>
              </CartProvider>
            </OrderProvider>
          </UserProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
