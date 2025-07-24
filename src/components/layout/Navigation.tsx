import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  external?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  orientation = 'horizontal',
  className,
  itemClassName,
  activeClassName,
  onItemClick,
}) => {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const baseItemClass = cn(
    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
    'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    itemClassName
  );

  const activeItemClass = cn(
    'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20',
    activeClassName
  );

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1',
        className
      )}
      role="navigation"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(baseItemClass, active && activeItemClass)}
              onClick={() => handleItemClick(item)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(baseItemClass, active && activeItemClass)}
            onClick={() => handleItemClick(item)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

// 预定义的导航项目
export const mainNavigationItems: NavigationItem[] = [
  {
    href: '/',
    label: '首页',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/gallery',
    label: '画廊',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const footerNavigationItems: NavigationItem[] = [
  ...mainNavigationItems,
  {
    href: '/search',
    label: '搜索',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
];