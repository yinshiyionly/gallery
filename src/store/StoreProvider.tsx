import React, { useEffect, useCallback } from 'react';
import { useThemeStore, initThemeListener } from './useThemeStore';
import { useUIStore } from './uiStore';
import { useMediaStore } from './mediaStore';
import { useSearchStore } from './searchStore';
import { cleanupExpiredStorage } from './utils';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Store Provider 组件
 * 负责初始化所有 store 和设置全局监听器
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { updateResolvedTheme } = useThemeStore();
  const { addNotification } = useUIStore();
  const mediaStore = useMediaStore();
  const searchStore = useSearchStore();

  // 状态同步处理
  const handleStateSync = useCallback(() => {
    // 定期清理过期缓存
    const cleanupInterval = setInterval(() => {
      cleanupExpiredStorage();
      mediaStore.clearCache();
    }, 5 * 60 * 1000); // 每5分钟清理一次

    return () => clearInterval(cleanupInterval);
  }, [mediaStore]);

  // 网络状态监听
  const handleNetworkChange = useCallback(() => {
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        addNotification({
          type: 'success',
          message: '网络连接已恢复',
        });
      } else {
        addNotification({
          type: 'warning',
          message: '网络连接已断开，部分功能可能不可用',
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [addNotification]);

  // 页面可见性变化处理
  const handleVisibilityChange = useCallback(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，刷新数据
        mediaStore.updateLastFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mediaStore]);

  useEffect(() => {
    // 初始化主题监听器
    const cleanupThemeListener = initThemeListener();
    
    // 清理过期的本地存储
    cleanupExpiredStorage();
    
    // 初始化主题
    updateResolvedTheme();

    // 初始化状态同步
    const cleanupStateSync = handleStateSync();
    
    // 初始化网络状态监听
    const cleanupNetworkListener = handleNetworkChange();
    
    // 初始化页面可见性监听
    const cleanupVisibilityListener = handleVisibilityChange();
    
    // 设置全局错误处理
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      addNotification({
        type: 'error',
        message: '应用程序遇到了一个错误，请刷新页面重试',
      });
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      addNotification({
        type: 'error',
        message: '网络请求失败，请检查网络连接',
      });
    };
    
    // 添加全局错误监听器
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // 清理函数
    return () => {
      cleanupThemeListener?.();
      cleanupStateSync();
      cleanupNetworkListener();
      cleanupVisibilityListener();
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [updateResolvedTheme, addNotification, handleStateSync, handleNetworkChange, handleVisibilityChange]);

  return <>{children}</>;
};

/**
 * 用于开发环境的 Store 调试组件
 */
export const StoreDebugger: React.FC = () => {
  const mediaStore = useMediaStore();
  const uiStore = useUIStore();
  const searchStore = useSearchStore();
  const themeStore = useThemeStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Store Debug Info</h3>
      
      <div className="mb-2">
        <strong>Media:</strong> {mediaStore.items.length} items, loading: {mediaStore.loading.toString()}
      </div>
      
      <div className="mb-2">
        <strong>UI:</strong> theme: {uiStore.theme}, layout: {uiStore.galleryLayout}
      </div>
      
      <div className="mb-2">
        <strong>Search:</strong> query: "{searchStore.query}", results: {searchStore.resultCount}
      </div>
      
      <div className="mb-2">
        <strong>Theme:</strong> {themeStore.theme} → {themeStore.resolvedTheme}
      </div>
      
      <button
        onClick={() => {
          console.log('Media Store:', mediaStore);
          console.log('UI Store:', uiStore);
          console.log('Search Store:', searchStore);
          console.log('Theme Store:', themeStore);
        }}
        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
};

// 需要导入这些 store 以避免循环依赖
import { useMediaStore } from './mediaStore';
import { useSearchStore } from './searchStore';