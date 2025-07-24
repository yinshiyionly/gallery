import { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaStore } from '@/store/mediaStore';
import { MediaItem, SearchParams, PaginatedResponse } from '@/types';

interface UseMediaResult {
  media: MediaItem[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalItems: number;
  currentPage: number;
  retry: () => Promise<void>;
}

interface UseMediaOptions {
  initialPage?: number;
  limit?: number;
  featured?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * 自定义 Hook 用于获取媒体数据
 * 支持缓存、错误处理、重试机制和状态管理集成
 */
export function useMedia(
  params: Partial<SearchParams> = {},
  options: UseMediaOptions = {}
): UseMediaResult {
  const {
    initialPage = 1,
    limit = 12,
    featured = false,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5分钟缓存
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  // Zustand store
  const {
    items: storeMedia,
    loading: storeLoading,
    error: storeError,
    pagination,
    setLoading,
    setError,
    setResponse,
    appendResponse,
    getCacheData,
    setCacheData,
    updateLastFetch,
    lastFetch,
  } = useMediaStore();

  // Local state for this hook instance
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLocalLoading] = useState<boolean>(true);
  const [error, setLocalError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Refs for cleanup and retry logic
  const abortController = useRef<AbortController>();
  const retryCount = useRef<number>(0);

  // 生成缓存键
  const generateCacheKey = useCallback(() => {
    return JSON.stringify({ params, featured, limit });
  }, [params, featured, limit]);

  // 检查缓存是否有效
  const isCacheValid = useCallback(() => {
    return enableCache && Date.now() - lastFetch < cacheTimeout;
  }, [enableCache, lastFetch, cacheTimeout]);

  // 构建查询参数
  const buildQueryParams = useCallback((page: number) => {
    const queryParams = new URLSearchParams();
    
    // 添加分页参数
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // 添加其他搜索参数
    if (params.query) queryParams.append('query', params.query);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // 添加标签参数
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    
    // 如果是精选内容，添加特殊标签
    if (featured) {
      queryParams.append('tags', 'featured');
    }
    
    return queryParams.toString();
  }, [limit, params, featured]);

  // 延迟函数用于重试
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 获取媒体数据（带重试机制）
  const fetchMediaWithRetry = useCallback(async (
    page: number,
    append: boolean = false,
    attempt: number = 1
  ): Promise<void> => {
    try {
      // 取消之前的请求
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setLocalLoading(true);
      setLocalError(null);
      setLoading(true);
      setError(null);

      // 检查缓存（仅对第一页且非追加模式）
      if (page === 1 && !append && enableCache) {
        const cacheKey = generateCacheKey();
        const cachedData = getCacheData(cacheKey);
        
        if (cachedData && isCacheValid()) {
          setMedia(cachedData);
          setLocalLoading(false);
          setLoading(false);
          return;
        }
      }

      const queryParams = buildQueryParams(page);
      const response = await fetch(`/api/media?${queryParams}`, {
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`获取媒体数据失败: ${response.status} ${response.statusText}`);
      }

      const data: PaginatedResponse<MediaItem> = await response.json();

      if (!data.success) {
        throw new Error(data.message || '获取媒体数据失败');
      }

      // 更新本地状态
      const newMedia = append ? [...media, ...data.data] : data.data;
      setMedia(newMedia);
      setTotalItems(data.pagination.total);
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setCurrentPage(data.pagination.page);

      // 更新全局状态
      if (append) {
        appendResponse(data);
      } else {
        setResponse(data);
      }

      // 缓存数据（仅对第一页）
      if (page === 1 && !append && enableCache) {
        const cacheKey = generateCacheKey();
        setCacheData(cacheKey, data.data);
        updateLastFetch();
      }

      // 重置重试计数
      retryCount.current = 0;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // 忽略取消的请求
      }

      const errorMessage = err instanceof Error ? err.message : '获取媒体数据失败';
      const error = new Error(errorMessage);

      // 重试逻辑
      if (attempt < retryAttempts) {
        console.warn(`获取媒体数据失败，正在重试 (${attempt}/${retryAttempts}):`, errorMessage);
        await delay(retryDelay * attempt); // 指数退避
        return fetchMediaWithRetry(page, append, attempt + 1);
      }

      // 所有重试都失败了
      setLocalError(error);
      setError(errorMessage);
      console.error('获取媒体数据失败，已达到最大重试次数:', err);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [
    media,
    enableCache,
    generateCacheKey,
    isCacheValid,
    getCacheData,
    buildQueryParams,
    retryAttempts,
    retryDelay,
    setLoading,
    setError,
    setResponse,
    appendResponse,
    setCacheData,
    updateLastFetch,
  ]);

  // 获取媒体数据
  const fetchMedia = useCallback(async (page: number, append: boolean = false) => {
    await fetchMediaWithRetry(page, append);
  }, [fetchMediaWithRetry]);

  // 加载更多媒体
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchMedia(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchMedia]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setMedia([]);
    setCurrentPage(initialPage);
    await fetchMedia(initialPage, false);
  }, [initialPage, fetchMedia]);

  // 重试当前请求
  const retry = useCallback(async () => {
    await fetchMedia(currentPage, false);
  }, [currentPage, fetchMedia]);

  // 初始加载
  useEffect(() => {
    setMedia([]);
    fetchMedia(initialPage, false);
  }, [initialPage, fetchMedia]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    media,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalItems,
    currentPage,
    retry,
  };
}