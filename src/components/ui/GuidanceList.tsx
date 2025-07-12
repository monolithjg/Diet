import { useState, useMemo } from 'react';
import { GuidanceCard } from './GuidanceCard';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import type { GuidanceMessage } from '../../lib/macros';

interface GuidanceListProps {
  guidance: GuidanceMessage[];
  loading?: boolean;
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

type FilterType = 'all' | 'critical' | 'warn' | 'info';
type FilterCategory = 'all' | 'mealTiming' | 'micronutrient' | 'hydration' | 'allergySwap' | 'lifestyle' | 'validation';

const typeOrder: Record<GuidanceMessage['type'], number> = {
  critical: 1,
  warn: 2,
  info: 3
};

export function GuidanceList({ 
  guidance, 
  loading = false, 
  title = "Personalized Guidance",
  showFilters = true,
  maxItems,
  className 
}: GuidanceListProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandAll, setExpandAll] = useState(false);

  // Sort guidance by priority (critical > warn > info) and separate disclaimer
  const sortedGuidance = useMemo(() => {
    const sorted = [...guidance].sort((a, b) => {
      // Disclaimer always last
      if (a.key.includes('disclaimer')) return 1;
      if (b.key.includes('disclaimer')) return -1;
      
      // Sort by type priority
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  }, [guidance, maxItems]);

  // Filter guidance based on selected filters
  const filteredGuidance = useMemo(() => {
    return sortedGuidance.filter(message => {
      if (filterType !== 'all' && message.type !== filterType) return false;
      if (filterCategory !== 'all' && message.category !== filterCategory) return false;
      return true;
    });
  }, [sortedGuidance, filterType, filterCategory]);

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set(guidance.map(g => g.category));
    return Array.from(categories).sort();
  }, [guidance]);

  // Count by type for filter badges
  const typeCounts = useMemo(() => {
    return guidance.reduce((acc, message) => {
      acc[message.type] = (acc[message.type] || 0) + 1;
      return acc;
    }, {} as Record<GuidanceMessage['type'], number>);
  }, [guidance]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Generating personalized guidance...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (guidance.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No guidance available yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete your nutrition profile to receive personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({filteredGuidance.length} {filteredGuidance.length === 1 ? 'recommendation' : 'recommendations'})
          </span>
        </h3>
        
        {filteredGuidance.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && guidance.length > 3 && (
        <div className="space-y-3">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by priority:</span>
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filterType === 'all' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All ({guidance.length})
            </button>
            {(['critical', 'warn', 'info'] as const).map(type => {
              const count = typeCounts[type] || 0;
              if (count === 0) return null;
              
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                    filterType === type 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Filter */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  filterCategory === 'all' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                All Categories
              </button>
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category as FilterCategory)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    filterCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {category === 'mealTiming' ? 'Meal Timing' :
                   category === 'micronutrient' ? 'Nutrients' :
                   category === 'allergySwap' ? 'Food Swaps' :
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guidance Cards */}
      <div className="space-y-3">
        {filteredGuidance.map((message, index) => (
          <GuidanceCard
            key={`${message.key}-${index}`}
            message={message}
            expanded={expandAll}
            showCategory={filterCategory === 'all'}
          />
        ))}
      </div>

      {/* Footer message if filtered */}
      {filteredGuidance.length < guidance.length && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredGuidance.length} of {guidance.length} recommendations. 
          Adjust filters to see more.
        </p>
      )}
    </div>
  );
}