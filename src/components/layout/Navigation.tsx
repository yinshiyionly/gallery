import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export const Navigation: React.FC = () => {
  const router = useRouter();
  
  const navigationItems: NavigationItem[] = [
    {
      name: '首页',
      href: '/',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: '画廊',
      href: '/gallery',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="flex justify-center md:justify-start space-x-4 py-4 px-4 overflow-x-auto">
      {navigationItems.map((item) => {
        const isActive = router.pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};