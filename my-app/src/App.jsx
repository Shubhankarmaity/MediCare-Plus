import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ScrollToHash from './components/ScrollToHash';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import MediBot from './components/MediBot';

// Define the clinical standard design system theme for MUI
const clinicalTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  palette: {
    primary: {
      main: '#0066cc', // Primary Blue
      dark: '#0f172a', // Primary Navy
    },
    secondary: {
      main: '#0d9488', // Soft Teal
    },
    background: {
      default: '#f8fafc', // Off-White
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#0066cc',
          '&:hover': {
            backgroundColor: '#0056b3',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={clinicalTheme}>
      <Router>
        <ScrollProgress />
        <ScrollToHash />
        <AnimatedRoutes />
        <BackToTop />
        {/* AI Chatbot — visible on all pages */}
        <MediBot />
      </Router>
    </ThemeProvider>
  );
}

export default App;
