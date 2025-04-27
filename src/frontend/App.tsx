import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { Button } from './components/Button';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <div className="App">
          <Button onClick={() => console.log('Clicked!')}>
            Click me
          </Button>
        </div>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
