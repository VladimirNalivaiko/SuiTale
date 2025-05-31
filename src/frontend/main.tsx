import React from 'react';
import ReactDOM from 'react-dom/client';
// import { ThemeProvider } from '@mui/material/styles'; // Remove old MUI ThemeProvider
// import { theme } from './styles/theme'; // Remove old theme import
import './styles/global.css';
import Router from './Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext'; // Our useAppTheme hook is no longer needed here
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client'; // Import getFullnodeUrl
import { SnackbarProvider } from 'notistack';
import '@mysten/dapp-kit/dist/index.css'; // Styles for dapp-kit

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
          refetchOnWindowFocus: false
      }
  }
});

// Network configuration for SuiClientProvider
const networkConfig = {
  testnet: { url: getFullnodeUrl('testnet') },
  // mainnet: { url: getFullnodeUrl('mainnet') },
  // devnet: { url: getFullnodeUrl('devnet') },
};

// Remove StyledComponentsThemeProviderWrapper since StyledThemeProvider is removed
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
        <WalletProvider autoConnect={false}> {/* autoConnect={false} - user clicks button to connect */}
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            dense
            preventDuplicate
            autoHideDuration={5000}
          >
            <AppThemeProvider>
                <Router />
            </AppThemeProvider>
          </SnackbarProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 