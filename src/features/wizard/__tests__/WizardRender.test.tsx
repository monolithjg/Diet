import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Wizard from '../index';
import Results from '../../results';

describe('Wizard component', () => {
  it('advances through steps and navigates to results', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Wizard />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </MemoryRouter>
    );

    // Step 1 should render by default
    expect(screen.getAllByText('Personal Information').length).toBeGreaterThan(0);

    // Continue through the steps
    const continueButton = () => screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton());

    await waitFor(() => {
      expect(screen.getAllByText('Body Composition (Optional)').length).toBeGreaterThan(0);
    });

    fireEvent.click(continueButton());
    await waitFor(() => {
      expect(screen.getAllByText('Activity & Goals').length).toBeGreaterThan(0);
    });

    fireEvent.click(continueButton());
    await waitFor(() => {
      expect(screen.getAllByText('Diet & Lifestyle Preferences').length).toBeGreaterThan(0);
    });

    // Final click should navigate to results
    fireEvent.click(screen.getByRole('button', { name: /see results/i }));

    await waitFor(() => {
      expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    });
  });
});
