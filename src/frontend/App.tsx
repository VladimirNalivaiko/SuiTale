import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PopularStories } from './components/PopularStories';
import { HowItWorks } from './components/HowItWorks';
import { FeaturedAuthors } from './components/FeaturedAuthors';
import { Footer } from './components/Footer';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <Header />
        <Hero />
        <PopularStories />
        <HowItWorks />
        <FeaturedAuthors />
        <Footer />
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
