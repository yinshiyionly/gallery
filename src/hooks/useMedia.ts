import { useState, useEffect, useCallback } from 'react';
import { useGalleryStore, MediaItem } from '@/store/useGalleryStore';

interface UseMediaOptions {
  initialPage?: number;
  initialLimit?: number;
  initialType?: 'all' | 'image' | 'video';
  initialSortBy?: 'createdAt' | 'title';
  initialSortOrder?: 'asc' | 'desc';
}

interface MediaResponse {
  data: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useMedia({
  initialPage = 1,
  initialLimit = 12,
  initialType = 'all',
  initialSortBy = 'createdAt',
  initialSortOrder = 'desc',
}: UseMediaOptions = {}) {
  const {
    items,
    isLoading,
    error,
    searchQuery,
    filterType,
    filterTags,
    sortBy,
    sortOrder,
    page,
    limit,
    total,
    totalPages,
    setItems,
    setLoading,
    setError,
    setPage,
    setLimit,
    setFilterType,
    setSortBy,
    setSortOrder,
    setPagination,
  } = useGalleryStore();

  // 初始化
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setFilterType(initialType);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [
    initialPage,
    initialLimit,
    initialType,
    initialSortBy,
    initialSortOrder,
    setPage,
    setLimit,
    setFilterType,
    setSortBy,
    setSortOrder,
  ]);

  // 获取媒体数据
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      if (searchQuery) {
        params.append('query', searchQuery);
      }

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      if (filterTags.length > 0) {
        filterTags.forEach((tag) => params.append('tags', tag));
      }

      // 发送请求
      const response = await fetch(`/api/media?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MediaResponse = await response.json();
      
      // 更新状态
      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取媒体数据失败');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    searchQuery,
    filterType,
    filterTags,
    setLoading,
    setError,
    setItems,
    setPagination,
  ]);

  // 当依赖项变化时获取数据
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // 获取单个媒体详情
  const fetchMediaById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/media/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取媒体详情失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // 刷新数据
  const refreshMedia = useCallback(() => {
    fetchMedia();
  }, [fetchMedia]);

  // 下一页
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);

  // 上一页
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  // 跳转到指定页
  const goToPage = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setPage(pageNumber);
      }
    },
    [totalPages, setPage]
  );

  return {
    items,
    isLoading,
    error,
    page,
    limit,
    total,
    totalPages,
    fetchMedia,
    fetchMediaById,
    refreshMedia,
    nextPage,
    prevPage,
    goToPage,
  };
}