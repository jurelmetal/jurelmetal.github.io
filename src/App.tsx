import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from './Layout';
import { Main } from './pages/Main';
import { Minesweeper } from './pages/Minesweeper';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'juanetoh',
        element: <Main />,
      },
      {
        path: 'minesweeper',
        element: <Minesweeper />,
      }
    ]
  },
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App
