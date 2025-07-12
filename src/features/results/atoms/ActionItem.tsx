import { cn } from '../../../lib/utils';

interface ActionItemProps {
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  onClick?: () => void;
  className?: string;
}

const priorityStyles = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50', 
  low: 'border-blue-200 bg-blue-50'
};

const priorityDots = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500'
};

export function ActionItem({ 
  icon, 
  title, 
  description, 
  priority, 
  completed = false,
  onClick,
  className 
}: ActionItemProps) {
  return (
    <div 
      className={cn(
        "flex items-start space-x-4 p-4 rounded-lg border transition-all",
        priorityStyles[priority],
        onClick && "cursor-pointer hover:shadow-sm",
        completed && "opacity-60",
        className
      )}
      onClick={onClick}
    >
      {/* Priority indicator */}
      <div className="flex-shrink-0 mt-1">
        <div className={cn(
          "w-2 h-2 rounded-full",
          priorityDots[priority]
        )} />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 text-2xl">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className={cn(
            "text-sm font-medium",
            completed && "line-through"
          )}>
            {title}
          </h4>
          {completed && (
            <span className="text-green-600 text-sm">✓</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>

      {/* Action arrow */}
      {onClick && (
        <div className="flex-shrink-0 text-gray-400">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      )}
    </div>
  );
} 