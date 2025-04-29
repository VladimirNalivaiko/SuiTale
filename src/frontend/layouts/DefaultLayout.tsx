import React, { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface DefaultLayoutProps {
  children: ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}; 