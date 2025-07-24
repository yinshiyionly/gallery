import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchParams } from '@/types';

interface SearchState {
  // 搜索查询
  query: string;
  // 搜索历史
  searchHistory: string[];
  // 搜索建议
  suggestions: string[];
  // 是否正在搜索
  isSearching: boolean;
  // 搜索结果数量
  resultCount: number;
  // 最近搜索的标签
  recentTags: string[];
  // 搜索参数
  params: SearchParams;
  
  // Actions
  setQuery: (query: string) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  setSuggestions: (suggestions: string[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setResultCount: (count: number) => void;
  addRecentTag: (tag: string) => void;
  removeRecentTag: (tag: string) => void;
  setParams: (params: Partial<SearchParams>) => void;
  resetSearch: () => void;
}

const initialState = {
  query: '',
  searchHistory: [],
  suggestions: [],
  isSearching: false,
  resultCount: 0,
  recentTags: [],
  params: {
    page: 1,
    limit: 12,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
    type: 'all' as const,
  },
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setQuery: (query) => set({ query }),
      
      addToHistory: (query) => {
        if (!query.trim()) return;
        
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 10);
          return { searchHistory: newHistory };
        });
      },
      
      clearHistory: () => set({ searchHistory: [] }),
      
      setSuggestions: (suggestions) => set({ suggestions }),
      
      setIsSearching: (isSearching) => set({ isSearching }),
      
      setResultCount: (resultCount) => set({ resultCount }),
      
      addRecentTag: (tag) => {
        set((state) => {
          const newRecentTags = [tag, ...state.recentTags.filter(t => t !== tag)].slice(0, 20);
          return { recentTags: newRecentTags };
        });
      },
      
      removeRecentTag: (tag) => {
        set((state) => ({
          recentTags: state.recentTags.filter(t => t !== tag)
        }));
      },
      
      setParams: (newParams) => {
        set((state) => ({
          params: { ...state.params, ...newParams }
        }));
      },
      
      resetSearch: () => set(initialState),
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentTags: state.recentTags,
        params: {
          limit: state.params.limit,
          sortBy: state.params.sortBy,
          sortOrder: state.params.sortOrder,
        },
      }),
    }
  )
);