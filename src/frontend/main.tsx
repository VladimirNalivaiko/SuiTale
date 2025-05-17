import React from 'react';
import ReactDOM from 'react-dom/client';
// import { ThemeProvider } from '@mui/material/styles'; // Старый MUI ThemeProvider убираем
// import { theme } from './styles/theme'; // Старый импорт темы убираем
import './styles/global.css';
import Router from './Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext'; // Наш хук useAppTheme здесь больше не нужен
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client'; // Импортируем getFullnodeUrl
import '@mysten/dapp-kit/dist/index.css'; // Стили для dapp-kit

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
          refetchOnWindowFocus: false
      }
  }
});

// Конфигурация сетей для SuiClientProvider
const networkConfig = {
  testnet: { url: getFullnodeUrl('testnet') },
  // mainnet: { url: getFullnodeUrl('mainnet') },
  // devnet: { url: getFullnodeUrl('devnet') },
};

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
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={false}> {/* autoConnect={false} - пользователь нажимает кнопку для подключения */}
          <AppThemeProvider>
              <Router />
          </AppThemeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 