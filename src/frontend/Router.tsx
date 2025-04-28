import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './types/constants';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PopularStories } from './components/PopularStories';
import { HowItWorks } from './components/HowItWorks';
import { FeaturedAuthors } from './components/FeaturedAuthors';
import { Footer } from './components/Footer';

const router = createBrowserRouter([
    {
        path: ROUTES.INITIAL_ROUTE,
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
    }
]);

function Router() {
    return <RouterProvider router={router} />;
}

export default Router; 