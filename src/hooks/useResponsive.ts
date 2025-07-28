import { useState, useEffect, useCallback } from 'react';

// 响应式断点定义
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * 响应式设计Hook
 * 提供当前屏幕尺寸、断点和设备类型信息
 */
export const useResponsive = () => {
  const [state, setState] = useState<ResponsiveState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    breakpoint: 'xl',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape'
  });

  // 获取当前断点
  const getCurrentBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, []);

  // 判断设备类型
  const getDeviceType = useCallback((width: number) => {
    const isMobile = width < breakpoints.md;
    const isTablet = width >= breakpoints.md && width < breakpoints.lg;
    const isDesktop = width >= breakpoints.lg;
    
    return { isMobile, isTablet, isDesktop };
  }, []);

  // 获取屏幕方向
  const getOrientation = useCallback((width: number, height: number): 'portrait' | 'landscape' => {
    return width > height ? 'landscape' : 'portrait';
  }, []);

  // 更新状态
  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width);
    const deviceType = getDeviceType(width);
    const orientation = getOrientation(width, height);

    setState({
      width,
      height,
      breakpoint,
      ...deviceType,
      orientation
    });
  }, [getCurrentBreakpoint, getDeviceType, getOrientation]);

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 防抖处理
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 150);
    };

    // 初始化
    updateState();

    // 添加事件监听
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateState]);

  // 检查是否匹配指定断点
  const matches = useCallback((breakpoint: Breakpoint) => {
    return state.width >= breakpoints[breakpoint];
  }, [state.width]);

  // 检查是否在指定断点范围内
  const between = useCallback((min: Breakpoint, max: Breakpoint) => {
    return state.width >= breakpoints[min] && state.width < breakpoints[max];
  }, [state.width]);

  // 获取响应式值
  const getResponsiveValue = useCallback(<T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
    const sortedBreakpoints = Object.keys(breakpoints).sort(
      (a, b) => breakpoints[b as Breakpoint] - breakpoints[a as Breakpoint]
    ) as Breakpoint[];

    for (const bp of sortedBreakpoints) {
      if (state.width >= breakpoints[bp] && values[bp] !== undefined) {
        return values[bp];
      }
    }

    return undefined;
  }, [state.width]);

  // 生成响应式类名
  const getResponsiveClasses = useCallback((classes: Partial<Record<Breakpoint, string>>) => {
    const classNames: string[] = [];
    
    Object.entries(classes).forEach(([bp, className]) => {
      if (className && matches(bp as Breakpoint)) {
        classNames.push(className);
      }
    });

    return classNames.join(' ');
  }, [matches]);

  return {
    ...state,
    matches,
    between,
    getResponsiveValue,
    getResponsiveClasses
  };
};

/**
 * 媒体查询Hook
 * 监听指定的媒体查询条件
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * 预定义的媒体查询Hook
 */
export const usePreferredColorScheme = () => {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
};

export const usePrefersReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * 响应式网格Hook
 * 根据屏幕尺寸自动调整网格列数
 */
export const useResponsiveGrid = (options: {
  minItemWidth?: number;
  maxColumns?: number;
  gap?: number;
} = {}) => {
  const { minItemWidth = 250, maxColumns = 6, gap = 16 } = options;
  const { width } = useResponsive();

  const columns = Math.min(
    Math.floor((width + gap) / (minItemWidth + gap)),
    maxColumns
  );

  return {
    columns: Math.max(1, columns),
    itemWidth: Math.floor((width - gap * (columns - 1)) / columns)
  };
};