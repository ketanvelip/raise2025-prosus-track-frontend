import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Divider, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useOrders } from '../context/OrderContext';

const OrdersPage = () => {
  const { orders } = useOrders();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Your Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography align="center">You have no past orders.</Typography>
      ) : (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
          {orders.map((order) => (
            <Accordion key={order.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  Order #{order.id.split('-')[0]}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {new Date(order.date).toLocaleDateString()}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                <Typography variant="h6" align="right">Total: ${order.total.toFixed(2)}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default OrdersPage;
