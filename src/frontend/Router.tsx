import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './types/constants';
import { HomePage, MyProfilePage } from './pages';

const router = createBrowserRouter([
    {
        path: ROUTES.INITIAL_ROUTE,
        element: (
            <HomePage />
        ),
    },
    {
        path: ROUTES.MY_PROFILE,
        element: (
            <MyProfilePage />
        ),
    }
]);

function Router() {
    return <RouterProvider router={router} />;
}

export default Router; 