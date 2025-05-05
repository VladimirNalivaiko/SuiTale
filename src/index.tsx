import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './frontend/providers/AppProviders';
import './index.css';
import Router from './frontend/Router';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Router />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
); 