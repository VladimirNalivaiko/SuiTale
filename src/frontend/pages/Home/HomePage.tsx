import React from 'react';
import { DefaultLayout } from "../../layouts";
import { Hero, PopularTales, HowItWorks, FeaturedAuthors } from '../../components';

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      <Hero />
      <PopularTales />
      <HowItWorks />
      <FeaturedAuthors />
    </DefaultLayout>
  );
};

export default HomePage; 