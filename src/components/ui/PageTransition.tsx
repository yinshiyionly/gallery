import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// 页面过渡动画变体
const pageVariants = {
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

// 滑动过渡动画变体（用于移动端手势）
const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  in: {
    x: 0,
    opacity: 1,
  },
  out: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const slideTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const router = useRouter();
  const [direction, setDirection] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  // 检测移动端设备
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 监听路由变化以确定滑动方向
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      // 简单的路由层级判断
      const currentDepth = router.asPath.split('/').length;
      const newDepth = url.split('/').length;
      
      setDirection(newDepth > currentDepth ? 1 : -1);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // 根据设备类型选择动画变体
  const variants = isMobile ? slideVariants : pageVariants;
  const transition = isMobile ? slideTransition : pageTransition;

  return (
    <motion.div
      key={router.asPath}
      custom={direction}
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 页面容器组件，提供统一的页面结构和动画
export const AnimatedPage: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  return (
    <PageTransition className={`min-h-screen ${className}`}>
      {children}
    </PageTransition>
  );
};

// 页面内容区域动画组件
export const PageContent: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
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

// 页面标题动画组件
export const PageTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.h1>
  );
};

// 页面部分动画组件
export const PageSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0.1, className = '' }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
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