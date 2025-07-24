import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
}) => {
  return (
    <nav className={cn('flex', className)} aria-label="面包屑导航">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <div className="flex items-center">
                {separator}
              </div>
            )}
            
            {item.current || !item.href ? (
              <span 
                className={cn(
                  'ml-1 text-sm font-medium md:ml-2',
                  item.current 
                    ? 'text-gray-500 dark:text-gray-400' 
                    : 'text-gray-700 dark:text-gray-300'
                )}
                aria-current={item.current ? 'page' : undefined}
                title={item.label}
              >
                {item.label.length > 30 ? `${item.label.substring(0, 30)}...` : item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 md:ml-2 transition-colors"
                title={item.label}
              >
                {item.label.length > 30 ? `${item.label.substring(0, 30)}...` : item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// 预定义的面包屑生成器
export const generateBreadcrumbs = (pathname: string, title?: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { label: '首页', href: '/' }
  ];

  if (pathname === '/') {
    items[0].current = true;
    return items;
  }

  if (pathname.startsWith('/gallery')) {
    items.push({ label: '画廊', href: '/gallery' });
    
    if (pathname === '/gallery') {
      items[items.length - 1].current = true;
    }
  }

  if (pathname.startsWith('/search')) {
    items.push({ label: '搜索', href: '/search' });
    
    if (pathname === '/search') {
      items[items.length - 1].current = true;
    }
  }

  if (pathname.startsWith('/media/')) {
    items.push({ label: '画廊', href: '/gallery' });
    items.push({ 
      label: title || '媒体详情', 
      current: true 
    });
  }

  return items;
};