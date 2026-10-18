import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth.jsx';
import AppShell from './AppShell.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import FindPage from '../pages/FindPage.jsx';
import TeamsPage from '../pages/TeamsPage.jsx';
import MePage from '../pages/MePage.jsx';
import CommunityPage from '../pages/CommunityPage.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="find" replace /> },
          { path: 'find', element: <FindPage /> },
          { path: 'teams', element: <TeamsPage /> },
          { path: 'community', element: <CommunityPage /> },
          { path: 'me', element: <MePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);