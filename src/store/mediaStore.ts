import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MediaItem, PaginatedResponse } from '@/types';

interface MediaState {
  // 媒体数据
  items: MediaItem[];
  currentItem: MediaItem | null;
  selectedItems: MediaItem[];
  
  // 加载状态
  loading: boolean;
  error: string | null;
  
  // 分页信息
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  
  // 缓存管理
  cache: Map<string, MediaItem[]>;
  lastFetch: number;
  
  // Actions
  setItems: (items: MediaItem[]) => void;
  addItems: (items: MediaItem[]) => void;
  prependItems: (items: MediaItem[]) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  removeItem: (id: string) => void;
  setCurrentItem: (item: MediaItem | null) => void;
  setSelectedItems: (items: MediaItem[]) => void;
  toggleSelectedItem: (item: MediaItem) => void;
  clearSelection: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setPagination: (pagination: Partial<MediaState['pagination']>) => void;
  incrementPage: () => void;
  resetPagination: () => void;
  
  // 缓存管理
  setCacheData: (key: string, data: MediaItem[]) => void;
  getCacheData: (key: string) => MediaItem[] | undefined;
  clearCache: () => void;
  updateLastFetch: () => void;
  
  // 批量操作
  setResponse: (response: PaginatedResponse<MediaItem>) => void;
  appendResponse: (response: PaginatedResponse<MediaItem>) => void;
  
  reset: () => void;
}

// Initial state
const initialState = {
  items: [],
  currentItem: null,
  selectedItems: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: true,
  },
  cache: new Map(),
  lastFetch: 0,
};

// Create store with persistence
export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setItems: (items) => set({ items }),
      
      addItems: (items) => set((state) => ({ 
        items: [...state.items, ...items] 
      })),
      
      prependItems: (items) => set((state) => ({ 
        items: [...items, ...state.items] 
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => 
          item._id === id ? { ...item, ...updates } : item
        ),
        currentItem: state.currentItem?._id === id 
          ? { ...state.currentItem, ...updates } 
          : state.currentItem,
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item._id !== id),
        selectedItems: state.selectedItems.filter(item => item._id !== id),
        currentItem: state.currentItem?._id === id ? null : state.currentItem,
      })),
      
      setCurrentItem: (currentItem) => set({ currentItem }),
      
      setSelectedItems: (selectedItems) => set({ selectedItems }),
      
      toggleSelectedItem: (item) => set((state) => {
        const isSelected = state.selectedItems.some(selected => selected._id === item._id);
        return {
          selectedItems: isSelected
            ? state.selectedItems.filter(selected => selected._id !== item._id)
            : [...state.selectedItems, item]
        };
      }),
      
      clearSelection: () => set({ selectedItems: [] }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      incrementPage: () => set((state) => ({
        pagination: { ...state.pagination, page: state.pagination.page + 1 }
      })),
      
      resetPagination: () => set((state) => ({
        pagination: { ...initialState.pagination }
      })),
      
      setCacheData: (key, data) => set((state) => {
        const newCache = new Map(state.cache);
        newCache.set(key, data);
        return { cache: newCache };
      }),
      
      getCacheData: (key) => get().cache.get(key),
      
      clearCache: () => set({ cache: new Map() }),
      
      updateLastFetch: () => set({ lastFetch: Date.now() }),
      
      setResponse: (response) => set((state) => ({
        items: response.data,
        pagination: {
          ...state.pagination,
          ...response.pagination,
          hasMore: response.pagination.page < response.pagination.totalPages,
        },
        error: null,
      })),
      
      appendResponse: (response) => set((state) => ({
        items: [...state.items, ...response.data],
        pagination: {
          ...state.pagination,
          ...response.pagination,
          hasMore: response.pagination.page < response.pagination.totalPages,
        },
        error: null,
      })),
      
      reset: () => set({
        ...initialState,
        cache: new Map(),
      }),
    }),
    {
      name: 'media-store',
      partialize: (state) => ({
        currentItem: state.currentItem,
        pagination: {
          limit: state.pagination.limit,
        },
      }),
      // 不持久化 cache 和 items，因为它们可能很大且会过期
    }
  )
);