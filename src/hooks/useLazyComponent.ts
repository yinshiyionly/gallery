import { useState, useEffect, useRef, ComponentType } from 'react';
import { bundleAnalyzer } from '@/lib/utils/bundleAnalyzer';

interface UseLazyComponentOptions {
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
  fallback?: ComponentType;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseLazyComponentReturn<T> {
  Component: T | null;
  isLoading: boolean;
  error: Error | null;
  ref: React.RefObject<HTMLElement>;
  load: () => Promise<void>;
}

/**
 * 组件懒加载Hook
 * 支持基于视口的懒加载和手动触发加载
 */
export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: UseLazyComponentOptions = {}
): UseLazyComponentReturn<T> => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    preload = false,
    onLoad,
    onError
  } = options;

  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedRef = useRef(false);

  // 加载组件的函数
  const load = async () => {
    if (loadedRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);
    bundleAnalyzer.startBundleLoad(componentName);

    try {
      const module = await importFn();
      setComponent(() => module.default);
      loadedRef.current = true;
      bundleAnalyzer.endBundleLoad(componentName);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component');
      setError(error);
      bundleAnalyzer.endBundleLoad(componentName);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 设置 Intersection Observer
  useEffect(() => {
    if (preload) {
      load();
      return;
    }

    if (!ref.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadedRef.current) {
            load();
            // 停止观察已经开始加载的组件
            if (observerRef.current && entry.target) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, preload]);

  return {
    Component,
    isLoading,
    error,
    ref,
    load
  };
};

/**
 * 批量懒加载Hook
 * 用于预加载多个相关组件
 */
export const useBatchLazyLoad = (
  imports: Array<{
    importFn: () => Promise<{ default: ComponentType<any> }>;
    name: string;
  }>,
  options: {
    concurrent?: number;
    delay?: number;
    onProgress?: (loaded: number, total: number) => void;
  } = {}
) => {
  const { concurrent = 3, delay = 100, onProgress } = options;
  const [loadedComponents, setLoadedComponents] = useState<Map<string, ComponentType<any>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadBatch = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setProgress(0);

    const chunks = [];
    for (let i = 0; i < imports.length; i += concurrent) {
      chunks.push(imports.slice(i, i + concurrent));
    }

    let loaded = 0;

    for (const chunk of chunks) {
      const promises = chunk.map(async ({ importFn, name }) => {
        bundleAnalyzer.startBundleLoad(name);
        try {
          const module = await importFn();
          bundleAnalyzer.endBundleLoad(name);
          return { name, component: module.default };
        } catch (error) {
          bundleAnalyzer.endBundleLoad(name);
          console.warn(`Failed to load component ${name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach((result) => {
        if (result) {
          setLoadedComponents(prev => new Map(prev).set(result.name, result.component));
          loaded++;
          setProgress(loaded);
          onProgress?.(loaded, imports.length);
        }
      });

      // 在批次之间添加延迟，避免阻塞主线程
      if (delay > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsLoading(false);
  };

  return {
    loadedComponents,
    isLoading,
    progress,
    total: imports.length,
    loadBatch
  };
};

/**
 * 路由级别的懒加载Hook
 */
export const useRouteLazyLoad = (
  routeComponents: Record<string, () => Promise<{ default: ComponentType<any> }>>,
  currentRoute: string
) => {
  const [loadedRoutes, setLoadedRoutes] = useState<Set<string>>(new Set());
  const [currentComponent, setCurrentComponent] = useState<ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 预加载相关路由
  const preloadRoute = async (route: string) => {
    if (loadedRoutes.has(route) || !routeComponents[route]) return;

    try {
      bundleAnalyzer.startBundleLoad(`route-${route}`);
      const module = await routeComponents[route]();
      bundleAnalyzer.endBundleLoad(`route-${route}`);
      
      setLoadedRoutes(prev => new Set(prev).add(route));
      
      if (route === currentRoute) {
        setCurrentComponent(() => module.default);
      }
    } catch (error) {
      bundleAnalyzer.endBundleLoad(`route-${route}`);
      console.warn(`Failed to preload route ${route}:`, error);
    }
  };

  // 加载当前路由
  useEffect(() => {
    if (!routeComponents[currentRoute]) return;

    if (loadedRoutes.has(currentRoute)) {
      // 如果已经加载过，直接使用缓存的组件
      return;
    }

    setIsLoading(true);
    preloadRoute(currentRoute).finally(() => {
      setIsLoading(false);
    });
  }, [currentRoute]);

  // 智能预加载：预加载可能访问的路由
  const preloadRelatedRoutes = (routes: string[]) => {
    routes.forEach(route => {
      if (!loadedRoutes.has(route)) {
        // 延迟预加载，避免影响当前页面性能
        setTimeout(() => preloadRoute(route), 1000);
      }
    });
  };

  return {
    currentComponent,
    isLoading,
    loadedRoutes: Array.from(loadedRoutes),
    preloadRelatedRoutes
  };
};

/**
 * 基于用户行为的智能预加载Hook
 */
export const useSmartPreload = () => {
  const [userBehavior, setUserBehavior] = useState({
    hoveredElements: new Set<string>(),
    clickedElements: new Set<string>(),
    scrollDirection: 'down' as 'up' | 'down',
    scrollSpeed: 0
  });

  const preloadOnHover = (
    element: HTMLElement,
    importFn: () => Promise<{ default: ComponentType<any> }>,
    componentName: string
  ) => {
    let preloaded = false;

    const handleMouseEnter = () => {
      if (!preloaded) {
        preloaded = true;
        setUserBehavior(prev => ({
          ...prev,
          hoveredElements: new Set(prev.hoveredElements).add(componentName)
        }));

        // 延迟预加载，给用户一些思考时间
        setTimeout(async () => {
          try {
            bundleAnalyzer.startBundleLoad(componentName);
            await importFn();
            bundleAnalyzer.endBundleLoad(componentName);
          } catch (error) {
            bundleAnalyzer.endBundleLoad(componentName);
            console.warn(`Failed to preload ${componentName}:`, error);
          }
        }, 200);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter, { once: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  };

  const preloadOnScroll = (
    importFns: Array<{
      importFn: () => Promise<{ default: ComponentType<any> }>;
      name: string;
      priority: number;
    }>
  ) => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      const speed = Math.abs(currentScrollY - lastScrollY);

      setUserBehavior(prev => ({
        ...prev,
        scrollDirection: direction,
        scrollSpeed: speed
      }));

      // 如果用户快速滚动，预加载高优先级组件
      if (speed > 50) {
        const highPriorityComponents = importFns
          .filter(item => item.priority > 0.7)
          .sort((a, b) => b.priority - a.priority);

        highPriorityComponents.slice(0, 2).forEach(({ importFn, name }) => {
          setTimeout(async () => {
            try {
              bundleAnalyzer.startBundleLoad(name);
              await importFn();
              bundleAnalyzer.endBundleLoad(name);
            } catch (error) {
              bundleAnalyzer.endBundleLoad(name);
            }
          }, 500);
        });
      }

      lastScrollY = currentScrollY;

      // 防抖处理
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setUserBehavior(prev => ({ ...prev, scrollSpeed: 0 }));
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  };

  return {
    userBehavior,
    preloadOnHover,
    preloadOnScroll
  };
};