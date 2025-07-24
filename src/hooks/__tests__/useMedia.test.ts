import { renderHook, waitFor } from '@testing-library/react';
import { useMedia } from '../useMedia';
import { useMediaStore } from '@/store/mediaStore';
import { MediaItem, PaginatedResponse } from '@/types';

// Mock the store
jest.mock('@/store/mediaStore');

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock data
const mockMediaItem: MediaItem = {
  _id: '1',
  title: 'Test Image',
  description: 'Test description',
  url: 'https://example.com/image.jpg',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  type: 'image',
  tags: ['test', 'sample'],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  metadata: {
    width: 800,
    height: 600,
    size: 1024,
    format: 'jpg',
  },
};

const mockResponse: PaginatedResponse<MediaItem> = {
  success: true,
  data: [mockMediaItem],
  pagination: {
    page: 1,
    limit: 12,
    total: 1,
    totalPages: 1,
  },
};

// Mock store functions
const mockStoreActions = {
  setLoading: jest.fn(),
  setError: jest.fn(),
  setResponse: jest.fn(),
  appendResponse: jest.fn(),
  getCacheData: jest.fn(),
  setCacheData: jest.fn(),
  updateLastFetch: jest.fn(),
};

describe('useMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup store mock
    (useMediaStore as jest.Mock).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: true,
      },
      lastFetch: 0,
      ...mockStoreActions,
    });

    // Setup fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch media data on mount', async () => {
    const { result } = renderHook(() => useMedia());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/media?page=1&limit=12')
    );
    expect(result.current.media).toEqual([mockMediaItem]);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle search parameters', async () => {
    const params = {
      query: 'test',
      type: 'image' as const,
      tags: ['sample'],
    };

    renderHook(() => useMedia(params));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=test&type=image&tags=sample')
      );
    });
  });

  it('should handle featured content', async () => {
    renderHook(() => useMedia({}, { featured: true }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('tags=featured')
      );
    });
  });

  it('should load more data when loadMore is called', async () => {
    const multiPageResponse: PaginatedResponse<MediaItem> = {
      ...mockResponse,
      pagination: {
        page: 1,
        limit: 12,
        total: 24,
        totalPages: 2,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => multiPageResponse,
    } as Response);

    const { result } = renderHook(() => useMedia());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);

    // Mock second page response
    const secondPageResponse: PaginatedResponse<MediaItem> = {
      ...mockResponse,
      data: [{ ...mockMediaItem, _id: '2', title: 'Second Image' }],
      pagination: {
        page: 2,
        limit: 12,
        total: 24,
        totalPages: 2,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondPageResponse,
    } as Response);

    await result.current.loadMore();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2')
    );
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useMedia());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain(errorMessage);
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => useMedia());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('404');
  });

  it('should handle API error responses', async () => {
    const errorResponse = {
      success: false,
      message: 'API Error',
      data: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => errorResponse,
    } as Response);

    const { result } = renderHook(() => useMedia());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API Error');
  });

  it('should use cache when available and valid', async () => {
    const cachedData = [mockMediaItem];
    
    mockStoreActions.getCacheData.mockReturnValue(cachedData);
    (useMediaStore as jest.Mock).mockReturnValue({
      ...mockStoreActions,
      items: [],
      loading: false,
      error: null,
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasMore: true },
      lastFetch: Date.now() - 1000, // Recent fetch
    });

    const { result } = renderHook(() => 
      useMedia({}, { enableCache: true, cacheTimeout: 5000 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.media).toEqual(cachedData);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should refresh data when refresh is called', async () => {
    const { result } = renderHook(() => useMedia());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockClear();

    await result.current.refresh();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1')
    );
  });

  it('should retry failed requests', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

    const { result } = renderHook(() => 
      useMedia({}, { retryAttempts: 2, retryDelay: 100 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.current.media).toEqual([mockMediaItem]);
    expect(result.current.error).toBeNull();
  });

  it('should abort previous requests when new ones are made', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    
    const { rerender } = renderHook(
      ({ params }) => useMedia(params),
      { initialProps: { params: { query: 'first' } } }
    );

    // Change params to trigger new request
    rerender({ params: { query: 'second' } });

    expect(abortSpy).toHaveBeenCalled();
    
    abortSpy.mockRestore();
  });
});