import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Wizard from './features/wizard';
import ResultsPage from './features/results/ResultsPage';
import { Layout } from './components/layout/Layout';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Wizard />} />
        <Route path="/results" element={<ResultsPage />} />
        {/* Add other routes here if needed */}
      </Routes>
    </Layout>
  );
};

export default App;
