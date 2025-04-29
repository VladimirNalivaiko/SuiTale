import React from 'react';
import { DefaultLayout } from '../../layouts/DefaultLayout';
import { Hero } from '../../components/Hero';
import { PopularStories } from '../../components/PopularStories';
import { HowItWorks } from '../../components/HowItWorks';
import { FeaturedAuthors } from '../../components/FeaturedAuthors';

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      <Hero />
      <PopularStories />
      <HowItWorks />
      <FeaturedAuthors />
    </DefaultLayout>
  );
};

export default HomePage; 