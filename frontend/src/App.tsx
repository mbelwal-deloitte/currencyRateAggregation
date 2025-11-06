import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CurrencyDashboard from './components/CurrencyDashboard';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Currency Rate Dashboard
        </Typography>
        <CurrencyDashboard />
      </Box>
    </Container>
  );
}

export default App;