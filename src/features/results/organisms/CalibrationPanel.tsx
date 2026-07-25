import React, { useEffect, useMemo, useState } from 'react';
void React;
import type { Goal } from '../../../models/UserInput';
import { calibrateWeightTrend, type CalibrationStatus } from '../../../lib/calibration';
import { kgToLbs, lbsToKg } from '../../../lib/units';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

interface CalibrationPanelProps {
  goal: Goal;
  currentWeightKg: number;
  unitPreference: 'metric' | 'imperial';
}

interface StoredCheckIn {
  earlierAverage: string;
  recentAverage: string;
  adherenceDays: string;
  unitPreference: 'metric' | 'imperial';
}

const STORAGE_KEY = 'nourishCalibrationCheckIn';
const createEmptyCheckIn = (
  unitPreference: StoredCheckIn['unitPreference']
): StoredCheckIn => ({
  earlierAverage: '',
  recentAverage: '',
  adherenceDays: '',
  unitPreference
});

function readStoredCheckIn(
  unitPreference: StoredCheckIn['unitPreference']
): StoredCheckIn {
  if (typeof window === 'undefined') return createEmptyCheckIn(unitPreference);

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyCheckIn(unitPreference);
    const parsed = JSON.parse(stored) as Partial<StoredCheckIn>;
    const storedUnit = parsed.unitPreference === 'imperial' ? 'imperial' : unitPreference;
    const convertValue = (value: unknown): string => {
      if (typeof value !== 'string' || value === '') return '';
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || storedUnit === unitPreference) return value;
      return (unitPreference === 'imperial'
        ? kgToLbs(numericValue)
        : lbsToKg(numericValue)
      ).toFixed(1);
    };

    return {
      earlierAverage: convertValue(parsed.earlierAverage),
      recentAverage: convertValue(parsed.recentAverage),
      adherenceDays: typeof parsed.adherenceDays === 'string' ? parsed.adherenceDays : '',
      unitPreference
    };
  } catch {
    return createEmptyCheckIn(unitPreference);
  }
}

const statusStyles: Record<CalibrationStatus, string> = {
  'low-adherence': 'border-warning/30 bg-warning-soft text-warning-foreground',
  'on-track': 'border-success/30 bg-success-soft text-success-foreground',
  'slower-than-band': 'border-warning/30 bg-warning-soft text-warning-foreground',
  'faster-than-band': 'border-warning/30 bg-warning-soft text-warning-foreground',
  'opposite-direction': 'border-warning/30 bg-warning-soft text-warning-foreground'
};

