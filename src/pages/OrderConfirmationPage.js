import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { order } = location.state || {};

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" align="center">No order details found.</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button component={Link} to="/" variant="contained">Go to Home</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Thank You for Your Order!
      </Typography>
      <Paper sx={{ p: 4, mt: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>Order Confirmation #{order.id.split('-')[0]}</Typography>
        <List>
          {order.items.map((item, index) => (
            <React.Fragment key={`${item.id}-${item.restaurant}`}>
              <ListItem>
                <ListItemText 
                  primary={`${item.name} (x${item.quantity})`}
                  secondary={`$${(item.price * item.quantity).toFixed(2)}`}
                />
              </ListItem>
              {index < order.items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" align="right">Total: ${order.total.toFixed(2)}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button component={Link} to="/profile/orders" variant="contained">View All Orders</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;
