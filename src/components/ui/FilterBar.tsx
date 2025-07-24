import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface FilterBarProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, values: string[]) => void;
  onClearFilters?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  groups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className,
}) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const handleToggleGroup = (groupId: string) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  const handleSelectOption = (groupId: string, value: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const currentValues = selectedFilters[groupId] || [];
    let newValues: string[];

    if (group.multiSelect) {
      // For multi-select, toggle the value
      newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
    } else {
      // For single-select, replace the value or clear if already selected
      newValues = currentValues.includes(value) ? [] : [value];
    }

    onFilterChange(groupId, newValues);
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = Object.values(selectedFilters).some(values => values.length > 0);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((group) => (
          <div key={group.id} className="relative">
            <button
              type="button"
              className={cn(
                'px-3 py-1.5 text-sm border rounded-md flex items-center gap-1.5 transition-colors',
                activeGroup === group.id
                  ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-400'
                  : 'bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750',
                selectedFilters[group.id]?.length
                  ? 'font-medium text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              onClick={() => handleToggleGroup(group.id)}
            >
              {group.label}
              {selectedFilters[group.id]?.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                  {selectedFilters[group.id].length}
                </span>
              )}
              <svg
                className={cn(
                  'w-4 h-4 transition-transform',
                  activeGroup === group.id ? 'transform rotate-180' : ''
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {activeGroup === group.id && (
              <div className="absolute z-10 w-56 mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {group.options.map((option) => {
                    const isSelected = selectedFilters[group.id]?.includes(option.value);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between',
                          isSelected
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-750'
                        )}
                        onClick={() => handleSelectOption(group.id, option.value)}
                      >
                        {option.label}
                        {isSelected && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {hasActiveFilters && (
          <button
            type="button"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={handleClearFilters}
          >
            清除全部筛选
          </button>
        )}
      </div>

      {/* Selected filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {groups.map((group) => {
            const selectedValues = selectedFilters[group.id] || [];
            if (selectedValues.length === 0) return null;

            return selectedValues.map((value) => {
              const option = group.options.find((opt) => opt.value === value);
              if (!option) return null;

              return (
                <Badge
                  key={`${group.id}-${value}`}
                  variant="secondary"
                  removable
                  onRemove={() => {
                    const newValues = selectedFilters[group.id].filter((v) => v !== value);
                    onFilterChange(group.id, newValues);
                  }}
                >
                  {group.label}: {option.label}
                </Badge>
              );
            });
          })}
        </div>
      )}
    </div>
  );
};