import { createTheme, PaletteOptions, SimplePaletteColorOptions } from '@mui/material/styles';

interface ExtendedPaletteOptions extends PaletteOptions {
  primary: SimplePaletteColorOptions;
  secondary: SimplePaletteColorOptions;
  error: SimplePaletteColorOptions;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

// Define the light palette
const lightPalette: ExtendedPaletteOptions = {
  mode: 'light',
  primary: {
    main: '#9c4dff', // Keeping your primary color
    light: '#c07fff',
    dark: '#7e3cc9',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4caf50', // Keeping your secondary color
    light: '#80e27e',
    dark: '#087f23',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f44336',
  },
  background: {
    default: '#f4f6f8', // A light grey for the page background
    paper: '#ffffff',   // White for paper elements
  },
  text: {
    primary: 'rgb(25, 4, 35)', // Your dark purple text, good contrast on light
    secondary: 'rgba(25, 4, 35, 0.7)', 
    disabled: 'rgba(25, 4, 35, 0.5)',
  },
  divider: 'rgba(0, 0, 0, 0.12)', // Standard light theme divider
};

// Define the dark palette (based on your existing theme)
const darkPalette: ExtendedPaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#7b2cbf',    // Darker purple for dark theme (was #8c3ce0)
    light: '#9d5fe0',   // Adjusted light variant (was #ac6bff)
    dark: '#5c1f95',    // Adjusted dark variant (was #6d2ab2)
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4caf50',
    light: '#80e27e',
    dark: '#087f23',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f44336',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff', // White text for dark theme
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

// Function to create the theme based on mode
export const getAppTheme = (mode: 'light' | 'dark') => {
  const currentPalette = mode === 'light' ? lightPalette : darkPalette;
  
  return createTheme({
    palette: currentPalette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '3.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'light' 
                ? '0px 2px 10px rgba(156, 77, 255, 0.2)' // Softer shadow for light theme
                : '0px 2px 10px rgba(156, 77, 255, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Important to remove any default gradient/image
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            // Let AppBar background be controlled by theme.palette.background.paper or similar
            // boxShadow: mode === 'light' 
            //   ? '0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.03)' // Softer shadow for light appbar
            //   : '0px 2px 10px rgba(0, 0, 0, 0.3)', // Your existing dark shadow
            // backgroundColor is handled by color="inherit" or similar in Header.tsx + theme
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              color: currentPalette.text.primary,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: currentPalette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: currentPalette.text.secondary,
            },
            '& .MuiInputBase-input::selection': {
                backgroundColor: currentPalette.primary.main,
                color: currentPalette.primary.contrastText,
            },
          },
        },
      },
      // Potentially add overrides for MuiDrawer if needed, e.g., for box-shadow based on mode
      // MuiDrawer: {
      //   styleOverrides: {
      //     paper: {
      //       boxShadow: mode === 'light' ? '...' : '...'
      //     }
      //   }
      // }
    },
  });
};

// For initial load or if theme context is not yet available, you might want a default theme.
// However, the ThemeProvider will handle this.
// export default getAppTheme('light'); // Or 'dark' as your default preference.
// We will remove the default export and rely on the provider. 