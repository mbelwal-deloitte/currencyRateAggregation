import React from 'react';
import { Box, Container, Typography, ThemeProvider, createTheme } from '@mui/material';
import CurrencyDashboard from './components/CurrencyDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Currency Rate Dashboard
          </Typography>
          <CurrencyDashboard />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;