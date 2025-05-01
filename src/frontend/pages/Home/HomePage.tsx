import React from 'react';
import { DefaultLayout } from "../../layouts";
import { Hero, PopularStories, HowItWorks, FeaturedAuthors } from '../../components';

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