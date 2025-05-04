import React from 'react';
import { DefaultLayout } from "../../layouts";
import { 
  Hero, 
  TrustedBy, 
  Features, 
  Testimonials, 
  Sponsors 
} from '../../components';

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      <Hero />
      <TrustedBy />
      <Features />
      <Testimonials />
      <Sponsors />
    </DefaultLayout>
  );
};

export default HomePage; 