import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: RadioOption[];
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  inline?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  className,
  options,
  name,
  value,
  onChange,
  error,
  label,
  inline = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={className} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className={cn('space-y-2', inline && 'flex flex-wrap gap-4 space-y-0')}>
        {options.map((option) => (
          <div key={option.value} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                disabled={option.disabled}
                className={cn(
                  'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-primary-500',
                  error && 'border-red-500 focus:ring-red-500'
                )}
              />
            </div>
            <div className="ml-2 text-sm">
              <label
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  'font-medium text-gray-700 dark:text-gray-300',
                  option.disabled && 'opacity-70'
                )}
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>}
    </div>
  );
};

export { RadioGroup };