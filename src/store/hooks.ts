import { useCallback, useMemo, useState, useEffect } from 'react';
import { useMediaStore } from './mediaStore';
import { useSearchStore } from './searchStore';
import { useUIStore } from './uiStore';
import { useThemeStore } from './useThemeStore';
import type { MediaItem, SearchParams } from '@/types';

/**
 * 媒体相关的便捷 hooks
 */
export const useMediaActions = () => {
  const store = useMediaStore();
  
  return useMemo(() => ({
    // 基础操作
    loadItems: store.setItems,
    addItems: store.addItems,
    updateItem: store.updateItem,
    removeItem: store.removeItem,
    
    // 选择操作
    selectItem: store.setCurrentItem,
    toggleSelection: store.toggleSelectedItem,
    clearSelection: store.clearSelection,
    
    // 状态操作
    setLoading: store.setLoading,
    setError: store.setError,
    
    // 分页操作
    nextPage: store.incrementPage,
    resetPagination: store.resetPagination,
    
    // 缓存操作
    clearCache: store.clearCache,
    
    // 重置
    reset: store.reset,
  }), [store]);
};

/**
 * 搜索相关的便捷 hooks
 */
export const useSearchActions = () => {
  const store = useSearchStore();
  
  return useMemo(() => ({
    // 搜索操作
    search: store.setQuery,
    addToHistory: store.addToHistory,
    clearHistory: store.clearHistory,
    
    // 建议操作
    setSuggestions: store.setSuggestions,
    
    // 标签操作
    addRecentTag: store.addRecentTag,
    removeRecentTag: store.removeRecentTag,
    
    // 参数操作
    setParams: store.setParams,
    
    // 状态操作
    setSearching: store.setIsSearching,
    setResultCount: store.setResultCount,
    
    // 重置
    reset: store.resetSearch,
  }), [store]);
};

/**
 * UI 相关的便捷 hooks
 */
export const useUIActions = () => {
  const store = useUIStore();
  
  return useMemo(() => ({
    // 主题操作
    setTheme: store.setTheme,
    
    // 布局操作
    setLayout: store.setGalleryLayout,
    setGridColumns: store.setGridColumns,
    setCardSize: store.setCardSize,
    
    // 模态框操作
    openModal: (content?: Parameters<typeof store.toggleModal>[1]) => store.toggleModal(true, content),
    closeModal: () => store.toggleModal(false),
    
    // 导航操作
    toggleMobileMenu: store.toggleMobileMenu,
    toggleSearchBar: store.toggleSearchBar,
    toggleSidebar: store.toggleSidebar,
    
    // 偏好设置
    setAnimations: store.setAnimationsEnabled,
    setAutoPlay: store.setAutoPlayVideos,
    setShowInfo: store.setShowImageInfo,
    setKeyboardShortcuts: store.setEnableKeyboardShortcuts,
    
    // 加载状态
    setLoading: store.setPageLoading,
    
    // 通知操作
    notify: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    
    // 重置
    reset: store.resetUI,
  }), [store]);
};

/**
 * 组合的搜索和媒体 hook
 */
export const useMediaSearch = () => {
  const mediaStore = useMediaStore();
  const searchStore = useSearchStore();
  const mediaActions = useMediaActions();
  const searchActions = useSearchActions();
  
  const performSearch = useCallback(async (params: Partial<SearchParams>) => {
    searchActions.setSearching(true);
    mediaActions.setLoading(true);
    
    try {
      // 更新搜索参数
      searchActions.setParams(params);
      
      // 如果有查询词，添加到历史记录
      if (params.query) {
        searchActions.addToHistory(params.query);
      }
      
      // 构建查询参数
      const searchParams = new URLSearchParams();
      Object.entries({ ...searchStore.params, ...params }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      // 发起搜索请求
      const response = await fetch(`/api/search?${searchParams}`);
      const data = await response.json();
      
      if (data.success) {
        // 如果是第一页，替换数据；否则追加数据
        if (params.page === 1) {
          mediaActions.loadItems(data.data);
        } else {
          mediaActions.addItems(data.data);
        }
        
        // 更新分页信息
        mediaStore.setPagination(data.pagination);
        
        // 更新搜索结果数量
        searchActions.setResultCount(data.pagination.total);
      } else {
        throw new Error(data.message || '搜索失败');
      }
    } catch (error) {
      console.error('Search error:', error);
      mediaActions.setError(error instanceof Error ? error.message : '搜索失败');
    } finally {
      searchActions.setSearching(false);
      mediaActions.setLoading(false);
    }
  }, [mediaStore, searchStore, mediaActions, searchActions]);
  
  return {
    // 状态
    isSearching: searchStore.isSearching,
    query: searchStore.query,
    results: mediaStore.items,
    resultCount: searchStore.resultCount,
    hasMore: mediaStore.pagination.hasMore,
    
    // 操作
    search: performSearch,
    clearSearch: () => {
      searchActions.reset();
      mediaActions.reset();
    },
    
    // 便捷方法
    searchByQuery: (query: string) => performSearch({ query, page: 1 }),
    searchByType: (type: SearchParams['type']) => performSearch({ type, page: 1 }),
    searchByTag: (tag: string) => performSearch({ tags: [tag], page: 1 }),
    loadMore: () => performSearch({ page: mediaStore.pagination.page + 1 }),
  };
};

/**
 * 主题相关的便捷 hook
 */
export const useTheme = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  
  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    setTheme,
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  };
};

