import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'video';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
}

interface GalleryState {
  // 媒体项目
  items: MediaItem[];
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
  // 搜索查询
  searchQuery: string;
  // 筛选类型
  filterType: 'all' | 'image' | 'video';
  // 筛选标签
  filterTags: string[];
  // 排序方式
  sortBy: 'createdAt' | 'title';
  // 排序顺序
  sortOrder: 'asc' | 'desc';
  // 当前页码
  page: number;
  // 每页数量
  limit: number;
  // 总数量
  total: number;
  // 总页数
  totalPages: number;
  
  // 设置媒体项目
  setItems: (items: MediaItem[]) => void;
  // 设置加载状态
  setLoading: (isLoading: boolean) => void;
  // 设置错误信息
  setError: (error: string | null) => void;
  // 设置搜索查询
  setSearchQuery: (query: string) => void;
  // 设置筛选类型
  setFilterType: (type: 'all' | 'image' | 'video') => void;
  // 添加筛选标签
  addFilterTag: (tag: string) => void;
  // 移除筛选标签
  removeFilterTag: (tag: string) => void;
  // 清空筛选标签
  clearFilterTags: () => void;
  // 设置排序方式
  setSortBy: (sortBy: 'createdAt' | 'title') => void;
  // 设置排序顺序
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  // 设置页码
  setPage: (page: number) => void;
  // 设置每页数量
  setLimit: (limit: number) => void;
  // 设置分页信息
  setPagination: (pagination: { page: number; limit: number; total: number; totalPages: number }) => void;
  // 重置筛选和排序
  resetFilters: () => void;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      // 初始状态
      items: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filterType: 'all',
      filterTags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,

      // Actions
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
      setFilterType: (filterType) => set({ filterType, page: 1 }),
      addFilterTag: (tag) =>
        set((state) => ({
          filterTags: state.filterTags.includes(tag) ? state.filterTags : [...state.filterTags, tag],
          page: 1,
        })),
      removeFilterTag: (tag) =>
        set((state) => ({
          filterTags: state.filterTags.filter((t) => t !== tag),
          page: 1,
        })),
      clearFilterTags: () => set({ filterTags: [], page: 1 }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit, page: 1 }),
      setPagination: ({ page, limit, total, totalPages }) =>
        set({ page, limit, total, totalPages }),
      resetFilters: () =>
        set({
          searchQuery: '',
          filterType: 'all',
          filterTags: [],
          sortBy: 'createdAt',
          sortOrder: 'desc',
          page: 1,
        }),
    }),
    {
      name: 'gallery-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        filterType: state.filterType,
        filterTags: state.filterTags,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        limit: state.limit,
      }),
    }
  )
);