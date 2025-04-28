import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from './types/constants';
import RouteAccessChecker from './components/RouteAccessChecker';
import { StoriesPage, CreateStoryPage, ProfilePage } from './pages';
import { Header, Footer, Hero, PopularStories, HowItWorks, FeaturedAuthors } from './components';

const router = createBrowserRouter([
    {
        element: <RouteAccessChecker />,
        path: ROUTES.INITIAL_ROUTE,
        children: [
            {
                index: true,
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
            },
            {
                path: ROUTES.STORIES,
                element: (
                    <>
                        <Header />
                        <StoriesPage />
                        <Footer />
                    </>
                ),
            },
            {
                path: ROUTES.CREATE_STORY,
                element: (
                    <>
                        <Header />
                        <CreateStoryPage />
                        <Footer />
                    </>
                ),
            },
            {
                path: ROUTES.PROFILE,
                element: (
                    <>
                        <Header />
                        <ProfilePage />
                        <Footer />
                    </>
                ),
            },
        ],
    },
]);

export default router; 