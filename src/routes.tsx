import { createBrowserRouter } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
void React;

// Lazy-loaded route components
const Wizard  = lazy(() => import('./features/wizard'));
const Results = lazy(() => import('./features/results'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <p>Loading…</p>
  </div>
);

// ───────────────────────── router definition ─────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Wizard />
      </Suspense>
    ),
  },
  {
    path: 'results',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Results />
      </Suspense>
    ),
  },
  { path: '*', element: <div>Page not found.</div> },
]);