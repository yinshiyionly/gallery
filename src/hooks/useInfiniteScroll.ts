import { useEffect, useState, useRef, RefObject, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  disabled?: boolean;
  rootMargin?: string;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

interface UseInfiniteScrollResult {
  isFetching: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

/**
 * 自定义 Hook 用于实现无限滚动
 * 支持防抖、错误处理和重试机制
 * 
 * @param targetRef 目标元素的引用
 * @param onLoadMore 加载更多数据的回调函数
 * @param options 配置选项
 * @returns 加载状态、错误信息和重试函数
 */
export function useInfiniteScroll(
  targetRef: RefObject<HTMLElement>,
  onLoadMore: () => Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const {
    threshold = 0.1,
    disabled = false,
    rootMargin = '100px',
    debounceMs = 100,
    onError,
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const isLoadingRef = useRef(false);

  // 防抖的加载更多函数
  const debouncedLoadMore = useCallback(async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (isLoadingRef.current || disabled) return;

      try {
        isLoadingRef.current = true;
        setIsFetching(true);
        setError(null);
        
        await onLoadMore();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('加载更多数据时发生错误');
        setError(error);
        
        if (onError) {
          onError(error);
        } else {
          console.error('Infinite scroll error:', error);
        }
      } finally {
        isLoadingRef.current = false;
        setIsFetching(false);
      }
    }, debounceMs);
  }, [onLoadMore, disabled, debounceMs, onError]);

  // 重试函数
  const retry = useCallback(async () => {
    if (error) {
      await debouncedLoadMore();
    }
  }, [error, debouncedLoadMore]);

  // 创建和管理 Intersection Observer
  useEffect(() => {
    // 如果禁用了无限滚动，清理观察器
    if (disabled) {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    const currentTarget = targetRef.current;
    
    // 如果目标元素不存在，不创建观察器
    if (!currentTarget) return;

    // 创建 Intersection Observer
    observer.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // 当目标元素进入视口且不在加载中时，触发加载更多
        if (entry.isIntersecting && !isLoadingRef.current) {
          debouncedLoadMore();
        }
      },
      {
        root: null, // 使用视口作为根元素
        rootMargin,
        threshold,
      }
    );

    // 开始观察目标元素
    observer.current.observe(currentTarget);

    // 清理函数
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [targetRef, debouncedLoadMore, threshold, disabled, rootMargin]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      isLoadingRef.current = false;
    };
  }, []);

  return {
    isFetching,
    error,
    retry,
  };
}