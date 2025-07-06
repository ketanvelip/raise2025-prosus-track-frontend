import React from 'react';
import { Container, Typography, Grid, Card, CardActionArea, CardContent, CardMedia, TextField, Box, Button } from '@mui/material';
import { useOptions } from '../context/OptionsContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const restaurants = [
  { id: 'pizza-palace', name: 'Pizza Palace', cuisine: 'Italian', image: 'https://via.placeholder.com/300' },
  { id: 'taco-town', name: 'Taco Town', cuisine: 'Mexican', image: 'https://via.placeholder.com/300' },
  { id: 'sushi-station', name: 'Sushi Station', cuisine: 'Japanese', image: 'https://via.placeholder.com/300' },
  { id: 'burger-barn', name: 'Burger Barn', cuisine: 'American', image: 'https://via.placeholder.com/300' },
  { id: 'curry-corner', name: 'Curry Corner', cuisine: 'Indian', image: 'https://via.placeholder.com/300' },
  { id: 'noodle-house', name: 'Noodle House', cuisine: 'Asian', image: 'https://via.placeholder.com/300' },
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

const FoodOrderingPage = () => {
  const { options, clearOptions } = useOptions();
  const displayItems = options && options.category === 'food' ? options.options : restaurants;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Find Your Next Meal
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField label="Search Restaurants" variant="outlined" sx={{ width: '50%' }} />
      </Box>
      {options && options.category === 'food' && <Button onClick={clearOptions} sx={{ mb: 2 }}>Clear Search & Show All</Button>}
      <Grid
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        container
        spacing={4}
      >
        {displayItems.map((item) => (
          <Grid item component={motion.div} variants={itemVariants} key={item.id || item.item_name} xs={12} sm={6} md={4}>
            <CardActionArea component={Link} to={`/food/${item.id || item.item_name}`} sx={{ height: '100%', textDecoration: 'none' }}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image || item.item_img_url}
                  alt={item.name || item.item_name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {item.name || item.item_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.cuisine || item.item_cuisine}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FoodOrderingPage;
