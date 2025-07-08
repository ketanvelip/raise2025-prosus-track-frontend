import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import App from './App';
import { UserProvider } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import { OptionsProvider } from './context/OptionsContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import reportWebVitals from './reportWebVitals';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router>
        <NotificationProvider>
          <UserProvider>
            <OrderProvider>
              <OptionsProvider>
                <CartProvider>
                  <CssBaseline />
                  <App />
                </CartProvider>
              </OptionsProvider>
            </OrderProvider>
          </UserProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
