import { useState, useEffect, useCallback, RefObject } from 'react';

/**
 * Hook for implementing infinite scroll functionality
 */
export const useInfiniteScroll = (
  targetRef: RefObject<HTMLElement>,
  callback: () => Promise<void>,
  options = { threshold: 0.1, disabled: false }
) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isFetching && !options.disabled) {
        setIsFetching(true);
        callback()
          .then(() => {
            setIsFetching(false);
          })
          .catch(() => {
            setIsFetching(false);
          });
      }
    },
    [callback, hasMore, isFetching, options.disabled]
  );

  useEffect(() => {
    const element = targetRef.current;
    if (!element || options.disabled) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: options.threshold,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, handleObserver, options.disabled, options.threshold]);

  return { isFetching, setHasMore };
};