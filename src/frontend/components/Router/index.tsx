import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MyProfilePage from '../MyProfile';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<MyProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 