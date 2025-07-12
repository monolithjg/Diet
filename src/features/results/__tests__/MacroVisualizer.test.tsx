import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MacroVisualizer } from '../organisms/MacroVisualizer';
import type { MacroPlan } from '../../../models/MacroPlan';

describe('MacroVisualizer', () => {
  const mockMacroPlan: MacroPlan = {
    targetCalories: 2000,
    proteinG: 150,
    carbsG: 200,
    fatG: 89,
    proteinPct: 30,
    carbPct: 40,
    fatPct: 30
  };

  it('renders macronutrient distribution chart', () => {
    render(<MacroVisualizer macroPlan={mockMacroPlan} />);

    // Check main sections
    expect(screen.getByText('Macronutrient Distribution')).toBeInTheDocument();
    expect(screen.getByText('Daily Targets')).toBeInTheDocument();

    // Check total calories display
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('Total Daily Calories')).toBeInTheDocument();
  });

  it('displays correct macro values and percentages', () => {
    render(<MacroVisualizer macroPlan={mockMacroPlan} />);

    // Check protein values
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getAllByText('30%')).toHaveLength(2); // Appears twice (protein and fat)

    // Check carb values  
    expect(screen.getByText('200g')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();

    // Check fat values
    expect(screen.getByText('89g')).toBeInTheDocument();
    // 30% already checked above
  });

  it('displays macro labels correctly', () => {
    render(<MacroVisualizer macroPlan={mockMacroPlan} />);

    // Check all macro labels are present (some appear multiple times)
    expect(screen.getAllByText('Protein')).toHaveLength(2); // Summary and detail views
    expect(screen.getByText('Carbs')).toBeInTheDocument(); 
    expect(screen.getAllByText('Fat')).toHaveLength(2); // Summary and detail views
    expect(screen.getByText('Carbohydrates')).toBeInTheDocument(); // In MacroRing (detailed view)
  });

  it('calculates and displays calorie breakdown correctly', () => {
    render(<MacroVisualizer macroPlan={mockMacroPlan} />);

    // Check calorie breakdown section
    expect(screen.getByText('Calorie Breakdown')).toBeInTheDocument();

    // Protein: 150g × 4 kcal/g = 600 kcal
    expect(screen.getByText('600')).toBeInTheDocument();
    expect(screen.getByText('kcal from protein')).toBeInTheDocument();

    // Carbs: 200g × 4 kcal/g = 800 kcal  
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('kcal from carbs')).toBeInTheDocument();

    // Fat: 89g × 9 kcal/g = 801 kcal
    expect(screen.getByText('801')).toBeInTheDocument();
    expect(screen.getByText('kcal from fat')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <MacroVisualizer macroPlan={mockMacroPlan} className="custom-visualizer" />
    );

    expect(container.firstChild).toHaveClass('custom-visualizer');
  });

  it('handles zero values gracefully', () => {
    const zeroMacroPlan: MacroPlan = {
      targetCalories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      proteinPct: 0,
      carbPct: 0,
      fatPct: 0
    };

    render(<MacroVisualizer macroPlan={zeroMacroPlan} />);

    // Should still render the structure
    expect(screen.getByText('Macronutrient Distribution')).toBeInTheDocument();
    expect(screen.getByText('Daily Targets')).toBeInTheDocument();
    expect(screen.getByText('Total Daily Calories')).toBeInTheDocument();
  });

  it('rounds macro values correctly', () => {
    const precisionMacroPlan: MacroPlan = {
      targetCalories: 2000,
      proteinG: 150.7,
      carbsG: 200.3,
      fatG: 88.9,
      proteinPct: 30.14,
      carbPct: 40.12,
      fatPct: 29.96
    };

    render(<MacroVisualizer macroPlan={precisionMacroPlan} />);

    // Check that grams are rounded to whole numbers in the display
    expect(screen.getByText('151g')).toBeInTheDocument(); // 150.7 rounded
    expect(screen.getByText('200g')).toBeInTheDocument(); // 200.3 rounded
    expect(screen.getByText('89g')).toBeInTheDocument(); // 88.9 rounded
  });

  it('calculates calories correctly with decimal values', () => {
    const precisionMacroPlan: MacroPlan = {
      targetCalories: 2000,
      proteinG: 150.5,
      carbsG: 200.5,
      fatG: 88.5,
      proteinPct: 30,
      carbPct: 40,
      fatPct: 30
    };

    render(<MacroVisualizer macroPlan={precisionMacroPlan} />);

    // Protein: 150.5g × 4 = 602 kcal (rounded)
    expect(screen.getByText('602')).toBeInTheDocument();
    
    // Carbs: 200.5g × 4 = 802 kcal (rounded)
    expect(screen.getByText('802')).toBeInTheDocument();
    
    // Fat: 88.5g × 9 = 797 kcal (rounded)
    expect(screen.getByText('797')).toBeInTheDocument();
  });

  it('displays percentage values as provided', () => {
    const customPercentages: MacroPlan = {
      targetCalories: 2000,
      proteinG: 150,
      carbsG: 200,
      fatG: 89,
      proteinPct: 25,
      carbPct: 45,
      fatPct: 30
    };

    render(<MacroVisualizer macroPlan={customPercentages} />);

    // Check that percentages are displayed as provided
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
}); 