import { renderHook, waitFor, act } from '@testing-library/react';
import { useSearch } from '../useSearch';
import { useSearchStore } from '@/store/searchStore';
import { MediaItem, PaginatedResponse } from '@/types';

// Mock the store
jest.mock('@/store/searchStore');

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock data
const mockMediaItem: MediaItem = {
  _id: '1',
  title: 'Test Search Result',
  description: 'Test description',
  url: 'https://example.com/image.jpg',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  type: 'image',
  tags: ['test', 'search'],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  metadata: {
    width: 800,
    height: 600,
    size: 1024,
    format: 'jpg',
  },
};

const mockSearchResponse: PaginatedResponse<MediaItem> = {
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
  setQuery: jest.fn(),
  setIsSearching: jest.fn(),
  addToHistory: jest.fn(),
  clearHistory: jest.fn(),
  setSuggestions: jest.fn(),
  setParams: jest.fn(),
};

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup store mock
    (useSearchStore as jest.Mock).mockReturnValue({
      query: '',
      searchHistory: [],
      suggestions: [],
      isSearching: false,
      params: {
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        type: 'all',
      },
      ...mockStoreActions,
    });

    // Setup fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSearchResponse,
    } as Response);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalResults).toBe(0);
    expect(result.current.hasMore).toBe(false);
  });

  it('should perform search when search function is called', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search?query=test+query')
    );
    expect(result.current.results).toEqual([mockMediaItem]);
    expect(result.current.totalResults).toBe(1);
  });

  it('should debounce search when setQuery is called', async () => {
    const { result } = renderHook(() => useSearch({ debounceMs: 300 }));

    act(() => {
      result.current.setQuery('test');
    });

    // Should not call fetch immediately
    expect(mockFetch).not.toHaveBeenCalled();

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=test')
      );
    });
  });

  it('should cancel previous debounced search when new query is set', async () => {
    const { result } = renderHook(() => useSearch({ debounceMs: 300 }));

    act(() => {
      result.current.setQuery('first');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.setQuery('second');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=second')
      );
    });
  });

  it('should handle search with filters', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test', {
        type: 'image',
        tags: ['sample'],
        sortBy: 'title',
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('query=test&type=image&tags=sample&sortBy=title')
    );
  });

  it('should load more results when loadMore is called', async () => {
    const multiPageResponse: PaginatedResponse<MediaItem> = {
      ...mockSearchResponse,
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

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test');
    });

    expect(result.current.hasMore).toBe(true);

    // Mock second page response
    const secondPageResponse: PaginatedResponse<MediaItem> = {
      ...mockSearchResponse,
      data: [{ ...mockMediaItem, _id: '2', title: 'Second Result' }],
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

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2')
    );
  });

  it('should handle search errors', async () => {
    const errorMessage = 'Search failed';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain(errorMessage);
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('500');
  });

  it('should use cache when available and valid', async () => {
    const { result } = renderHook(() => 
      useSearch({ enableCache: true, cacheTimeout: 5000 })
    );

    // First search
    await act(async () => {
      await result.current.search('test');
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    mockFetch.mockClear();

    // Second search with same query should use cache
    await act(async () => {
      await result.current.search('test');
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([mockMediaItem]);
  });

  it('should clear results when clearResults is called', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test');
    });

    expect(result.current.results).toEqual([mockMediaItem]);

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.totalResults).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should clear search results when empty query is set', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test');
    });

    expect(result.current.results).toEqual([mockMediaItem]);

    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.totalResults).toBe(0);
  });

  it('should abort previous requests when new search is initiated', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.search('first');
    });

    act(() => {
      result.current.search('second');
    });

    expect(abortSpy).toHaveBeenCalled();
    
    abortSpy.mockRestore();
  });

  it('should add successful searches to history', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    expect(mockStoreActions.addToHistory).toHaveBeenCalledWith('test query');
  });

  it('should not add empty queries to history', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(mockStoreActions.addToHistory).not.toHaveBeenCalled();
  });

  it('should handle array parameters correctly', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search('test', {
        tags: ['tag1', 'tag2', 'tag3'],
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('tags=tag1&tags=tag2&tags=tag3')
    );
  });
});