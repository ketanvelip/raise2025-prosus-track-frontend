import React from 'react';
import { Container, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useState, useEffect } from 'react';

const services = [
  { name: 'Food Ordering', path: '/food', description: 'Order from your favorite restaurants.' },
  { name: 'Travel Booking', path: '/travel', description: 'Plan your next adventure.' },
  { name: 'Product Marketplace', path: '/market', description: 'Buy and sell new and used items.' },
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

const HomePage = () => {
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
        Welcome to the Future of E-Commerce
      </Typography>
      <Typography variant="h5" component="h2" color="text.secondary" gutterBottom align="center">
        Your AI-powered assistant for everything you need.
      </Typography>
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
          sx={{ mt: 4 }}
        >
          {services.filter(service => service.path !== '/travel').map((service) => (
            <Grid item component={motion.div} variants={itemVariants} key={service.name} xs={12} sm={6} md={4}>
              <CardActionArea component={Link} to={service.path}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {service.name}
                    </Typography>
                    <Typography>
                      {service.description}
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

export default HomePage;
