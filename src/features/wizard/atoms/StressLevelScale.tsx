import { Card, CardContent } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { cn } from '../../../lib/utils';
import { Icon } from '../../../components/ui/Icon';

interface StressLevelScaleProps {
  value?: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3 | undefined) => void;
  error?: boolean;
  helperText?: string;
}

const stressLevels = [
  {
    value: 1 as const,
    label: 'Low Stress',
    description: 'Generally calm and relaxed',
    color: 'text-success'
  },
  {
    value: 2 as const,
    label: 'Moderate Stress',
    description: 'Some daily pressures',
    color: 'text-yellow-600'
  },
  {
    value: 3 as const,
    label: 'High Stress',
    description: 'Frequently feeling overwhelmed',
    color: 'text-error'
  }
];

export function StressLevelScale({
  value,
  onChange,
  error,
  helperText
}: StressLevelScaleProps) {
  const getStressFeedback = (level?: 1 | 2 | 3) => {
    if (!level) return '';
    if (level >= 3) return 'High stress can impact your metabolism and recovery';
    if (level === 2) return 'Stress management techniques may support your goals';
    return 'Great! Low stress supports optimal health';
  };

  const feedback = getStressFeedback(value);
  const displayHelperText = helperText || feedback;

  return (
    <div className="space-y-4">
      <Label className={error ? "text-destructive" : ""}>
        How would you rate your current stress level?
      </Label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stressLevels.map((level) => (
          <Card
            key={level.value}
            className={cn(
              "cursor-pointer border-0 transition-all duration-200 hover:shadow-md",
              value === level.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/5",
              error && "border-destructive"
            )}
            onClick={() => onChange(value === level.value ? undefined : level.value)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <Icon name="stress" className={cn("mb-2 h-6 w-6", level.color)} />
              <div className="font-medium mb-1">{level.label}</div>
              <div className="text-xs text-muted-foreground">
                {level.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={cn(
            "text-sm text-muted-foreground hover:text-foreground transition-colors",
            !value && "hidden"
          )}
        >
          Clear selection
        </button>
      </div>

      {displayHelperText && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" :
          value === 3 ? "text-warning" :
          "text-muted-foreground"
        )}>
          {displayHelperText}
        </p>
      )}

      <div className="flex gap-2 text-xs text-muted-foreground">
        <Icon name="info" className="h-4 w-4 flex-shrink-0" /> High stress can affect sleep, appetite, recovery, and plan consistency
      </div>
    </div>
  );
}
