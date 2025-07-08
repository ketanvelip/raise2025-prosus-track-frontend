import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, CardContent, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${orderId}`);
        if (response.data.user_id === user.user_id) {
          setOrder(response.data);
        } else {
          console.error('Unauthorized access to order');
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  if (loading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
  }

  if (!order) {
    return <Container><Typography>Order not found or you do not have permission to view it.</Typography></Container>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Order Details
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Order ID: {order.order_id}</Typography>
          <Typography color="text.secondary">Status: {order.status}</Typography>
          <Typography sx={{ mt: 2 }}>Items:</Typography>
          <List>
            {order.items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
          <Typography sx={{ mt: 2 }}>Restaurant ID: {order.restaurant_id}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default OrderDetailPage;
