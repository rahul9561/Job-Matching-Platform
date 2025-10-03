import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6', // Blue similar to Tailwind's blue-500
    },
    secondary: {
      main: '#EF4444', // Red similar to Tailwind's red-500 for error
    },
    background: {
      default: '#F3F4F6', // Light gray similar to Tailwind's gray-100
    },
  },
  typography: {
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      color: '#1F2937', // Tailwind's gray-800
    },
    body1: {
      fontSize: '1.25rem',
      color: '#4B5563', // Tailwind's gray-600
    },
  },
});

const NotFound = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '91vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'secondary.main',
              mb: 2,
            }}
          />
          <Typography variant="h1" gutterBottom>
            404 - Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/"
            sx={{ textTransform: 'none', px: 4, py: 1.5 }}
          >
            Go to Home
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NotFound;