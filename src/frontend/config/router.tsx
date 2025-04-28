import { createBrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { PopularStories } from '../components/PopularStories';
import { HowItWorks } from '../components/HowItWorks';
import { FeaturedAuthors } from '../components/FeaturedAuthors';
import { Footer } from '../components/Footer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Header />
        <Hero />
        <PopularStories />
        <HowItWorks />
        <FeaturedAuthors />
        <Footer />
      </>
    ),
  },
]); 