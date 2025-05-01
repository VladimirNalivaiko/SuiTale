import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4318d1',
      dark: '#3612a9',
    },
    secondary: {
      main: '#dc004e',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    background: {
      default: '#f7f7ff',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h4: {
      fontWeight: 'bold',
      color: '#4318d1',
    },
    h6: {
      fontWeight: 'bold',
      color: '#4318d1',
    },
    body1: {
      color: '#333333',
      lineHeight: 1.5,
    },
    body2: {
      color: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontFamily: 'Montserrat, sans-serif',
        },
        contained: {
          backgroundColor: '#4318d1',
          color: 'white',
          '&:hover': {
            backgroundColor: '#3612a9',
          },
        },
        outlined: {
          borderColor: '#f7f7ff',
          color: '#000',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f7f7ff',
          color: '#4318d1',
          borderRadius: 1,
          height: 32,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderColor: '#f7f7ff',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#f7f7ff',
        },
      },
    },
  },
}); 