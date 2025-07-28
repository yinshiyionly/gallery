import { useEffect, useState, useCallback } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  connectionType: string;
  memoryLevel: 'low' | 'medium' | 'high';
  pixelRatio: number;
  screenSize: { width: number; height: number };
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
}

/**
 * 移动端性能优化Hook
 * 检测设备性能并提供相应的优化建议
 */
export const useMobileOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowEnd: false,
    connectionType: 'unknown',
    memoryLevel: 'high',
    pixelRatio: 1,
    screenSize: { width: 1920, height: 1080 }
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  });

  const [optimizationSettings, setOptimizationSettings] = useState({
    enableAnimations: true,
    imageQuality: 80,
    preloadCount: 6,
    enableLazyLoading: true,
    enableVirtualization: false,
    reducedMotion: false
  });

  // 检测设备信息
  const detectDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // 检测低端设备
    const isLowEnd = detectLowEndDevice();

    // 检测网络连接类型
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';

    // 检测内存级别
    const memoryLevel = detectMemoryLevel();

    // 获取设备像素比和屏幕尺寸
    const pixelRatio = window.devicePixelRatio || 1;
    const screenSize = {
      width: window.screen.width,
      height: window.screen.height
    };

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isLowEnd,
      connectionType,
      memoryLevel,
      pixelRatio,
      screenSize
    });
  }, []);

  // 检测低端设备
  const detectLowEndDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // 检查硬件并发数
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    if (hardwareConcurrency <= 2) return true;

    // 检查设备内存
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory <= 2) return true;

    // 检查用户代理中的低端设备标识
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndPatterns = [
      'android 4', 'android 5', 'android 6',
      'iphone os 9', 'iphone os 10', 'iphone os 11',
      'opera mini', 'ucbrowser'
    ];

    return lowEndPatterns.some(pattern => userAgent.includes(pattern));
  }, []);

  // 检测内存级别
  const detectMemoryLevel = useCallback((): 'low' | 'medium' | 'high' => {
    if (typeof window === 'undefined') return 'high';

    const deviceMemory = (navigator as any).deviceMemory;
    if (!deviceMemory) return 'medium';

    if (deviceMemory <= 2) return 'low';
    if (deviceMemory <= 4) return 'medium';
    return 'high';
  }, []);

  // 监控性能指标
  const monitorPerformance = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 监控 FPS
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformanceMetrics(prev => ({ ...prev, fps }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // 监控内存使用
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      setPerformanceMetrics(prev => ({ ...prev, memoryUsage }));
    }

    // 监控加载时间
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      setPerformanceMetrics(prev => ({ ...prev, loadTime }));
    }
  }, []);

  // 根据设备性能调整优化设置
  const adjustOptimizationSettings = useCallback(() => {
    const { isLowEnd, connectionType, memoryLevel, isMobile } = deviceInfo;
    
    let newSettings = { ...optimizationSettings };

    // 低端设备优化
    if (isLowEnd || memoryLevel === 'low') {
      newSettings = {
        ...newSettings,
        enableAnimations: false,
        imageQuality: 60,
        preloadCount: 3,
        enableVirtualization: true,
        reducedMotion: true
      };
    }

    // 慢网络优化
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      newSettings = {
        ...newSettings,
        imageQuality: 50,
        preloadCount: 2,
        enableLazyLoading: true
      };
    }

    // 移动设备优化
    if (isMobile) {
      newSettings = {
        ...newSettings,
        preloadCount: Math.max(newSettings.preloadCount - 2, 2)
      };
    }

    // 检查用户偏好设置
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      newSettings.reducedMotion = true;
      newSettings.enableAnimations = false;
    }

    setOptimizationSettings(newSettings);
  }, [deviceInfo, optimizationSettings]);

  // 获取优化建议
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    const { fps, memoryUsage } = performanceMetrics;
    const { isLowEnd, connectionType } = deviceInfo;

    if (fps < 30) {
      recommendations.push('检测到低帧率，建议关闭动画效果');
    }

    if (memoryUsage > 0.8) {
      recommendations.push('内存使用率过高，建议启用虚拟化滚动');
    }

    if (isLowEnd) {
      recommendations.push('检测到低端设备，建议降低图片质量');
    }

    if (connectionType === 'slow-2g' || connectionType === '2g') {
      recommendations.push('检测到慢网络，建议减少预加载数量');
    }

    return recommendations;
  }, [performanceMetrics, deviceInfo]);

  // 应用性能优化
  const applyPerformanceOptimizations = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 禁用不必要的功能
    if (optimizationSettings.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }

    // 调整图片加载策略
    if (deviceInfo.isLowEnd) {
      // 延迟非关键图片的加载
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        (img as HTMLImageElement).loading = 'lazy';
      });
    }

    // 调整滚动性能
    if (deviceInfo.isMobile) {
      document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
    }
  }, [optimizationSettings, deviceInfo]);

  // 预加载关键资源
  const preloadCriticalResources = useCallback((urls: string[]) => {
    if (typeof window === 'undefined') return;

    const maxPreload = optimizationSettings.preloadCount;
    const urlsToPreload = urls.slice(0, maxPreload);

    urlsToPreload.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [optimizationSettings.preloadCount]);

  // 注册 Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('New version available');
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }, []);

  // 初始化
  useEffect(() => {
    detectDeviceInfo();
    monitorPerformance();
    registerServiceWorker();
  }, [detectDeviceInfo, monitorPerformance, registerServiceWorker]);

  // 当设备信息变化时调整优化设置
  useEffect(() => {
    adjustOptimizationSettings();
  }, [deviceInfo]);

  // 应用优化设置
  useEffect(() => {
    applyPerformanceOptimizations();
  }, [optimizationSettings]);

  return {
    deviceInfo,
    performanceMetrics,
    optimizationSettings,
    getOptimizationRecommendations,
    preloadCriticalResources,
    registerServiceWorker
  };
};