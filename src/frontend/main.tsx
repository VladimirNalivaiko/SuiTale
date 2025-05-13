import React from 'react';
import ReactDOM from 'react-dom/client';
// import { ThemeProvider } from '@mui/material/styles'; // Старый MUI ThemeProvider убираем
// import { theme } from './styles/theme'; // Старый импорт темы убираем
import './styles/global.css';
import Router from './Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext'; // Наш хук useAppTheme здесь больше не нужен

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
          refetchOnWindowFocus: false
      }
  }
});

// Убираем StyledComponentsThemeProviderWrapper, так как StyledThemeProvider удален
/*
const StyledComponentsThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useAppTheme(); 
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
          <Router />
      </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 