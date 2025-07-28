import { useEffect, useCallback, useRef } from 'react';
import { MediaItem } from '@/types';
import { imagePreloader, preloadNextPageImages } from '@/lib/utils/imagePreloader';

interface UseImagePreloadingOptions {
  preloadCount?: number;
  preloadNext?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * 图片预加载管理Hook
 * 用于在画廊中智能预加载图片
 */
export const useImagePreloading = (
  mediaItems: MediaItem[],
  options: UseImagePreloadingOptions = {}
) => {
  const {
    preloadCount = 6,
    preloadNext = true,
    priority = 'medium'
  } = options;

  const preloadedIndexes = useRef(new Set<number>());
  const lastPreloadedIndex = useRef(-1);

  /**
   * 预加载指定范围的图片
   */
  const preloadRange = useCallback(async (startIndex: number, count: number) => {
    const endIndex = Math.min(startIndex + count, mediaItems.length);
    const urlsToPreload: string[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (!preloadedIndexes.current.has(i) && mediaItems[i]) {
        urlsToPreload.push(mediaItems[i].thumbnailUrl);
        if (mediaItems[i].url !== mediaItems[i].thumbnailUrl) {
          urlsToPreload.push(mediaItems[i].url);
        }
        preloadedIndexes.current.add(i);
      }
    }

    if (urlsToPreload.length > 0) {
      try {
        await imagePreloader.preloadBatch(urlsToPreload, { priority });
        lastPreloadedIndex.current = Math.max(lastPreloadedIndex.current, endIndex - 1);
      } catch (error) {
        console.warn('Failed to preload some images:', error);
      }
    }
  }, [mediaItems, priority]);

  /**
   * 预加载首屏图片
   */
  const preloadInitial = useCallback(() => {
    if (mediaItems.length > 0) {
      preloadRange(0, preloadCount);
    }
  }, [mediaItems, preloadCount, preloadRange]);

  /**
   * 预加载下一批图片
   */
  const preloadNext = useCallback((currentIndex: number) => {
    const nextStartIndex = Math.max(lastPreloadedIndex.current + 1, currentIndex);
    preloadRange(nextStartIndex, preloadCount);
  }, [preloadCount, preloadRange]);

  /**
   * 基于当前可见项目预加载
   */
  const preloadBasedOnVisible = useCallback((visibleIndexes: number[]) => {
    if (visibleIndexes.length === 0) return;

    const maxVisibleIndex = Math.max(...visibleIndexes);
    const nextStartIndex = maxVisibleIndex + 1;
    
    // 预加载接下来的图片
    if (nextStartIndex < mediaItems.length) {
      preloadRange(nextStartIndex, Math.min(preloadCount, mediaItems.length - nextStartIndex));
    }
  }, [mediaItems.length, preloadCount, preloadRange]);

  /**
   * 清理预加载缓存
   */
  const clearPreloadCache = useCallback(() => {
    imagePreloader.clear();
    preloadedIndexes.current.clear();
    lastPreloadedIndex.current = -1;
  }, []);

  /**
   * 获取预加载统计信息
   */
  const getPreloadStats = useCallback(() => {
    return {
      ...imagePreloader.getStats(),
      preloadedCount: preloadedIndexes.current.size,
      lastPreloadedIndex: lastPreloadedIndex.current
    };
  }, []);

  // 初始化时预加载首屏图片
  useEffect(() => {
    preloadInitial();
  }, [preloadInitial]);

  // 当媒体项目变化时，清理并重新预加载
  useEffect(() => {
    return () => {
      // 组件卸载时清理
      clearPreloadCache();
    };
  }, [clearPreloadCache]);

  return {
    preloadNext,
    preloadBasedOnVisible,
    clearPreloadCache,
    getPreloadStats,
    preloadRange
  };
};