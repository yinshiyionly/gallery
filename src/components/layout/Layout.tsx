import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumb, generateBreadcrumbs } from '../ui/Breadcrumb';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideBreadcrumb?: boolean;
  breadcrumbTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = '多端画廊',
  description = '一个基于 Next.js 和 MongoDB 构建的现代化多端画廊项目',
  className,
  hideHeader = false,
  hideFooter = false,
  hideBreadcrumb = false,
  breadcrumbTitle,
}) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        {!hideHeader && <Header />}
        
        {!hideBreadcrumb && !hideHeader && router.pathname !== '/' && (
          <div className="pt-20 pb-4 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <Breadcrumb 
                items={generateBreadcrumbs(router.pathname, breadcrumbTitle)}
              />
            </div>
          </div>
        )}
        
        <main className={cn('flex-grow', className)}>
          {children}
        </main>
        
        {!hideFooter && <Footer />}
      </div>
    </>
  );
};

export { Layout };