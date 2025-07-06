import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, TextField, Box, CardActionArea, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const products = [
  { id: 'product-1', name: 'Vintage Leather Jacket', price: 85.00, image: 'https://via.placeholder.com/300' },
  { id: 'product-2', name: 'Wireless Headphones', price: 120.50, image: 'https://via.placeholder.com/300' },
  { id: 'product-3', name: 'Antique Wooden Chair', price: 250.00, image: 'https://via.placeholder.com/300' },
  { id: 'product-4', name: 'Modern Art Print', price: 45.99, image: 'https://via.placeholder.com/300' },
  { id: 'product-5', name: 'Used Bicycle', price: 150.00, image: 'https://via.placeholder.com/300' },
  { id: 'product-6', name: 'Designer Sunglasses', price: 180.75, image: 'https://via.placeholder.com/300' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const MarketplacePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Simulate a 1.5-second load time
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Discover Unique Items
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField label="Search Products" variant="outlined" sx={{ width: '50%' }} />
      </Box>
            {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          container
          spacing={4}
        >
          {products.map((product) => (
            <Grid item component={motion.div} variants={itemVariants} key={product.id} xs={12} sm={6} md={4}>
              <CardActionArea sx={{ height: '100%' }}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.image}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {`$${product.price.toFixed(2)}`}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MarketplacePage;
