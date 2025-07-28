import { useState, useEffect, useRef, useCallback } from 'react';
import { createLazyLoadObserver, preloadImage } from '@/lib/utils/imageUtils';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseLazyImageReturn {
  ref: React.RefObject<HTMLElement>;
  isLoaded: boolean;
  isInView: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * 懒加载图片的自定义Hook
 * 支持Intersection Observer API和预加载功能
 */
export const useLazyImage = (
  src: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    preload = false,
    fallbackSrc,
    onLoad,
    onError
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadImage = useCallback(async () => {
    if (!src || isLoaded) return;

    try {
      setError(null);
      await preloadImage(src);
      setIsLoaded(true);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load image');
      setError(error);
      onError?.(error);
      
      // 如果有fallback图片，尝试加载
      if (fallbackSrc && fallbackSrc !== src) {
        try {
          await preloadImage(fallbackSrc);
          setIsLoaded(true);
        } catch (fallbackErr) {
          console.warn('Fallback image also failed to load:', fallbackErr);
        }
      }
    }
  }, [src, isLoaded, fallbackSrc, onLoad, onError]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoaded(false);
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    if (preload) {
      loadImage();
      return;
    }

    if (!ref.current) return;

    // 创建Intersection Observer
    observerRef.current = createLazyLoadObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            loadImage();
            // 停止观察已经加载的图片
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

    // 开始观察元素
    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, threshold, rootMargin, preload, loadImage]);

  return {
    ref,
    isLoaded,
    isInView,
    error,
    retry
  };
};