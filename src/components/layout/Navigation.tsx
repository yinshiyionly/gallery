import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
  vertical?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = ({ className, vertical = false }) => {
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: '首页',
      href: '/',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
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
      label: '画廊',
      href: '/gallery',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
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

  return (
    <nav className={cn(
      vertical 
        ? 'flex flex-col space-y-2' 
        : 'flex items-center space-x-6',
      className
    )}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors',
            vertical 
              ? 'flex items-center px-3 py-2 rounded-md' 
              : 'flex items-center',
            router.pathname === item.href
              ? 'text-primary-600 dark:text-primary-400 font-medium'
              : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400',
            vertical && router.pathname === item.href && 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          {item.icon && (
            <span className={cn('', vertical ? 'mr-3' : 'mr-2')}>
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export { Navigation };