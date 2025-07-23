import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MediaItem, SearchParams } from '@/types';

interface MediaState {
  items: MediaItem[];
  currentItem: MediaItem | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: Partial<SearchParams>;
  
  // Actions
  setItems: (items: MediaItem[]) => void;
  addItems: (items: MediaItem[]) => void;
  setCurrentItem: (item: MediaItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  incrementPage: () => void;
  setFilters: (filters: Partial<SearchParams>) => void;
  reset: () => void;
}

// Initial state
const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  filters: {},
};

// Create store with persistence
export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setItems: (items) => set({ items }),
      addItems: (items) => set((state) => ({ items: [...state.items, ...items] })),
      setCurrentItem: (currentItem) => set({ currentItem }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setHasMore: (hasMore) => set({ hasMore }),
      setPage: (page) => set({ page }),
      incrementPage: () => set((state) => ({ page: state.page + 1 })),
      setFilters: (filters) => set({ filters }),
      reset: () => set(initialState),
    }),
    {
      name: 'media-store',
      partialize: (state) => ({
        filters: state.filters,
        currentItem: state.currentItem,
      }),
    }
  )
);