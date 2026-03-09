import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/carte',
    element: <MapPage />,
  },
  {
    path: '/projets',
    element: <ProjectsListPage />,
  },
  {
    path: '/projet/:id',
    element: <ProjectDetailPage />,
  },
]);
