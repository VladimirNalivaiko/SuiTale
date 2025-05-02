import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './types/constants';
import { CreateStoryPage, HomePage, MyProfilePage, TalePage, UserProfilePage, TalesPage, CreateTalePage} from './pages';

const router = createBrowserRouter([
    {
        path: ROUTES.INITIAL_ROUTE,
        element: (
            <HomePage />
        ),
    },
    {
        path: ROUTES.TALES,
        element: (
            <TalesPage />
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
    },
    {
        path: ROUTES.TALE,
        element: (
            <TalePage />
        ),
    },
    {
        path: ROUTES.CREATE_TALE,
        element: (
            <CreateTalePage />
        ),
    },
]);

function Router() {
    return <RouterProvider router={router} />;
}

export default Router; 