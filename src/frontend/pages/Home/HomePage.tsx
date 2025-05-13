import React from 'react';
import { DefaultLayout } from "../../layouts";
import { 
  Hero, 
  TrustedBy, 
  Features, 
  Testimonials, 
  Sponsors 
} from '../../components';
import { Box } from '@mui/material';

const HomePage: React.FC = () => {
  const sections = [
    { Component: Hero, bgKey: 'paper' },
    { Component: TrustedBy, bgKey: 'paper' },
    { Component: Features, bgKey: 'paper' },
    { Component: Testimonials, bgKey: 'default' },
    { Component: Sponsors, bgKey: 'paper' },
  ];

  return (
    <DefaultLayout>
      {sections.map(({ Component, bgKey }, index) => (
        <Box 
          key={index} 
          sx={{
            backgroundColor: `background.${bgKey}`,
          }}
        >
          <Component />
        </Box>
      ))}
    </DefaultLayout>
  );
};

export default HomePage; 