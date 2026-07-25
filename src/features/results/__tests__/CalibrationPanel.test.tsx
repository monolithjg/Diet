import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CalibrationPanel } from '../organisms/CalibrationPanel';

describe('CalibrationPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates a goal-aware result from two weekly averages', () => {
    render(
      <CalibrationPanel
        goal="loss"
        currentWeightKg={80}
        unitPreference="metric"
      />
    );

    fireEvent.change(screen.getByLabelText('Earlier 7-day average'), {
      target: { value: '80' }
    });
    fireEvent.change(screen.getByLabelText('Recent 7-day average'), {
      target: { value: '79.6' }
    });
    fireEvent.change(screen.getByLabelText('Days close to plan'), {
      target: { value: '13' }
    });

    expect(screen.getByText('The trend supports the current target')).toBeInTheDocument();
    expect(screen.getByText('-0.50%/week')).toBeInTheDocument();
    expect(screen.getByText('93% near plan')).toBeInTheDocument();
  });

  it('does not diagnose the target when adherence is low', () => {
    render(
      <CalibrationPanel
        goal="gain"
        currentWeightKg={80}
        unitPreference="metric"
      />
    );

    fireEvent.change(screen.getByLabelText('Earlier 7-day average'), {
      target: { value: '80' }
    });
    fireEvent.change(screen.getByLabelText('Recent 7-day average'), {
      target: { value: '80.3' }
    });
    fireEvent.change(screen.getByLabelText('Days close to plan'), {
      target: { value: '8' }
    });

    expect(screen.getByText('Hold the target for now')).toBeInTheDocument();
  });

  it('persists values locally and clears them on request', () => {
    render(
      <CalibrationPanel
        goal="maintain"
        currentWeightKg={80}
        unitPreference="imperial"
      />
    );

    const earlier = screen.getByLabelText('Earlier 7-day average');
    fireEvent.change(earlier, { target: { value: '176.4' } });

    expect(localStorage.getItem('nourishCalibrationCheckIn')).toContain('176.4');
    expect(localStorage.getItem('nourishCalibrationCheckIn')).toContain('imperial');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(earlier).toHaveValue(null);
    expect(localStorage.getItem('nourishCalibrationCheckIn')).toBeNull();
  });

  it('converts persisted values when the unit preference changes', () => {
    localStorage.setItem('nourishCalibrationCheckIn', JSON.stringify({
      earlierAverage: '176.4',
      recentAverage: '176.9',
      adherenceDays: '13',
      unitPreference: 'imperial'
    }));

    render(
      <CalibrationPanel
        goal="gain"
        currentWeightKg={80}
        unitPreference="metric"
      />
    );

    expect(screen.getByLabelText('Earlier 7-day average')).toHaveValue(80);
    expect(screen.getByLabelText('Recent 7-day average')).toHaveValue(80.2);
    expect(screen.getByText('The trend supports the current target')).toBeInTheDocument();
  });
});
