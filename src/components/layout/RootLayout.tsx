import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { PerformanceMonitor } from '../dev/PerformanceMonitor';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { monitorNextDynamicImports } from '@/lib/utils/bundleAnalyzer';

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 根布局组件
 * 包含性能监控、移动端优化等功能
 */
export const RootLayout: React.FC<RootLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  // 移动端优化
  const { 
    deviceInfo, 
    optimizationSettings,
    registerServiceWorker 
  } = useMobileOptimization();

  // 初始化性能监控
  useEffect(() => {
    // 启动 bundle 监控
    monitorNextDynamicImports();

    // 注册 Service Worker
    registerServiceWorker();

    // 设置性能监控
    if (process.env.NODE_ENV === 'development') {
      // 开发环境下启用详细的性能监控
      console.log('Performance monitoring enabled');
      console.log('Device info:', deviceInfo);
      console.log('Optimization settings:', optimizationSettings);
    }

    // 监控 Core Web Vitals
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, [deviceInfo, optimizationSettings, registerServiceWorker]);

  // 应用优化设置
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // 根据设备性能调整CSS变量
      const root = document.documentElement;
      
      if (optimizationSettings.reducedMotion) {
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0.1s');
      } else {
        root.style.setProperty('--animation-duration', '0.3s');
        root.style.setProperty('--transition-duration', '0.2s');
      }

      // 设置图片质量
      root.style.setProperty('--image-quality', optimizationSettings.imageQuality.toString());

      // 移动端优化
      if (deviceInfo.isMobile) {
        root.classList.add('mobile-optimized');
        // 禁用某些动画以提升性能
        if (deviceInfo.isLowEnd) {
          root.classList.add('low-end-device');
        }
      }
    }
  }, [optimizationSettings, deviceInfo]);

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* 头部导航 */}
      <Header />
      
      {/* 主要内容区域 */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      {/* 底部 */}
      <Footer />
      
      {/* 开发环境性能监控 */}
      <PerformanceMonitor />
      
      {/* PWA 安装提示 */}
      <PWAInstallPrompt />
    </div>
  );
};

/**
 * PWA 安装提示组件
 */
const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止默认的安装提示
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // 显示安装提示
    deferredPrompt.prompt();
    
    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA 安装成功');
    } else {
      console.log('PWA 安装被拒绝');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 记住用户的选择，一段时间内不再显示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 检查是否应该显示提示
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneWeek) {
        setShowPrompt(false);
        return;
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              安装应用
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              将画廊应用添加到主屏幕，获得更好的体验
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
              >
                安装
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};