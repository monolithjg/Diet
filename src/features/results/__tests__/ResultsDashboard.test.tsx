import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsDashboard } from '../organisms/ResultsDashboard';
import { MemoryRouter } from 'react-router-dom';
import type { DerivedMetrics } from '../../../models/DerivedMetrics';
import type { MacroPlan } from '../../../models/MacroPlan';
import type { GuidanceMessage } from '../../../lib/macros';
import { serializeResults } from '../../../lib/sharing';

// Mock the sharing module
vi.mock('../../../lib/sharing', () => ({
  serializeResults: vi.fn().mockReturnValue('mock-serialized-data')
}));

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

// Mock window.print
window.print = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
    href: 'https://example.com/results'
  },
  writable: true
});

describe('ResultsDashboard', () => {
  const mockDerivedMetrics: DerivedMetrics = {
    rmr: 1500,
    formulaUsed: 'mifflin',
    palFactor: 1.55,
    tef: 250,
    tdee: 2200
  };

  const mockMacroPlan: MacroPlan = {
    targetCalories: 2000,
    proteinG: 150,
    carbsG: 200,
    fatG: 89,
    proteinPct: 30,
    carbPct: 40,
    fatPct: 30
  };

  const mockGuidance: GuidanceMessage[] = [
    {
      key: 'protein_optimal',
      type: 'info',
      category: 'validation'
    },
    {
      key: 'guidance.hydration.base',
      type: 'info',
      category: 'hydration',
      replacements: { target: '2.5L' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(serializeResults).mockReturnValue('mock-serialized-data');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the dashboard with all key sections', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    // Check main title
    expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    
    // Check key metrics cards
    expect(screen.getByText('Resting Metabolic Rate')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('Total Daily Expenditure')).toBeInTheDocument();
    expect(screen.getByText('2,200')).toBeInTheDocument();
    expect(screen.getByText('Target Calories')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();

    // Check visualization section
    expect(screen.getByText('Macronutrient Distribution')).toBeInTheDocument();
    expect(screen.getByText('Daily Targets')).toBeInTheDocument();

    // Check guidance and action plan sections
    expect(screen.getByText('Personalized Guidance')).toBeInTheDocument();
    expect(screen.getByText('Your Action Plan')).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByText('Back to Calculator')).toBeInTheDocument();
    expect(screen.getByText('Print Plan')).toBeInTheDocument();
    expect(screen.getByText('Share Results')).toBeInTheDocument();

    // Check disclaimer
    expect(screen.getByText(/This nutrition plan is for educational purposes only/)).toBeInTheDocument();
  });

  it('displays correct formula name for each RMR formula', () => {
    const formulas = [
      { used: 'mifflin', expected: 'Mifflin-St Jeor' },
      { used: 'katch', expected: 'Katch-McArdle' },
      { used: 'cunningham', expected: 'Cunningham' },
      { used: 'manual', expected: 'Manual Entry' }
    ];

         formulas.forEach(({ used, expected }) => {
       const metrics = { ...mockDerivedMetrics, formulaUsed: used as 'mifflin' | 'katch' | 'cunningham' | 'manual' };
       const { rerender } = render(
        <MemoryRouter>
          <ResultsDashboard
            derivedMetrics={metrics}
            macroPlan={mockMacroPlan}
            guidance={mockGuidance}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(`Formula: ${expected}`)).toBeInTheDocument();
      
      if (used !== formulas[formulas.length - 1].used) {
        rerender(<div />); // Clear the render
      }
    });
  });

  it('handles shared results display correctly', () => {
    const sharedTimestamp = '1640995200000'; // Jan 1, 2022
    
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={[]}
          isSharedResult={true}
          sharedTimestamp={sharedTimestamp}
        />
      </MemoryRouter>
    );

    // Should show generation date for shared results
    expect(screen.getByText(/Generated:/)).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2022/)).toBeInTheDocument();
  });

  it('handles back to calculator navigation', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    const backButton = screen.getByText('Back to Calculator');
    
    // Mock window.location.href setter
    const mockLocationSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '', origin: 'https://example.com' },
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(window.location, 'href', {
      set: mockLocationSetter,
      configurable: true
    });

    fireEvent.click(backButton);
    
    expect(mockLocationSetter).toHaveBeenCalledWith('/');
  });

  it('handles print functionality', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    const printButton = screen.getByText('Print Plan');
    fireEvent.click(printButton);
    
    expect(window.print).toHaveBeenCalled();
  });

  it('handles share functionality with URL generation', async () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    const shareButton = screen.getByText('Share Results');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/results?d=mock-serialized-data'
      );
    });

    // Check that button feedback is shown
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Check that button text returns to original after timeout
    await waitFor(() => {
      expect(screen.getByText('Share Results')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles share functionality error gracefully', async () => {
    // Mock clipboard to throw an error
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock alert
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    const shareButton = screen.getByText('Share Results');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to copy link to clipboard');
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays activity factor with correct precision', () => {
    const metricsWithPrecision = {
      ...mockDerivedMetrics,
      palFactor: 1.375
    };

    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={metricsWithPrecision}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Activity factor: 1.38x')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
          className="custom-dashboard"
        />
      </MemoryRouter>
    );

    expect(container.firstChild).toHaveClass('custom-dashboard');
  });

  it('passes correct props to MacroVisualizer component', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    // Verify that macro data is displayed (MacroVisualizer renders this)
    expect(screen.getByText('150')).toBeInTheDocument(); // proteinG
    expect(screen.getByText('200')).toBeInTheDocument(); // carbsG  
    expect(screen.getByText('89')).toBeInTheDocument(); // fatG
  });

  it('passes correct props to ActionPlan component', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    // Verify guidance is passed to ActionPlan (it should show the action plan section)
    expect(screen.getByText('Your Action Plan')).toBeInTheDocument();
  });

  it('displays guidance in GuidanceList component', () => {
    render(
      <MemoryRouter>
        <ResultsDashboard
          derivedMetrics={mockDerivedMetrics}
          macroPlan={mockMacroPlan}
          guidance={mockGuidance}
        />
      </MemoryRouter>
    );

    // Verify guidance section exists
    expect(screen.getByText('Evidence-based recommendations tailored to your profile')).toBeInTheDocument();
  });
}); 
