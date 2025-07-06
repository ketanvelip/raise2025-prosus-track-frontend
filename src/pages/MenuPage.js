import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Divider, Box, IconButton } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../context/CartContext';

// Mock data for restaurant menus
const menus = {
  'pizza-palace': {
    name: 'Pizza Palace',
    items: [
      { id: 1, name: 'Margherita Pizza', price: 12.99 },
      { id: 2, name: 'Pepperoni Pizza', price: 14.99 },
      { id: 3, name: 'Garlic Bread', price: 5.99 },
    ],
  },
  'taco-town': {
    name: 'Taco Town',
    items: [
      { id: 1, name: 'Beef Tacos', price: 9.99 },
      { id: 2, name: 'Chicken Burrito', price: 11.99 },
      { id: 3, name: 'Chips and Guacamole', price: 6.99 },
    ],
  },
  // Add other menus as needed
};

const MenuPage = () => {
  const { restaurantId } = useParams();
  const { addToCart } = useCart();
  const menu = menus[restaurantId] || { name: 'Restaurant not found', items: [] };

  const handleAddToCart = (item) => {
    addToCart({ ...item, restaurant: restaurantId });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        {menu.name}
      </Typography>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <List>
          {menu.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="add to cart" onClick={() => handleAddToCart(item)}>
                    <AddShoppingCartIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={item.name} secondary={`$${item.price.toFixed(2)}`} />
              </ListItem>
              {index < menu.items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default MenuPage;
