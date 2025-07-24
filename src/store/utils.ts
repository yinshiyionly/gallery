import { StateCreator } from 'zustand';

/**
 * 创建一个重置中间件，为 store 添加重置功能
 */
export const createResetSlice = <T>(initialState: T) => (
  set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void
) => ({
  reset: () => set(initialState),
});

/**
 * 创建一个日志中间件，用于调试 store 状态变化
 */
export const logger = <T>(
  f: StateCreator<T, [], [], T>,
  name?: string
): StateCreator<T, [], [], T> => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🏪 ${name || 'Store'} Update`);
      console.log('Previous State:', get());
    }
    set(...a);
    if (process.env.NODE_ENV === 'development') {
      console.log('New State:', get());
      console.groupEnd();
    }
  };
  
  return f(loggedSet, get, store);
};

/**
 * 创建一个错误处理中间件
 */
export const errorHandler = <T>(
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> => (set, get, store) => {
  const errorHandledSet: typeof set = (...a) => {
    try {
      set(...a);
    } catch (error) {
      console.error('Store update error:', error);
      // 可以在这里添加错误报告逻辑
    }
  };
  
  return f(errorHandledSet, get, store);
};

/**
 * 创建一个性能监控中间件
 */
export const performanceMonitor = <T>(
  f: StateCreator<T, [], [], T>,
  name?: string
): StateCreator<T, [], [], T> => (set, get, store) => {
  const monitoredSet: typeof set = (...a) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      set(...a);
      const end = performance.now();
      
      if (end - start > 10) { // 只记录超过 10ms 的更新
        console.warn(`⚠️ Slow store update in ${name}: ${(end - start).toFixed(2)}ms`);
      }
    } else {
      set(...a);
    }
  };
  
  return f(monitoredSet, get, store);
};

/**
 * 创建一个去重中间件，防止相同状态的重复更新
 */
export const deduplicator = <T>(
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> => (set, get, store) => {
  const deduplicatedSet: typeof set = (partial) => {
    const currentState = get();
    
    if (typeof partial === 'function') {
      const newState = (partial as (state: T) => T | Partial<T>)(currentState);
      
      // 简单的浅比较
      if (typeof newState === 'object' && newState !== null) {
        const hasChanges = Object.keys(newState).some(
          key => (newState as any)[key] !== (currentState as any)[key]
        );
        
        if (hasChanges) {
          set(partial);
        }
      } else {
        set(partial);
      }
    } else {
      // 简单的浅比较
      if (typeof partial === 'object' && partial !== null) {
        const hasChanges = Object.keys(partial).some(
          key => (partial as any)[key] !== (currentState as any)[key]
        );
        
        if (hasChanges) {
          set(partial);
        }
      } else {
        set(partial);
      }
    }
  };
  
  return f(deduplicatedSet, get, store);
};

/**
 * 存储键生成器
 */
export const generateStorageKey = (storeName: string, version = '1') => {
  return `gallery-${storeName}-v${version}`;
};

/**
 * 清理过期的本地存储数据
 */
export const cleanupExpiredStorage = () => {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  const galleryKeys = keys.filter(key => key.startsWith('gallery-'));
  
  galleryKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      
      // 如果数据有过期时间且已过期，则删除
      if (data.expiry && Date.now() > data.expiry) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      // 如果解析失败，删除损坏的数据
      localStorage.removeItem(key);
    }
  });
};

/**
 * 创建状态同步中间件
 * 用于在多个标签页之间同步状态
 */
export const createSyncMiddleware = <T>(
  storeName: string
) => (
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> => (set, get, store) => {
  const syncedSet: typeof set = (...a) => {
    set(...a);
    
    // 广播状态变化到其他标签页
    if (typeof window !== 'undefined') {
      const state = get();
      window.localStorage.setItem(
        `${storeName}-sync`,
        JSON.stringify({ state, timestamp: Date.now() })
      );
      
      // 触发 storage 事件
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${storeName}-sync`,
        newValue: JSON.stringify({ state, timestamp: Date.now() }),
      }));
    }
  };
  
  // 监听其他标签页的状态变化
  if (typeof window !== 'undefined') {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${storeName}-sync` && e.newValue) {
        try {
          const { state } = JSON.parse(e.newValue);
          set(state);
        } catch (error) {
          console.error('Failed to sync state:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 清理监听器
    store.destroy = () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
  
  return f(syncedSet, get, store);
};

/**
 * 创建状态持久化中间件，支持过期时间
 */
export const createPersistWithExpiry = <T>(
  name: string,
  expiryHours = 24
) => (
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> => (set, get, store) => {
  const persistedSet: typeof set = (...a) => {
    set(...a);
    
    if (typeof window !== 'undefined') {
      const state = get();
      const expiry = Date.now() + (expiryHours * 60 * 60 * 1000);
      
      localStorage.setItem(name, JSON.stringify({
        state,
        expiry,
        version: '1'
      }));
    }
  };
  
  // 初始化时从本地存储恢复状态
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(name);
      if (stored) {
        const { state, expiry } = JSON.parse(stored);
        
        if (Date.now() < expiry) {
          set(state);
        } else {
          localStorage.removeItem(name);
        }
      }
    } catch (error) {
      console.error('Failed to restore persisted state:', error);
      localStorage.removeItem(name);
    }
  }
  
  return f(persistedSet, get, store);
};

/**
 * 创建状态版本管理中间件
 */
export const createVersionedStore = <T>(
  currentVersion: string
) => (
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> => (set, get, store) => {
  const versionedSet: typeof set = (...a) => {
    set(...a);
    
    // 在状态中添加版本信息
    const state = get() as T & { _version?: string };
    if (typeof state === 'object' && state !== null) {
      (state as any)._version = currentVersion;
    }
  };
  
  return f(versionedSet, get, store);
};

/**
 * 获取所有 store 的状态（用于调试）
 */
export const getAllStoreStates = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('getAllStoreStates should only be used in development');
    return;
  }
  
  // 这里可以导入所有 store 并返回它们的状态
  // 由于循环依赖的问题，这个函数应该在需要时动态导入 store
  return {
    media: 'Use useMediaStore.getState()',
    ui: 'Use useUIStore.getState()',
    search: 'Use useSearchStore.getState()',
    theme: 'Use useThemeStore.getState()',
  };
};