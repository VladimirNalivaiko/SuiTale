import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './types/constants';
import { CreateStoryPage, HomePage, MyProfilePage, StoriesPage, UserProfilePage } from './pages';

const router = createBrowserRouter([
    {
        path: ROUTES.INITIAL_ROUTE,
        element: (
            <HomePage />
        ),
    },
    {
        path: ROUTES.STORIES,
        element: (
            <StoriesPage />
        ),
    },
    {
        path: ROUTES.MY_PROFILE,
        element: (
            <MyProfilePage />
        ),
    },
    {
        path: ROUTES.CREATE_STORY,
        element: (
            <CreateStoryPage />
        ),
    },
    {
        path: ROUTES.USER_PROFILE,
        element: (
            <UserProfilePage />
        ),
    }
]);

function Router() {
    return <RouterProvider router={router} />;
}

export default Router; 