/**
 * 通知相关的便捷 hook
 */
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore();
  
  const notify = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    addNotification({ message, type });
  }, [addNotification]);
  
  return {
    notifications,
    notify,
    success: (message: string) => notify(message, 'success'),
    error: (message: string) => notify(message, 'error'),
    warning: (message: string) => notify(message, 'warning'),
    info: (message: string) => notify(message, 'info'),
    remove: removeNotification,
    clear: clearNotifications,
  };
};

/**
 * 状态持久化相关的便捷 hook
 */
export const usePersistence = () => {
  const mediaStore = useMediaStore();
  const searchStore = useSearchStore();
  const uiStore = useUIStore();
  const themeStore = useThemeStore();

  const exportState = useCallback(() => {
    return {
      media: {
        currentItem: mediaStore.currentItem,
        pagination: mediaStore.pagination,
      },
      search: {
        searchHistory: searchStore.searchHistory,
        recentTags: searchStore.recentTags,
        params: searchStore.params,
      },
      ui: {
        theme: uiStore.theme,
        galleryLayout: uiStore.galleryLayout,
        gridColumns: uiStore.gridColumns,
        cardSize: uiStore.cardSize,
        animationsEnabled: uiStore.animationsEnabled,
        autoPlayVideos: uiStore.autoPlayVideos,
        showImageInfo: uiStore.showImageInfo,
        enableKeyboardShortcuts: uiStore.enableKeyboardShortcuts,
      },
      theme: {
        theme: themeStore.theme,
      },
    };
  }, [mediaStore, searchStore, uiStore, themeStore]);

  const importState = useCallback((state: ReturnType<typeof exportState>) => {
    if (state.media) {
      if (state.media.currentItem) mediaStore.setCurrentItem(state.media.currentItem);
      if (state.media.pagination) mediaStore.setPagination(state.media.pagination);
    }
    
    if (state.search) {
      if (state.search.params) searchStore.setParams(state.search.params);
    }
    
    if (state.ui) {
      if (state.ui.theme) uiStore.setTheme(state.ui.theme);
      if (state.ui.galleryLayout) uiStore.setGalleryLayout(state.ui.galleryLayout);
      if (state.ui.gridColumns) uiStore.setGridColumns(state.ui.gridColumns);
      if (state.ui.cardSize) uiStore.setCardSize(state.ui.cardSize);
      if (state.ui.animationsEnabled !== undefined) uiStore.setAnimationsEnabled(state.ui.animationsEnabled);
      if (state.ui.autoPlayVideos !== undefined) uiStore.setAutoPlayVideos(state.ui.autoPlayVideos);
      if (state.ui.showImageInfo !== undefined) uiStore.setShowImageInfo(state.ui.showImageInfo);
      if (state.ui.enableKeyboardShortcuts !== undefined) uiStore.setEnableKeyboardShortcuts(state.ui.enableKeyboardShortcuts);
    }
    
    if (state.theme) {
      if (state.theme.theme) themeStore.setTheme(state.theme.theme);
    }
  }, [mediaStore, searchStore, uiStore, themeStore]);

  const resetAllStores = useCallback(() => {
    mediaStore.reset();
    searchStore.resetSearch();
    uiStore.resetUI();
    themeStore.setTheme('system');
  }, [mediaStore, searchStore, uiStore, themeStore]);

  return {
    exportState,
    importState,
    resetAllStores,
  };
};

/**
 * 状态同步相关的便捷 hook
 */
export const useStoreSync = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncStores = useCallback(async () => {
    if (!isOnline) return false;

    try {
      // 这里可以实现与服务器的状态同步逻辑
      setLastSync(Date.now());
      return true;
    } catch (error) {
      console.error('Store sync failed:', error);
      return false;
    }
  }, [isOnline]);

  return {
    isOnline,
    lastSync,
    syncStores,
    needsSync: Date.now() - lastSync > 5 * 60 * 1000, // 5分钟未同步
  };
};