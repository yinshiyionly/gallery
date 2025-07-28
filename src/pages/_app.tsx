import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { ScrollProgress } from '@/components/ui/SmoothScroll';

export default function App({ Component, pageProps, router }: AppProps) {
  const [mounted, setMounted] = useState(false);
  
  // 初始化主题
  useTheme();

  // 确保在客户端渲染后才显示内容，避免暗色模式闪烁
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ScrollProgress />
      <AnimatePresence mode="wait">
        <Component {...pageProps} key={router.asPath} />
      </AnimatePresence>
    </>
  );
}