import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bundleAnalyzer } from '@/lib/utils/bundleAnalyzer';

interface PerformanceData {
  fps: number;
  memory: number;
  bundleCount: number;
  totalSize: number;
  loadTime: number;
  cacheHitRate: number;
}

/**
 * 性能监控组件（仅在开发环境显示）
 */
export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 0,
    memory: 0,
    bundleCount: 0,
    totalSize: 0,
    loadTime: 0,
    cacheHitRate: 0
  });

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // FPS 监控
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformanceData(prev => ({ ...prev, fps }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // 内存监控
  useEffect(() => {
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        setPerformanceData(prev => ({ ...prev, memory: memoryUsage }));
      }
    };

    const interval = setInterval(updateMemory, 2000);
    updateMemory();

    return () => clearInterval(interval);
  }, []);

  // Bundle 监控
  useEffect(() => {
    const unsubscribe = bundleAnalyzer.addObserver((metrics) => {
      setPerformanceData(prev => ({
        ...prev,
        bundleCount: metrics.loadedBundles.length,
        totalSize: Math.round(metrics.totalBundleSize / 1024), // KB
        loadTime: Math.round(metrics.averageLoadTime),
        cacheHitRate: Math.round(metrics.cacheHitRate * 100)
      }));
    });

    return unsubscribe;
  }, []);

  // 页面加载时间监控
  useEffect(() => {
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = Math.round(navigation.loadEventEnd - navigation.navigationStart);
      setPerformanceData(prev => ({ ...prev, loadTime }));
    }
  }, []);

  // 键盘快捷键切换显示
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-500';
    if (memory < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      {/* 切换按钮 */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="性能监控 (Ctrl+Shift+P)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </motion.button>

      {/* 性能面板 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-4 right-4 z-40 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-xl font-mono text-sm max-w-xs"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">性能监控</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {/* FPS */}
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={getStatusColor(performanceData.fps, { good: 55, warning: 30 })}>
                  {performanceData.fps}
                </span>
              </div>

              {/* 内存使用 */}
              <div className="flex justify-between">
                <span>内存:</span>
                <span className={getMemoryColor(performanceData.memory)}>
                  {performanceData.memory}%
                </span>
              </div>

              {/* Bundle 信息 */}
              <div className="flex justify-between">
                <span>Bundles:</span>
                <span className="text-blue-400">{performanceData.bundleCount}</span>
              </div>

              <div className="flex justify-between">
                <span>大小:</span>
                <span className="text-blue-400">{performanceData.totalSize} KB</span>
              </div>

              {/* 加载时间 */}
              <div className="flex justify-between">
                <span>加载:</span>
                <span className={getStatusColor(5000 - performanceData.loadTime, { good: 4000, warning: 2000 })}>
                  {performanceData.loadTime} ms
                </span>
              </div>

              {/* 缓存命中率 */}
              <div className="flex justify-between">
                <span>缓存:</span>
                <span className={getStatusColor(performanceData.cacheHitRate, { good: 80, warning: 50 })}>
                  {performanceData.cacheHitRate}%
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 pt-3 border-t border-gray-600 space-y-2">
              <button
                onClick={() => {
                  console.log(bundleAnalyzer.generateReport());
                }}
                className="w-full text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
              >
                输出报告到控制台
              </button>
              
              <button
                onClick={() => {
                  bundleAnalyzer.clear();
                  setPerformanceData(prev => ({
                    ...prev,
                    bundleCount: 0,
                    totalSize: 0,
                    cacheHitRate: 0
                  }));
                }}
                className="w-full text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded transition-colors"
              >
                清除数据
              </button>
            </div>

            {/* 状态指示器 */}
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>良好</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>警告</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>危险</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};