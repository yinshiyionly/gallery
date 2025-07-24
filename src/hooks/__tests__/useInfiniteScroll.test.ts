import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useInfiniteScroll } from '../useInfiniteScroll';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

beforeAll(() => {
  global.IntersectionObserver = mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback,
  }));
});

describe('useInfiniteScroll', () => {
  let mockOnLoadMore: jest.Mock;
  let mockTargetRef: React.RefObject<HTMLElement>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockOnLoadMore = jest.fn().mockResolvedValue(undefined);
    
    // Create a mock ref with a current element
    mockTargetRef = {
      current: document.createElement('div'),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should create IntersectionObserver on mount', () => {
    renderHook(() => useInfiniteScroll(mockTargetRef, mockOnLoadMore));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      })
    );
    expect(mockObserve).toHaveBeenCalledWith(mockTargetRef.current);
  });

  it('should not create observer when disabled', () => {
    renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore, { disabled: true })
    );

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not create observer when target ref is null', () => {
    const nullRef = { current: null };
    
    renderHook(() => useInfiniteScroll(nullRef, mockOnLoadMore));

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should call onLoadMore when target intersects', async () => {
    const { result } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore)
    );

    // Get the callback function passed to IntersectionObserver
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    observerCallback([mockEntry]);

    // Wait for debounce
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(true);
    });

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });
  });

  it('should not call onLoadMore when not intersecting', async () => {
    renderHook(() => useInfiniteScroll(mockTargetRef, mockOnLoadMore));

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: false,
      target: mockTargetRef.current,
    };

    observerCallback([mockEntry]);

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });
  });

  it('should not call onLoadMore when already loading', async () => {
    const slowLoadMore = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    const { result } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, slowLoadMore)
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    // First intersection
    observerCallback([mockEntry]);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(true);
    });

    // Second intersection while still loading
    observerCallback([mockEntry]);
    jest.advanceTimersByTime(100);

    expect(slowLoadMore).toHaveBeenCalledTimes(1);
  });

  it('should handle onLoadMore errors', async () => {
    const errorMessage = 'Load more failed';
    const failingLoadMore = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, failingLoadMore)
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    observerCallback([mockEntry]);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('should call onError callback when provided', async () => {
    const errorMessage = 'Load more failed';
    const failingLoadMore = jest.fn().mockRejectedValue(new Error(errorMessage));
    const onError = jest.fn();
    
    renderHook(() => 
      useInfiniteScroll(mockTargetRef, failingLoadMore, { onError })
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    observerCallback([mockEntry]);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('should retry after error', async () => {
    const errorMessage = 'Load more failed';
    const failingLoadMore = jest.fn()
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce(undefined);
    
    const { result } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, failingLoadMore)
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    observerCallback([mockEntry]);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });

    // Retry
    await result.current.retry();

    expect(failingLoadMore).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('should use custom threshold and rootMargin', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '200px',
    };

    renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore, options)
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '200px',
      })
    );
  });

  it('should debounce multiple rapid intersections', async () => {
    renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore, { debounceMs: 200 })
    );

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    const mockEntry = {
      isIntersecting: true,
      target: mockTargetRef.current,
    };

    // Rapid intersections
    observerCallback([mockEntry]);
    jest.advanceTimersByTime(50);
    observerCallback([mockEntry]);
    jest.advanceTimersByTime(50);
    observerCallback([mockEntry]);
    jest.advanceTimersByTime(200);

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore)
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should disconnect observer when disabled changes to true', () => {
    const { rerender } = renderHook(
      ({ disabled }) => useInfiniteScroll(mockTargetRef, mockOnLoadMore, { disabled }),
      { initialProps: { disabled: false } }
    );

    expect(mockObserve).toHaveBeenCalled();

    rerender({ disabled: true });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should recreate observer when target ref changes', () => {
    const newTargetRef = { current: document.createElement('div') };
    
    const { rerender } = renderHook(
      ({ targetRef }) => useInfiniteScroll(targetRef, mockOnLoadMore),
      { initialProps: { targetRef: mockTargetRef } }
    );

    expect(mockObserve).toHaveBeenCalledWith(mockTargetRef.current);

    mockObserve.mockClear();
    mockDisconnect.mockClear();

    rerender({ targetRef: newTargetRef });

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(newTargetRef.current);
  });
});