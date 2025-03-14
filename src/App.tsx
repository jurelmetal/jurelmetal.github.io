import React, { ReactNode } from 'react';
import { createHashRouter, RouteObject, RouterProvider } from 'react-router';
import { Layout } from './Layout';
import { Main } from './pages/Main/Main';
import { Minesweeper } from './pages/Minesweeper/Minesweeper';

export type EnhancedRouteObject = RouteObject & {
  icon: string | ReactNode;
  displayLabel: string;
}

export const childRoutes: EnhancedRouteObject[] = [
  {
    path: 'juanetoh',
    element: <Main />,
    icon: '🏠',
    displayLabel: 'Home',
  },
  {
    path: 'minesweeper',
    element: <Minesweeper />,
    icon: '💣',
    displayLabel: 'Minesweeper',
  },
];

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: childRoutes,
  },
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App
