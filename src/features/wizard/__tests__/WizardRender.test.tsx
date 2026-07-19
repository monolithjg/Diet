import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Wizard from '../index';
import Results from '../../results';
import { useStore } from '../../../lib/store';

describe('Wizard component', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.getState().resetState();
  });

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
      expect(screen.getByRole('heading', { name: 'Choose your eating style' })).toBeInTheDocument();
    });

    const calculateButton = screen.getByRole('button', { name: /calculate my plan/i });
    expect(calculateButton).toBeDisabled();
    fireEvent.click(await screen.findByRole('radio', { name: /balanced/i }));

    // Final click should navigate to results
    expect(calculateButton).toBeEnabled();
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    });
  });

  it('presents the final step as an accessible required radio-card group', async () => {
    useStore.getState().updateUi({ step: 4 });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Wizard />
      </MemoryRouter>
    );

    expect(await screen.findByText('Step 4 of 4')).toBeInTheDocument();
    expect(screen.queryByText(/100% complete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/diet preferences complete/i)).not.toBeInTheDocument();
    expect(screen.getByText("We'll use this to shape your macro targets and meal suggestions.")).toBeInTheDocument();

    const dietRadios = await screen.findAllByRole('radio');
    expect(dietRadios).toHaveLength(6);
    dietRadios.forEach(radio => expect(radio).not.toBeChecked());

    const calculateButton = screen.getByRole('button', { name: /calculate my plan/i });
    expect(calculateButton).toBeDisabled();
    expect(screen.getByText('Choose an eating style to calculate your plan.')).toBeInTheDocument();

    const highProtein = screen.getByRole('radio', { name: /high protein/i });
    fireEvent.click(highProtein);

    expect(highProtein).toBeChecked();
    expect(calculateButton).toBeEnabled();
    expect(screen.getByText('Eating style selected. Ready to calculate.')).toBeInTheDocument();
    expect(screen.getByText('Recommended for your goal')).toBeInTheDocument();
  });
});
