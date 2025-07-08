import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${user.user_id}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>Your Orders</Typography>
      {orders.length === 0 ? (
        <Typography>You have no past orders.</Typography>
      ) : (
        <List>
          {orders.map(order => (
            <ListItem key={order.order_id} button onClick={() => navigate(`/orders/${order.order_id}`)}>
              <ListItemText 
                primary={`Order #${order.order_id}`}
                secondary={`Status: ${order.status} - Items: ${order.items.join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}

export default OrdersPage;
