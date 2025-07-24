import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';
import type { SearchParams, MediaItem, PaginatedResponse } from '@/types';

interface UseSearchOptions {
  debounceMs?: number;
  cacheTimeout?: number;
  enableCache?: boolean;
}

interface UseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: MediaItem[];
  loading: boolean;
  error: Error | null;
  totalResults: number;
  hasMore: boolean;
  searchHistory: string[];
  suggestions: string[];
  search: (searchQuery?: string, params?: Partial<SearchParams>) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
}

/**
 * 自定义 Hook 用于处理搜索功能
 * 支持实时搜索、缓存、错误处理和搜索历史
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const {
    debounceMs = 300,
    cacheTimeout = 5 * 60 * 1000, // 5分钟缓存
    enableCache = true,
  } = options;

  // Zustand store
  const {
    query,
    setQuery: setStoreQuery,
    searchHistory,
    suggestions,
    isSearching,
    setIsSearching,
    addToHistory,
    clearHistory,
    setSuggestions,
    params,
    setParams,
  } = useSearchStore();

  // Local state
  const [results, setResults] = useState<MediaItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Cache management
  const cache = useRef<Map<string, { data: MediaItem[]; timestamp: number; pagination: any }>>(new Map());
  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // 生成缓存键
  const generateCacheKey = useCallback((searchQuery: string, searchParams: Partial<SearchParams>) => {
    return JSON.stringify({ query: searchQuery, ...searchParams });
  }, []);

  // 检查缓存是否有效
  const isCacheValid = useCallback((timestamp: number) => {
    return enableCache && Date.now() - timestamp < cacheTimeout;
  }, [enableCache, cacheTimeout]);

  // 执行搜索请求
  const performSearch = useCallback(async (
    searchQuery: string,
    searchParams: Partial<SearchParams> = {},
    append: boolean = false
  ) => {
    try {
      // 取消之前的请求
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setError(null);
      setIsSearching(true);

      const cacheKey = generateCacheKey(searchQuery, searchParams);
      
      // 检查缓存
      if (enableCache && !append) {
        const cached = cache.current.get(cacheKey);
        if (cached && isCacheValid(cached.timestamp)) {
          setResults(cached.data);
          setTotalResults(cached.pagination.total);
          setHasMore(cached.pagination.page < cached.pagination.totalPages);
          setCurrentPage(cached.pagination.page);
          setIsSearching(false);
          return;
        }
      }

      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.append('query', searchQuery.trim());
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/search?${queryParams.toString()}`, {
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status} ${response.statusText}`);
      }

      const data: PaginatedResponse<MediaItem> = await response.json();

      if (!data.success) {
        throw new Error(data.message || '搜索失败');
      }

      // 更新结果
      const newResults = append ? [...results, ...data.data] : data.data;
      setResults(newResults);
      setTotalResults(data.pagination.total);
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setCurrentPage(data.pagination.page);

      // 缓存结果
      if (enableCache && !append) {
        cache.current.set(cacheKey, {
          data: data.data,
          timestamp: Date.now(),
          pagination: data.pagination,
        });
      }

      // 添加到搜索历史
      if (searchQuery.trim()) {
        addToHistory(searchQuery.trim());
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // 忽略取消的请求
      }
      
      const errorMessage = err instanceof Error ? err.message : '搜索过程中发生未知错误';
      setError(new Error(errorMessage));
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [results, enableCache, generateCacheKey, isCacheValid, setIsSearching, addToHistory]);

  // 防抖搜索
  const debouncedSearch = useCallback((
    searchQuery: string,
    searchParams: Partial<SearchParams> = {}
  ) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery, { ...params, ...searchParams, page: 1 });
    }, debounceMs);
  }, [performSearch, params, debounceMs]);

  // 主搜索函数
  const search = useCallback(async (
    searchQuery?: string,
    searchParams: Partial<SearchParams> = {}
  ) => {
    const finalQuery = searchQuery !== undefined ? searchQuery : query;
    const finalParams = { ...params, ...searchParams, page: 1 };
    
    setParams(finalParams);
    setCurrentPage(1);
    
    await performSearch(finalQuery, finalParams);
  }, [query, params, performSearch, setParams]);

  // 加载更多结果
  const loadMore = useCallback(async () => {
    if (!hasMore || isSearching) return;
    
    const nextPage = currentPage + 1;
    const searchParams = { ...params, page: nextPage };
    
    await performSearch(query, searchParams, true);
  }, [hasMore, isSearching, currentPage, params, query, performSearch]);

  // 设置查询并触发搜索
  const setQuery = useCallback((newQuery: string) => {
    setStoreQuery(newQuery);
    if (newQuery.trim()) {
      debouncedSearch(newQuery);
    } else {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      setError(null);
    }
  }, [setStoreQuery, debouncedSearch]);

  // 清除搜索结果
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setHasMore(false);
    setError(null);
    setCurrentPage(1);
    
    // 取消进行中的请求
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading: isSearching,
    error,
    totalResults,
    hasMore,
    searchHistory,
    suggestions,
    search,
    loadMore,
    clearResults,
    clearHistory,
  };
}