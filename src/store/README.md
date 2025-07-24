# Store 状态管理

本项目使用 Zustand 进行状态管理，提供了完整的状态管理解决方案，包括媒体数据、搜索状态、UI 状态和主题管理。

## 架构概览

```
src/store/
├── index.ts              # 主入口文件，导出所有 store
├── mediaStore.ts         # 媒体数据状态管理
├── searchStore.ts        # 搜索状态管理
├── uiStore.ts           # UI 状态管理
├── useThemeStore.ts     # 主题状态管理
├── hooks.ts             # 便捷的 hooks
├── utils.ts             # 工具函数和中间件
├── StoreProvider.tsx    # Store 提供者组件
├── __tests__/           # 测试文件
└── README.md           # 文档
```

## 核心 Store

### 1. Media Store (`mediaStore.ts`)

管理媒体数据、分页、缓存等状态。

```typescript
import { useMediaStore } from '@/store';

const MyComponent = () => {
  const { 
    items, 
    loading, 
    currentItem, 
    setItems, 
    setCurrentItem 
  } = useMediaStore();
  
  // 使用状态...
};
```

**主要功能：**
- 媒体项目管理（增删改查）
- 当前选中项目管理
- 多选功能
- 分页信息管理
- 缓存管理
- 加载状态和错误处理

### 2. Search Store (`searchStore.ts`)

管理搜索相关的状态。

```typescript
import { useSearchStore } from '@/store';

const SearchComponent = () => {
  const { 
    query, 
    searchHistory, 
    isSearching,
    setQuery,
    addToHistory 
  } = useSearchStore();
  
  // 使用搜索状态...
};
```

**主要功能：**
- 搜索查询管理
- 搜索历史记录
- 搜索建议
- 最近使用的标签
- 搜索参数管理

### 3. UI Store (`uiStore.ts`)

管理 UI 相关的状态。

```typescript
import { useUIStore } from '@/store';

const UIComponent = () => {
  const { 
    theme, 
    galleryLayout, 
    isModalOpen,
    notifications,
    toggleModal,
    addNotification 
  } = useUIStore();
  
  // 使用 UI 状态...
};
```

**主要功能：**
- 主题设置
- 布局配置
- 模态框状态
- 导航状态
- 用户偏好设置
- 通知系统

### 4. Theme Store (`useThemeStore.ts`)

专门管理主题相关的状态。

```typescript
import { useThemeStore, initThemeListener } from '@/store';

const ThemeComponent = () => {
  const { 
    theme, 
    resolvedTheme, 
    setTheme 
  } = useThemeStore();
  
  // 初始化主题监听器
  useEffect(() => {
    const cleanup = initThemeListener();
    return cleanup;
  }, []);
  
  // 使用主题状态...
};
```

## 便捷 Hooks

### useMediaActions

提供媒体操作的便捷方法：

```typescript
import { useMediaActions } from '@/store';

const MediaComponent = () => {
  const { 
    loadItems, 
    selectItem, 
    toggleSelection,
    setLoading 
  } = useMediaActions();
  
  // 使用便捷操作...
};
```

### useMediaSearch

组合搜索和媒体功能：

```typescript
import { useMediaSearch } from '@/store';

const SearchComponent = () => {
  const { 
    search, 
    results, 
    isSearching,
    searchByQuery,
    loadMore 
  } = useMediaSearch();
  
  const handleSearch = (query: string) => {
    searchByQuery(query);
  };
  
  // 使用组合功能...
};
```

### useNotifications

便捷的通知管理：

```typescript
import { useNotifications } from '@/store';

const NotificationComponent = () => {
  const { 
    notifications, 
    success, 
    error, 
    warning,
    remove 
  } = useNotifications();
  
  const handleSuccess = () => {
    success('操作成功！');
  };
  
  // 使用通知功能...
};
```

## Store Provider

使用 `StoreProvider` 来初始化所有 store：

```typescript
import { StoreProvider } from '@/store';

function App() {
  return (
    <StoreProvider>
      <YourAppContent />
    </StoreProvider>
  );
}
```

## 持久化

所有 store 都支持持久化，会自动保存到 localStorage：

- **Media Store**: 保存当前选中项目和分页设置
- **Search Store**: 保存搜索历史和最近标签
- **UI Store**: 保存主题、布局和用户偏好
- **Theme Store**: 保存主题设置

## 中间件和工具

### 日志中间件

在开发环境中自动记录状态变化：

```typescript
import { logger } from '@/store/utils';

const useMyStore = create(
  logger(
    (set) => ({
      // store 实现
    }),
    'MyStore'
  )
);
```

### 性能监控

监控慢速的状态更新：

```typescript
import { performanceMonitor } from '@/store/utils';

const useMyStore = create(
  performanceMonitor(
    (set) => ({
      // store 实现
    }),
    'MyStore'
  )
);
```

### 去重中间件

防止相同状态的重复更新：

```typescript
import { deduplicator } from '@/store/utils';

const useMyStore = create(
  deduplicator(
    (set) => ({
      // store 实现
    })
  )
);
```

## 最佳实践

### 1. 使用便捷 Hooks

优先使用提供的便捷 hooks，而不是直接使用 store：

```typescript
// ✅ 推荐
const { loadItems, setLoading } = useMediaActions();

// ❌ 不推荐
const { setItems, setLoading } = useMediaStore();
```

### 2. 组合使用

对于复杂的操作，使用组合 hooks：

```typescript
// ✅ 推荐
const { search, loadMore } = useMediaSearch();

// ❌ 不推荐
const mediaStore = useMediaStore();
const searchStore = useSearchStore();
// 手动组合逻辑...
```

### 3. 错误处理

始终处理异步操作的错误：

```typescript
const { search } = useMediaSearch();
const { error } = useNotifications();

const handleSearch = async (query: string) => {
  try {
    await search({ query });
  } catch (err) {
    error('搜索失败，请重试');
  }
};
```

### 4. 性能优化

对于频繁更新的组件，使用选择器来避免不必要的重渲染：

```typescript
// ✅ 推荐 - 只订阅需要的状态
const loading = useMediaStore(state => state.loading);

// ❌ 不推荐 - 订阅整个 store
const { loading } = useMediaStore();
```

## 调试

### 开发环境调试

在开发环境中，可以使用 `StoreDebugger` 组件：

```typescript
import { StoreDebugger } from '@/store';

function App() {
  return (
    <div>
      <YourAppContent />
      {process.env.NODE_ENV === 'development' && <StoreDebugger />}
    </div>
  );
}
```

### 控制台调试

在浏览器控制台中访问 store 状态：

```javascript
// 获取所有 store 状态
window.__ZUSTAND_STORES__ = {
  media: useMediaStore.getState(),
  search: useSearchStore.getState(),
  ui: useUIStore.getState(),
  theme: useThemeStore.getState(),
};
```

## 测试

运行 store 测试：

```bash
npm test src/store/__tests__/
```

测试覆盖了所有 store 的基本功能，确保状态管理的可靠性。