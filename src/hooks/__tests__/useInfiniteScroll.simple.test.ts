import React from 'react';
import { renderHook, act } from '@testing-library/react';
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
    
    mockOnLoadMore = jest.fn().mockResolvedValue(undefined);
    
    // Create a mock ref with a current element
    mockTargetRef = {
      current: document.createElement('div'),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore)
    );

    expect(result.current.isFetching).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.retry).toBe('function');
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

  it('should use custom options', () => {
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

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => 
      useInfiniteScroll(mockTargetRef, mockOnLoadMore)
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should handle onLoadMore errors and set error state', async () => {
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

    await act(async () => {
      observerCallback([mockEntry]);
      // Wait for the debounce timeout
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
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

    await act(async () => {
      observerCallback([mockEntry]);
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});