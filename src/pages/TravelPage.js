import React from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Grid } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';

const TravelPage = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Plan Your Next Adventure
      </Typography>

      {/* Flight Search Section */}
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FlightTakeoffIcon sx={{ mr: 1 }} />
          <Typography variant="h5">Search Flights</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="From" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="To" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Departure Date" type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Return Date" type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained">Search Flights</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Hotel Search Section */}
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HotelIcon sx={{ mr: 1 }} />
          <Typography variant="h5">Find Hotels</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Destination" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Check-in Date" type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Check-out Date" type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained">Search Hotels</Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TravelPage;
