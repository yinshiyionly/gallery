import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumb, generateBreadcrumbs } from '../ui/Breadcrumb';
import { PageGestureHandler } from '../ui/GestureHandler';
import { cn } from '@/lib/utils';

interface AnimatedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideBreadcrumb?: boolean;
  breadcrumbTitle?: string;
  enableGestures?: boolean;
}

// 页面容器动画变体
const pageContainerVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

// 主内容区域动画变体
const mainContentVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

// 页面过渡动画配置
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

// 内容过渡动画配置
const contentTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.5,
  delay: 0.1,
};

const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({
  children,
  title = '多端画廊',
  description = '一个基于 Next.js 和 MongoDB 构建的现代化多端画廊项目',
  className,
  hideHeader = false,
  hideFooter = false,
  hideBreadcrumb = false,
  breadcrumbTitle,
  enableGestures = true,
}) => {
  const router = useRouter();

  const layoutContent = (
    <motion.div
      key={router.asPath}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageContainerVariants}
      transition={pageTransition}
      className="flex flex-col min-h-screen"
    >
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Header />
        </motion.div>
      )}
      
      {!hideBreadcrumb && !hideHeader && router.pathname !== '/' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="pt-20 pb-4 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container mx-auto px-4">
            <Breadcrumb 
              items={generateBreadcrumbs(router.pathname, breadcrumbTitle)}
            />
          </div>
        </motion.div>
      )}
      
      <motion.main
        initial="initial"
        animate="in"
        exit="out"
        variants={mainContentVariants}
        transition={contentTransition}
        className={cn('flex-grow', className)}
      >
        {children}
      </motion.main>
      
      {!hideFooter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <Footer />
        </motion.div>
      )}
    </motion.div>
  );

  // 如果启用手势，包装在手势处理器中
  if (enableGestures) {
    return (
      <PageGestureHandler>
        {layoutContent}
      </PageGestureHandler>
    );
  }

  return layoutContent;
};

export { AnimatedLayout };

// 页面部分动画组件
export const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, delay = 0, className = '', direction = 'up' }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 40 };
      case 'down':
        return { y: -40 };
      case 'left':
        return { x: -40 };
      case 'right':
        return { x: 40 };
      default:
        return { y: 40 };
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// 页面标题动画组件
export const AnimatedTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}> = ({ children, className = '', level = 1 }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
    >
      <Tag className={className}>
        {children}
      </Tag>
    </motion.div>
  );
};

// 页面内容动画组件
export const AnimatedContent: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  stagger?: boolean;
}> = ({ children, delay = 0.1, className = '', stagger = false }) => {
  if (stagger && React.Children.count(children) > 1) {
    return (
      <div className={className}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.1,
              ease: 'easeOut',
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};