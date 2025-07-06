import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { cartItems } = useCart();
  const { user, logout } = useContext(UserContext);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleAccount = () => {
    handleClose();
    navigate('/profile');
  };

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
        <IconButton color="inherit" component={Link} to="/cart">
          <Badge badgeContent={totalItems} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        {user ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={handleAccount}>My account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
