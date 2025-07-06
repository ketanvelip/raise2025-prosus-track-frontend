import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #212121 30%, #424242 90%)' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          AI E-Commerce
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/food">Food</Button>
        {/* <Button color="inherit" component={Link} to="/travel">Travel</Button> */}
        <Button color="inherit" component={Link} to="/market">Market</Button>
        <Button color="inherit" component={Link} to="/profile">Profile</Button>
        <IconButton color="inherit" component={Link} to="/cart">
          <Badge badgeContent={totalItems} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
