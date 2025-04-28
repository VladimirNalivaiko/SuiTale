import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PopularStories } from './components/PopularStories';
import { HowItWorks } from './components/HowItWorks';
import { FeaturedAuthors } from './components/FeaturedAuthors';
import { Footer } from './components/Footer';
import { StoriesPage, CreateStoryPage, ProfilePage } from './pages';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <PopularStories />
                <HowItWorks />
                <FeaturedAuthors />
              </>
            } />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/create-story" element={<CreateStoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <Footer />
        </Router>
      </StyledThemeProvider>
    </ThemeProvider>
  );
};

export default App;
