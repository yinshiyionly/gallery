import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  label,
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex h-full items-center', className)}>
        <div className="h-full w-px bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (label) {
    return (
      <div className={cn('flex items-center', className)}>
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return <div className={cn('h-px bg-gray-200 dark:bg-gray-700', className)} />;
};

export { Divider };