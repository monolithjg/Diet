import { Card, CardContent } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { cn } from '../../../lib/utils';

interface WorkoutTimingSelectorProps {
  value?: 'am' | 'pm';
  onChange: (value: 'am' | 'pm' | undefined) => void;
  error?: boolean;
  helperText?: string;
}

export function WorkoutTimingSelector({ 
  value, 
  onChange, 
  error, 
  helperText 
}: WorkoutTimingSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className={error ? "text-destructive" : ""}>
        When do you typically work out?
      </Label>
      
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            value === 'am' ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/5",
            error && "border-destructive"
          )}
          onClick={() => onChange(value === 'am' ? undefined : 'am')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl mb-2">🌅</div>
            <div className="font-medium">Morning</div>
            <div className="text-sm text-muted-foreground text-center">
              Before 12 PM
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            value === 'pm' ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/5",
            error && "border-destructive"
          )}
          onClick={() => onChange(value === 'pm' ? undefined : 'pm')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl mb-2">🌆</div>
            <div className="font-medium">Evening</div>
            <div className="text-sm text-muted-foreground text-center">
              After 12 PM
            </div>
          </CardContent>
        </Card>
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
      
      {helperText && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
} 