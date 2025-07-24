import React from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = '多端画廊',
  description = '一个基于 Next.js 和 MongoDB 构建的现代化多端画廊项目',
  className,
  hideHeader = false,
  hideFooter = false,
}) => {
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
        
        <main className={cn('flex-grow', className)}>
          {children}
        </main>
        
        {!hideFooter && <Footer />}
      </div>
    </>
  );
};

export { Layout };