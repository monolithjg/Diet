import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';

// Lazy-loaded route components
const Wizard = lazy(() => import('./features/wizard'));
const Results = lazy(() => import('./features/results'));

const loadingFallback = (
  <div className="flex items-center justify-center h-screen">
    <p>Loading…</p>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={loadingFallback}>
            <Wizard />
          </Suspense>
        ),
      },
      {
        path: 'results',
        element: (
          <Suspense fallback={loadingFallback}>
            <Results />
          </Suspense>
        ),
      },
      { path: '*', element: <div>Page not found.</div> },
    ],
  },
]);
