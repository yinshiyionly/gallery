/**
 * Store 配置文件
 * 集中管理所有 store 的配置选项
 */

export interface StoreConfig {
  // 持久化配置
  persistence: {
    enabled: boolean;
    version: string;
    expiryHours: number;
    storagePrefix: string;
  };
  
  // 缓存配置
  cache: {
    maxSize: number;
    ttl: number; // Time to live in milliseconds
    cleanupInterval: number;
  };
  
  // 同步配置
  sync: {
    enabled: boolean;
    interval: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // 调试配置
  debug: {
    enabled: boolean;
    logStateChanges: boolean;
    performanceMonitoring: boolean;
  };
  
  // 通知配置
  notifications: {
    autoRemoveDelay: number;
    maxNotifications: number;
  };
}

export const defaultStoreConfig: StoreConfig = {
  persistence: {
    enabled: true,
    version: '1.0.0',
    expiryHours: 24,
    storagePrefix: 'gallery',
  },
  
  cache: {
    maxSize: 100, // 最大缓存项目数
    ttl: 5 * 60 * 1000, // 5分钟
    cleanupInterval: 60 * 1000, // 1分钟清理一次
  },
  
  sync: {
    enabled: true,
    interval: 30 * 1000, // 30秒同步一次
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logStateChanges: process.env.NODE_ENV === 'development',
    performanceMonitoring: process.env.NODE_ENV === 'development',
  },
  
  notifications: {
    autoRemoveDelay: 5000, // 5秒后自动移除
    maxNotifications: 5,
  },
};

/**
 * 获取 store 配置
 */
export const getStoreConfig = (): StoreConfig => {
  // 可以从环境变量或其他配置源覆盖默认配置
  return {
    ...defaultStoreConfig,
    // 环境变量覆盖示例
    debug: {
      ...defaultStoreConfig.debug,
      enabled: process.env.NEXT_PUBLIC_DEBUG_STORES === 'true' || defaultStoreConfig.debug.enabled,
    },
  };
};

/**
 * Store 名称常量
 */
export const STORE_NAMES = {
  MEDIA: 'media-store',
  SEARCH: 'search-store',
  UI: 'ui-store',
  THEME: 'theme-store',
} as const;

/**
 * 存储键生成器
 */
export const createStorageKey = (storeName: string, version?: string) => {
  const config = getStoreConfig();
  return `${config.persistence.storagePrefix}-${storeName}-v${version || config.persistence.version}`;
};

/**
 * 缓存键生成器
 */
export const createCacheKey = (prefix: string, ...parts: (string | number)[]) => {
  return `${prefix}:${parts.join(':')}`;
};