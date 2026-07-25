import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Results from '../index';
import { useStore } from '../../../lib/store';
import * as sharing from '../../../lib/sharing';
import { MemoryRouter } from 'react-router-dom';
import type { StoreState } from '../../../lib/store';

// Mock the store
vi.mock('../../../lib/store', () => ({
  useStore: vi.fn()
}));

// Mock the sharing module
vi.mock('../../../lib/sharing', () => ({
  deserializeResults: vi.fn(),
  serializeResults: vi.fn()
}));

// Mock window.location
const mockLocation = {
  origin: 'https://example.com',
  href: 'https://example.com/results',
  search: ''
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true
});

describe('Results', () => {
  const mockStoreState = {
    calc: {
      derivedMetrics: {
        rmr: 1500,
        formulaUsed: 'mifflin',
        palFactor: 1.55,
        tef: 250,
        tdee: 2200
      },
      macroPlan: {
        targetCalories: 2000,
        proteinG: 150,
        carbsG: 200,
        fatG: 89,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      }
    },
    ui: {
      guidance: [
        {
          key: 'protein_optimal',
          type: 'info',
          category: 'validation'
        }
      ]
    }
  };

  const mockRefreshGuidance = vi.fn();
  const mockUser = {
    goal: 'maintain',
    weightKg: 80,
    unitPreference: 'metric'
  };

  const mockUseStore = (state: typeof mockStoreState | {
    calc: typeof mockStoreState.calc;
    ui: { guidance: typeof mockStoreState.ui.guidance };
  }) => {
    vi.mocked(useStore).mockImplementation((selector) => {
      return selector({
        ...state,
        user: mockUser,
        refreshGuidance: mockRefreshGuidance
      } as unknown as StoreState);
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockUseStore(mockStoreState);
    vi.mocked(sharing.deserializeResults).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders results dashboard when valid data is available', () => {
    render(<MemoryRouter><Results /></MemoryRouter>);

    expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument(); // RMR
    expect(screen.getByText('2,200')).toBeInTheDocument(); // TDEE
    expect(screen.getByText('2,000')).toBeInTheDocument(); // Target calories
  });

  it('renders no results state when no valid data is available', () => {
    const emptyState = {
      calc: {
        derivedMetrics: {
          rmr: 0,
          formulaUsed: 'mifflin',
          palFactor: 1.2,
          tef: 0,
          tdee: 0
        },
        macroPlan: {
          targetCalories: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
          proteinPct: 0,
          carbPct: 0,
          fatPct: 0
        }
      },
      ui: { guidance: [] }
    };

    mockUseStore(emptyState);

    render(<MemoryRouter><Results /></MemoryRouter>);

    expect(screen.getByText('No Results Available')).toBeInTheDocument();
    expect(screen.getByText('Complete the nutrition calculator to see your personalized results and recommendations.')).toBeInTheDocument();
    expect(screen.getByText('Start Calculator')).toBeInTheDocument();
  });

  it('handles start calculator button click', () => {
    const emptyState = {
      calc: {
        derivedMetrics: {
          rmr: 0,
          formulaUsed: 'mifflin',
          palFactor: 1.2,
          tef: 0,
          tdee: 0
        },
        macroPlan: {
          targetCalories: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
          proteinPct: 0,
          carbPct: 0,
          fatPct: 0
        }
      },
      ui: { guidance: [] }
    };

    mockUseStore(emptyState);

    // Mock window.location.href setter
    const mockLocationSetter = vi.fn();
    Object.defineProperty(window.location, 'href', {
      set: mockLocationSetter,
      configurable: true
    });

    render(<MemoryRouter><Results /></MemoryRouter>);

    const startButton = screen.getByText('Start Calculator');
    fireEvent.click(startButton);

    expect(mockLocationSetter).toHaveBeenCalledWith('/');
  });

  it('handles shared results from URL parameter', () => {
    const sharedResults = {
      derivedMetrics: {
        rmr: 1600,
        formulaUsed: 'katch' as const,
        palFactor: 1.725,
        tef: 300,
        tdee: 2400
      },
      macroPlan: {
        targetCalories: 2200,
        proteinG: 165,
        carbsG: 220,
        fatG: 98,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      },
      timestamp: Date.now()
    };

    // Mock URL with sharing parameter
    mockLocation.search = '?d=encoded-shared-data';
    vi.mocked(sharing.deserializeResults).mockReturnValue(sharedResults);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should display shared results instead of store data
    expect(screen.getByText('1,600')).toBeInTheDocument(); // Shared RMR instead of 1500
    expect(screen.getByText('2,400')).toBeInTheDocument(); // Shared TDEE instead of 2200
    expect(screen.getByText('2,200')).toBeInTheDocument(); // Shared target instead of 2000

    // Should show shared result indicator
    expect(screen.getByText(/Generated:/)).toBeInTheDocument();
  });

  it('falls back to store data when shared results deserialization fails', () => {
    mockLocation.search = '?d=invalid-data';
    vi.mocked(sharing.deserializeResults).mockReturnValue(null);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should display store data since deserialization failed
    expect(screen.getByText('1,500')).toBeInTheDocument(); // Store RMR
    expect(screen.getByText('2,200')).toBeInTheDocument(); // Store TDEE
    expect(screen.getByText('2,000')).toBeInTheDocument(); // Store target calories
  });

  it('calls deserializeResults with correct parameter', () => {
    mockLocation.search = '?d=test-encoded-data&other=param';
    
    render(<MemoryRouter><Results /></MemoryRouter>);

    expect(sharing.deserializeResults).toHaveBeenCalledWith('test-encoded-data');
  });

  it('handles legacy shared results without embedded guidance', () => {
    const sharedResults = {
      derivedMetrics: {
        rmr: 1600,
        formulaUsed: 'katch' as const,
        palFactor: 1.725,
        tef: 300,
        tdee: 2400
      },
      macroPlan: {
        targetCalories: 2200,
        proteinG: 165,
        carbsG: 220,
        fatG: 98,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      },
      timestamp: Date.now()
    };

    mockLocation.search = '?d=encoded-shared-data';
    vi.mocked(sharing.deserializeResults).mockReturnValue(sharedResults);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // For shared results, guidance should be empty
    // We can check this by verifying the ActionPlan shows the empty state
    expect(screen.getByText('No action items available')).toBeInTheDocument();
  });

  it('shows store guidance for non-shared results', () => {
    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should show the guidance from the store
    // The exact text depends on the GuidanceList component implementation
    expect(screen.getByText('Personalized Guidance')).toBeInTheDocument();
  });

  it('passes correct props to ResultsDashboard for store data', () => {
    render(<MemoryRouter><Results /></MemoryRouter>);

    // Verify that components are rendered with store data
    expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    expect(screen.getByText('Resting Metabolic Rate')).toBeInTheDocument();
    expect(screen.getByText('Total Daily Expenditure')).toBeInTheDocument();
    expect(screen.getByText('Target Calories')).toBeInTheDocument();
  });

  it('passes correct props to ResultsDashboard for shared data', () => {
    const sharedResults = {
      derivedMetrics: {
        rmr: 1600,
        formulaUsed: 'katch' as const,
        palFactor: 1.725,
        tef: 300,
        tdee: 2400
      },
      macroPlan: {
        targetCalories: 2200,
        proteinG: 165,
        carbsG: 220,
        fatG: 98,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      },
      timestamp: 1640995200000 // Jan 1, 2022
    };

    mockLocation.search = '?d=encoded-shared-data';
    vi.mocked(sharing.deserializeResults).mockReturnValue(sharedResults);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should pass isSharedResult=true and sharedTimestamp
    expect(screen.getByText(/Generated:/)).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2022/)).toBeInTheDocument();
  });

  it('handles missing RMR but positive target calories', () => {
    const partialState = {
      calc: {
        derivedMetrics: {
          rmr: 0, // Missing RMR
          formulaUsed: 'mifflin',
          palFactor: 1.55,
          tef: 250,
          tdee: 2200
        },
        macroPlan: {
          targetCalories: 2000, // But has target calories
          proteinG: 150,
          carbsG: 200,
          fatG: 89,
          proteinPct: 30,
          carbPct: 40,
          fatPct: 30
        }
      },
      ui: { guidance: [] }
    };

    mockUseStore(partialState);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should show no results state because RMR is 0 even though target calories exist
    expect(screen.getByText('No Results Available')).toBeInTheDocument();
  });

  it('handles positive RMR but missing target calories', () => {
    const partialState = {
      calc: {
        derivedMetrics: {
          rmr: 1500, // Has RMR
          formulaUsed: 'mifflin',
          palFactor: 1.55,
          tef: 250,
          tdee: 2200
        },
        macroPlan: {
          targetCalories: 0, // But missing target calories
          proteinG: 150,
          carbsG: 200,
          fatG: 89,
          proteinPct: 30,
          carbPct: 40,
          fatPct: 30
        }
      },
      ui: { guidance: [] }
    };

    mockUseStore(partialState);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should show no results state because target calories is 0 even though RMR exists
    expect(screen.getByText('No Results Available')).toBeInTheDocument();
  });

  it('renders results when shared results are available even with empty store', () => {
    const emptyState = {
      calc: {
        derivedMetrics: {
          rmr: 0,
          formulaUsed: 'mifflin',
          palFactor: 1.2,
          tef: 0,
          tdee: 0
        },
        macroPlan: {
          targetCalories: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
          proteinPct: 0,
          carbPct: 0,
          fatPct: 0
        }
      },
      ui: { guidance: [] }
    };

    const sharedResults = {
      derivedMetrics: {
        rmr: 1600,
        formulaUsed: 'katch' as const,
        palFactor: 1.725,
        tef: 300,
        tdee: 2400
      },
      macroPlan: {
        targetCalories: 2200,
        proteinG: 165,
        carbsG: 220,
        fatG: 98,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      },
      timestamp: Date.now()
    };

    mockUseStore(emptyState);
    mockLocation.search = '?d=encoded-shared-data';
    vi.mocked(sharing.deserializeResults).mockReturnValue(sharedResults);

    render(<MemoryRouter><Results /></MemoryRouter>);

    // Should show results dashboard even though store is empty
    expect(screen.getByText('Your Personalized Nutrition Plan')).toBeInTheDocument();
    expect(screen.getByText('1,600')).toBeInTheDocument(); // Shared RMR
  });
}); 
