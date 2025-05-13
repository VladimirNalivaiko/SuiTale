import React, { createContext, useState, useMemo, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getAppTheme } from '../styles/theme'; // Путь к вашей функции getAppTheme

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Получаем сохраненный режим из localStorage или используем 'light' по умолчанию
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    return storedMode || 'light';
  });

  useEffect(() => {
    // Сохраняем режим в localStorage при его изменении
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    theme,
  }), [mode, toggleTheme, theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Нормализует стили и применяет фон темы к body */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}; 