export function CalibrationPanel({
  goal,
  currentWeightKg,
  unitPreference
}: CalibrationPanelProps) {
  const [values, setValues] = useState<StoredCheckIn>(
    () => readStoredCheckIn(unitPreference)
  );
  const unit = unitPreference === 'imperial' ? 'lb' : 'kg';
  const currentWeight = unitPreference === 'imperial'
    ? kgToLbs(currentWeightKg)
    : currentWeightKg;

  useEffect(() => {
    if (values.unitPreference !== unitPreference) {
      const convertValue = (value: string): string => {
        if (value === '') return '';
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return value;
        return (unitPreference === 'imperial'
          ? kgToLbs(numericValue)
          : lbsToKg(numericValue)
        ).toFixed(1);
      };
      setValues(current => ({
        ...current,
        earlierAverage: convertValue(current.earlierAverage),
        recentAverage: convertValue(current.recentAverage),
        unitPreference
      }));
    }
  }, [unitPreference, values.unitPreference]);

  useEffect(() => {
    const hasValue =
      values.earlierAverage !== ''
      || values.recentAverage !== ''
      || values.adherenceDays !== '';
    if (hasValue) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [values]);

  const calculation = useMemo(() => {
    const earlier = Number(values.earlierAverage);
    const recent = Number(values.recentAverage);
    const adherenceDays = Number(values.adherenceDays);
    const hasAllValues =
      values.earlierAverage !== ''
      && values.recentAverage !== ''
      && values.adherenceDays !== '';

    if (!hasAllValues || values.unitPreference !== unitPreference) {
      return { result: null, error: null };
    }

    const earlierKg = unitPreference === 'imperial' ? lbsToKg(earlier) : earlier;
    const recentKg = unitPreference === 'imperial' ? lbsToKg(recent) : recent;

    try {
      return {
        result: calibrateWeightTrend({
          goal,
          earlierAverageKg: earlierKg,
          recentAverageKg: recentKg,
          adherenceDays
        }),
        error: null
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Check the values and try again.'
      };
    }
  }, [goal, unitPreference, values]);

  const updateValue = (
    field: 'earlierAverage' | 'recentAverage' | 'adherenceDays',
    value: string
  ) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  const clearCheckIn = () => {
    setValues(createEmptyCheckIn(unitPreference));
  };

  const displayedChange = calculation.result
    ? unitPreference === 'imperial'
      ? kgToLbs(calculation.result.weeklyChangeKg)
      : calculation.result.weeklyChangeKg
    : 0;
  const signedChange = `${displayedChange > 0 ? '+' : ''}${displayedChange.toFixed(1)}`;
  const signedPercent = calculation.result
    ? `${calculation.result.weeklyChangePct > 0 ? '+' : ''}${calculation.result.weeklyChangePct.toFixed(2)}%`
    : '';

  return (
    <Card className="border-primary/20 bg-surface shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-xl font-semibold text-foreground">
              <Icon name="trend-up" className="mr-2 text-primary" />
              Calibrate with your trend
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              After two weeks, compare consecutive 7-day average weights. Averages reduce the noise from hydration, sodium, digestion, and individual weigh-ins.
            </p>
          </div>
          {(values.earlierAverage !== ''
            || values.recentAverage !== ''
            || values.adherenceDays !== '') && (
            <Button variant="ghost" size="sm" onClick={clearCheckIn}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="earlier-average">Earlier 7-day average</Label>
            <div className="relative">
              <Input
                id="earlier-average"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={values.earlierAverage}
                onChange={event => updateValue('earlierAverage', event.target.value)}
                placeholder={currentWeight.toFixed(1)}
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
                {unit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recent-average">Recent 7-day average</Label>
            <div className="relative">
              <Input
                id="recent-average"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={values.recentAverage}
                onChange={event => updateValue('recentAverage', event.target.value)}
                placeholder={currentWeight.toFixed(1)}
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
                {unit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adherence-days">Days close to plan</Label>
            <div className="relative">
              <Input
                id="adherence-days"
                type="number"
                inputMode="numeric"
                min="0"
                max="14"
                step="1"
                value={values.adherenceDays}
                onChange={event => updateValue('adherenceDays', event.target.value)}
                placeholder="11"
                className="pr-20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
                of 14
              </span>
            </div>
          </div>
        </div>

        {calculation.error && (
          <p role="alert" className="text-sm text-error">{calculation.error}</p>
        )}

        {calculation.result && (
          <div
            className={`rounded-2xl border p-5 ${statusStyles[calculation.result.status]}`}
            aria-live="polite"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider">Calibration result</p>
                <h3 className="mt-1 text-xl font-semibold">{calculation.result.headline}</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <span className="rounded-full bg-surface/70 px-3 py-1">
                  {signedChange} {unit}/week
                </span>
                <span className="rounded-full bg-surface/70 px-3 py-1">
                  {signedPercent}/week
                </span>
                <span className="rounded-full bg-surface/70 px-3 py-1">
                  {calculation.result.adherencePct}% near plan
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{calculation.result.detail}</p>
            <p className="mt-3 text-sm font-medium">{calculation.result.nextStep}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface-subtle p-4 text-xs leading-relaxed text-muted">
          <strong className="text-foreground">Method note:</strong> This fitness-planning check uses a two-week adherence gate, flags loss faster than 1% per week, and uses a conservative 0.1–0.5% weekly gain band. It never changes your calorie target automatically.{' '}
          <a
            href="https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/eating-physical-activity"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            NIH tracking guidance
          </a>
          {' '}·{' '}
          <a
            href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6680710/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Sports-nutrition review
          </a>
        </div>

        <p className="text-xs text-muted">
          Check-in values stay in this browser and are not included in shared result links.
        </p>
      </CardContent>
    </Card>
  );
}
