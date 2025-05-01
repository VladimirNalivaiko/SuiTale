import React from 'react';
import { Box } from '@mui/material';
import { Header, Footer } from '../components';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default DefaultLayout;