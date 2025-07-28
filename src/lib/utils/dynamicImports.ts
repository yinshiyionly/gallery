import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * 动态导入工具函数
 * 提供统一的代码分割和懒加载功能
 */

// 加载状态组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// 错误边界组件
const ErrorFallback = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      组件加载失败
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {error.message || '未知错误'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        重试
      </button>
    )}
  </div>
);

/**
 * 创建动态导入组件的工厂函数
 */
export const createDynamicComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType;
    error?: ComponentType<{ error: Error; retry?: () => void }>;
    ssr?: boolean;
    suspense?: boolean;
  } = {}
) => {
  const {
    loading = LoadingSpinner,
    error = ErrorFallback,
    ssr = false,
    suspense = false
  } = options;

  return dynamic(importFn, {
    loading: () => loading({}),
    ssr,
    suspense
  });
};

/**
 * 预定义的动态组件
 */

// 画廊相关组件
export const DynamicGalleryGrid = createDynamicComponent(
  () => import('@/components/gallery/GalleryGrid'),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-[4/3] w-full" />
        ))}
      </div>
    ),
    ssr: false
  }
);

export const DynamicMediaModal = createDynamicComponent(
  () => import('@/components/gallery/MediaModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
);

export const DynamicMobileMediaViewer = createDynamicComponent(
  () => import('@/components/gallery/MobileMediaViewer'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    ),
    ssr: false
  }
);

// UI 组件
export const DynamicSearchInput = createDynamicComponent(
  () => import('@/components/ui/SearchInput'),
  {
    loading: () => <LoadingSkeleton className="h-10 w-full max-w-md" />,
    ssr: true
  }
);

export const DynamicFilterBar = createDynamicComponent(
  () => import('@/components/gallery/FilterBar'),
  {
    loading: () => (
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-8 w-20" />
        ))}
      </div>
    ),
    ssr: false
  }
);

// 图表和数据可视化组件（如果有的话）
export const DynamicChart = createDynamicComponent(
  () => import('@/components/ui/Chart'),
  {
    loading: () => <LoadingSkeleton className="h-64 w-full" />,
    ssr: false
  }
);

// 管理面板组件
export const DynamicAdminPanel = createDynamicComponent(
  () => import('@/components/admin/AdminPanel'),
  {
    loading: () => (
      <div className="p-6">
        <LoadingSkeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
);

/**
 * 路由级别的动态导入
 */
export const DynamicPages = {
  Gallery: createDynamicComponent(
    () => import('@/pages/gallery'),
    {
      loading: () => (
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <LoadingSkeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        </div>
      ),
      ssr: true
    }
  ),

  Search: createDynamicComponent(
    () => import('@/pages/search'),
    {
      loading: () => (
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="h-10 w-full max-w-md mb-6" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      ),
      ssr: true
    }
  ),

  MediaDetail: createDynamicComponent(
    () => import('@/pages/media/[id]'),
    {
      loading: () => (
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton className="aspect-video w-full mb-6" />
          <LoadingSkeleton className="h-8 w-3/4 mb-4" />
          <LoadingSkeleton className="h-4 w-full mb-2" />
          <LoadingSkeleton className="h-4 w-2/3" />
        </div>
      ),
      ssr: true
    }
  )
};

/**
 * 预加载函数
 */
export const preloadComponent = async (
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  try {
    await importFn();
  } catch (error) {
    console.warn('Failed to preload component:', error);
  }
};

/**
 * 批量预加载组件
 */
export const preloadComponents = async (
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
) => {
  try {
    await Promise.all(importFns.map(fn => preloadComponent(fn)));
  } catch (error) {
    console.warn('Failed to preload some components:', error);
  }
};

/**
 * 基于路由的智能预加载
 */
export const preloadRouteComponents = async (route: string) => {
  const preloadMap: Record<string, Array<() => Promise<any>>> = {
    '/': [
      () => import('@/components/gallery/GalleryGrid'),
      () => import('@/components/ui/SearchInput')
    ],
    '/gallery': [
      () => import('@/components/gallery/GalleryGrid'),
      () => import('@/components/gallery/MediaModal'),
      () => import('@/components/gallery/FilterBar')
    ],
    '/search': [
      () => import('@/components/ui/SearchInput'),
      () => import('@/components/gallery/GalleryGrid')
    ]
  };

  const componentsToPreload = preloadMap[route];
  if (componentsToPreload) {
    await preloadComponents(componentsToPreload);
  }
};

/**
 * 基于用户交互的预加载
 */
export const preloadOnInteraction = (
  element: HTMLElement,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  events: string[] = ['mouseenter', 'focus']
) => {
  let preloaded = false;

  const preload = () => {
    if (!preloaded) {
      preloaded = true;
      preloadComponent(importFn);
      
      // 移除事件监听器
      events.forEach(event => {
        element.removeEventListener(event, preload);
      });
    }
  };

  // 添加事件监听器
  events.forEach(event => {
    element.addEventListener(event, preload, { once: true });
  });

  return () => {
    events.forEach(event => {
      element.removeEventListener(event, preload);
    });
  };
};

/**
 * 基于 Intersection Observer 的预加载
 */
export const preloadOnVisible = (
  element: HTMLElement,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined') return () => {};

  let preloaded = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !preloaded) {
          preloaded = true;
          preloadComponent(importFn);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }
  );

  observer.observe(element);

  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
};