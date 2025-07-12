import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Wizard from './features/wizard';
import ResultsPage from './features/results/ResultsPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Wizard />} />
      <Route path="/results" element={<ResultsPage />} />
      {/* Add other routes here if needed */}
    </Routes>
  );
};

export default App;
