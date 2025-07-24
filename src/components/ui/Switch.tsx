import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = 'md', error, ...props }, ref) => {
    const sizeClasses = {
      sm: {
        switch: 'h-4 w-7',
        dot: 'h-3 w-3',
        translate: 'translate-x-3',
      },
      md: {
        switch: 'h-6 w-11',
        dot: 'h-5 w-5',
        translate: 'translate-x-5',
      },
      lg: {
        switch: 'h-7 w-14',
        dot: 'h-6 w-6',
        translate: 'translate-x-7',
      },
    };

    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                'bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all dark:border-gray-600 peer-checked:bg-primary-600',
                sizeClasses[size].switch,
                `after:${sizeClasses[size].dot}`,
                `peer-checked:after:${sizeClasses[size].translate}`,
                error && 'border-red-500',
                className
              )}
            ></div>
          </label>
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'font-medium text-gray-700 dark:text-gray-300',
                  props.disabled && 'opacity-70'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };