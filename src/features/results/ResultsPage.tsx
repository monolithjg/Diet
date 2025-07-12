import React from 'react';
import { useStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';

const ResultsPage: React.FC = () => {
  const { calc, ui } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-4">Your Results</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <p><strong>RMR:</strong> {calc.derivedMetrics.rmr} kcal</p>
        <p><strong>TDEE:</strong> {calc.derivedMetrics.tdee} kcal</p>
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold">Macronutrient Breakdown</h2>
        <p><strong>Protein:</strong> {calc.macroPlan.proteinG} g</p>
        <p><strong>Carbs:</strong> {calc.macroPlan.carbsG} g</p>
        <p><strong>Fat:</strong> {calc.macroPlan.fatG} g</p>
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold">Guidance</h2>
        <ul>
          {ui.guidance.map((msg, index) => (
            <li key={index} className="mb-2">
              <span className={`font-bold text-${msg.type === 'critical' ? 'red-600' : msg.type === 'warn' ? 'yellow-600' : 'blue-600'}`}>{msg.type.toUpperCase()}:</span> {msg.key}
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={() => navigate('/')}
        className="w-full bg-blue-500 text-white p-3 rounded shadow"
      >
        Modify Inputs
      </button>
    </div>
  );
};

export default ResultsPage; 