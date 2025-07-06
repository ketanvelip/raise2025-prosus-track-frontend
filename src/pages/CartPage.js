import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Divider, Button, Box } from '@mui/material';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user, updateWalletBalance } = useUser();
  const { showNotification } = useNotification();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (user.walletBalance >= total) {
      const newOrder = addOrder(cartItems, total);
      updateWalletBalance(total);
      clearCart();
      showNotification('Checkout successful!', 'success');
      navigate('/order-confirmation', { state: { order: newOrder } });
    } else {
      showNotification('Insufficient funds!', 'error');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Your Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Typography align="center">Your cart is empty.</Typography>
      ) : (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
          <List>
            {cartItems.map((item, index) => (
              <React.Fragment key={`${item.id}-${item.restaurant}`}>
                <ListItem>
                  <ListItemText 
                    primary={`${item.name} (x${item.quantity})`}
                    secondary={`$${(item.price * item.quantity).toFixed(2)}`}
                  />
                </ListItem>
                {index < cartItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" align="right">Total: ${total.toFixed(2)}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCheckout}>Proceed to Checkout</Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;
