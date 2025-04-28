import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import Router from './Router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <Router />
      </StyledThemeProvider>
    </ThemeProvider>
  </React.StrictMode>
); 