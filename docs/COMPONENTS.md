# 组件文档

本文档详细介绍了多端画廊项目中所有可复用组件的使用方法和 API。

## 📋 目录

- [概述](#概述)
- [基础 UI 组件](#基础-ui-组件)
- [画廊组件](#画廊组件)
- [布局组件](#布局组件)
- [开发工具组件](#开发工具组件)
- [自定义 Hooks](#自定义-hooks)
- [使用指南](#使用指南)

## 🌟 概述

### 设计原则

- **可复用性**: 所有组件都设计为高度可复用
- **类型安全**: 使用 TypeScript 提供完整的类型定义
- **响应式**: 支持多种屏幕尺寸和设备
- **无障碍**: 遵循 WCAG 2.1 无障碍标准
- **性能优化**: 使用 React.memo 和懒加载优化性能

### 组件分类

```
src/components/
├── ui/           # 基础 UI 组件 (按钮、输入框、模态框等)
├── gallery/      # 画廊相关组件 (媒体卡片、网格布局等)
├── layout/       # 布局组件 (头部、底部、导航等)
└── dev/          # 开发工具组件 (性能监控、调试工具等)
```

## 🎨 基础 UI 组件

### Button 按钮

通用按钮组件，支持多种样式和状态。

#### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}
```

#### 使用示例

```tsx
import { Button } from '@/components/ui/Button';
import { SearchIcon } from '@heroicons/react/24/outline';

// 基础按钮
<Button variant="primary" size="md">
  点击我
</Button>

// 带图标的按钮
<Button 
  variant="outline" 
  icon={<SearchIcon className="w-4 h-4" />}
  iconPosition="left"
>
  搜索
</Button>

// 加载状态按钮
<Button loading disabled>
  提交中...
</Button>

// 全宽按钮
<Button variant="primary" fullWidth>
  全宽按钮
</Button>
```

### Modal 模态框

可定制的模态框组件，支持多种尺寸和动画效果。

#### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

#### 使用示例

```tsx
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        打开模态框
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="模态框标题"
        size="md"
      >
        <p>这是模态框的内容</p>
      </Modal>
    </>
  );
}
```

### SearchInput 搜索输入框

带有搜索功能的输入框组件，支持实时搜索和建议。

#### Props

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
  loading?: boolean;
  debounceMs?: number;
  className?: string;
}
```

#### 使用示例

```tsx
import { SearchInput } from '@/components/ui/SearchInput';
import { useState } from 'react';

function SearchComponent() {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions] = useState(['风景', '摄影', '自然']);

  return (
    <SearchInput
      value={searchValue}
      onChange={setSearchValue}
      onSearch={(value) => console.log('搜索:', value)}
      placeholder="搜索媒体资源..."
      suggestions={suggestions}
      showSuggestions={true}
      debounceMs={300}
    />
  );
}
```

### Loading 加载组件

多种样式的加载指示器组件。

#### Props

```typescript
interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}
```

#### 使用示例

```tsx
import { Loading } from '@/components/ui/Loading';

// 旋转加载器
<Loading variant="spinner" size="md" />

// 带文字的加载器
<Loading variant="dots" text="加载中..." />

// 骨架屏加载
<Loading variant="skeleton" />
```

### OptimizedImage 优化图片

基于 Next.js Image 的优化图片组件，支持懒加载和多种优化。

#### Props

```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
```

#### 使用示例

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// 基础用法
<OptimizedImage
  src="/images/example.jpg"
  alt="示例图片"
  width={400}
  height={300}
/>

// 响应式图片
<OptimizedImage
  src="/images/hero.jpg"
  alt="英雄图片"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>

// 带占位符的图片
<OptimizedImage
  src="/images/photo.jpg"
  alt="照片"
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## 🖼️ 画廊组件

### MediaCard 媒体卡片

展示单个媒体资源的卡片组件。

#### Props

```typescript
interface MediaCardProps {
  media: MediaItem;
  layout?: 'grid' | 'list' | 'masonry';
  showDetails?: boolean;
  showTags?: boolean;
  onClick?: (media: MediaItem) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { MediaCard } from '@/components/gallery/MediaCard';

const mediaItem = {
  _id: '1',
  title: '美丽的日落',
  url: '/images/sunset.jpg',
  thumbnailUrl: '/images/sunset_thumb.jpg',
  type: 'image',
  tags: ['风景', '日落'],
  createdAt: new Date(),
  updatedAt: new Date()
};

<MediaCard
  media={mediaItem}
  layout="grid"
  showDetails={true}
  showTags={true}
  onClick={(media) => console.log('点击媒体:', media)}
  onTagClick={(tag) => console.log('点击标签:', tag)}
/>
```

### GalleryGrid 画廊网格

展示媒体资源网格布局的组件。

#### Props

```typescript
interface GalleryGridProps {
  media: MediaItem[];
  layout?: 'grid' | 'masonry' | 'list';
  columns?: number;
  gap?: number;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMediaClick?: (media: MediaItem) => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <GalleryGrid
      media={media}
      layout="masonry"
      columns={3}
      gap={16}
      loading={loading}
      hasMore={true}
      onLoadMore={() => {
        // 加载更多逻辑
      }}
      onMediaClick={(media) => {
        // 处理媒体点击
      }}
    />
  );
}
```

### MediaModal 媒体模态框

展示媒体详情的全屏模态框组件。

#### Props

```typescript
interface MediaModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  showDetails?: boolean;
  relatedMedia?: MediaItem[];
  className?: string;
}
```

#### 使用示例

```tsx
import { MediaModal } from '@/components/gallery/MediaModal';

function GalleryComponent() {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* 触发按钮 */}
      <Button onClick={() => setIsModalOpen(true)}>
        查看详情
      </Button>

      {/* 媒体模态框 */}
      <MediaModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPrevious={() => {
          // 切换到上一个媒体
        }}
        onNext={() => {
          // 切换到下一个媒体
        }}
        showNavigation={true}
        showDetails={true}
      />
    </>
  );
}
```

### FilterBar 筛选栏

媒体筛选和排序的工具栏组件。

#### Props

```typescript
interface FilterBarProps {
  filters: {
    type: string;
    tags: string[];
    sortBy: string;
    sortOrder: string;
  };
  availableTags: string[];
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { FilterBar } from '@/components/gallery/FilterBar';

function GalleryPage() {
  const [filters, setFilters] = useState({
    type: 'all',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  return (
    <FilterBar
      filters={filters}
      availableTags={['风景', '摄影', '自然', '城市']}
      onFilterChange={setFilters}
      onReset={() => setFilters({
        type: 'all',
        tags: [],
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })}
    />
  );
}
```

## 🏗️ 布局组件

### Header 头部

应用程序的头部导航组件。

#### Props

```typescript
interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNavigation?: boolean;
  onSearchChange?: (value: string) => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { Header } from '@/components/layout/Header';

<Header
  title="多端画廊"
  showSearch={true}
  showNavigation={true}
  onSearchChange={(value) => {
    // 处理搜索
  }}
/>
```

### Layout 布局容器

应用程序的主要布局容器。

#### Props

```typescript
interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  className?: string;
}
```

#### 使用示例

```tsx
import { Layout } from '@/components/layout/Layout';

function App() {
  return (
    <Layout showHeader={true} showFooter={true}>
      <main>
        {/* 页面内容 */}
      </main>
    </Layout>
  );
}
```

### Navigation 导航

响应式导航菜单组件。

#### Props

```typescript
interface NavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'mobile';
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}
```

#### 使用示例

```tsx
import { Navigation } from '@/components/layout/Navigation';
import { HomeIcon, PhotoIcon } from '@heroicons/react/24/outline';

const navigationItems = [
  {
    label: '首页',
    href: '/',
    icon: <HomeIcon className="w-5 h-5" />
  },
  {
    label: '画廊',
    href: '/gallery',
    icon: <PhotoIcon className="w-5 h-5" />
  }
];

<Navigation
  items={navigationItems}
  currentPath="/gallery"
  orientation="horizontal"
/>
```

## 🛠️ 开发工具组件

### PerformanceMonitor 性能监控

开发环境下的性能监控组件。

#### Props

```typescript
interface PerformanceMonitorProps {
  enabled?: boolean;
  showFPS?: boolean;
  showMemory?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

#### 使用示例

```tsx
import { PerformanceMonitor } from '@/components/dev/PerformanceMonitor';

// 仅在开发环境显示
{process.env.NODE_ENV === 'development' && (
  <PerformanceMonitor
    enabled={true}
    showFPS={true}
    showMemory={true}
    position="top-right"
  />
)}
```

## 🎣 自定义 Hooks

### useMedia 媒体数据

管理媒体数据的 Hook。

```typescript
function useMedia(params?: {
  page?: number;
  limit?: number;
  type?: string;
  tags?: string[];
}) {
  // 返回媒体数据、加载状态、错误信息等
}
```

#### 使用示例

```tsx
import { useMedia } from '@/hooks/useMedia';

function MediaList() {
  const { data, loading, error, refetch } = useMedia({
    page: 1,
    limit: 12,
    type: 'image'
  });

  if (loading) return <Loading />;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {data?.map(media => (
        <MediaCard key={media._id} media={media} />
      ))}
    </div>
  );
}
```

### useSearch 搜索功能

管理搜索功能的 Hook。

```typescript
function useSearch() {
  // 返回搜索方法、结果、建议等
}
```

#### 使用示例

```tsx
import { useSearch } from '@/hooks/useSearch';

function SearchComponent() {
  const {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    search
  } = useSearch();

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={search}
        suggestions={suggestions}
        loading={loading}
      />
      
      {results.map(item => (
        <MediaCard key={item._id} media={item} />
      ))}
    </div>
  );
}
```

### useInfiniteScroll 无限滚动

实现无限滚动加载的 Hook。

```typescript
function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  threshold?: number
) {
  // 返回滚动状态和加载更多的方法
}
```

#### 使用示例

```tsx
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = async () => {
    // 加载更多数据的逻辑
  };

  const { loading } = useInfiniteScroll(fetchMore, hasMore);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      {loading && <Loading />}
    </div>
  );
}
```

## 📖 使用指南

### 组件导入

```tsx
// 单个组件导入
import { Button } from '@/components/ui/Button';
import { MediaCard } from '@/components/gallery/MediaCard';

// 批量导入
import { Button, Modal, Loading } from '@/components/ui';
```

### 样式定制

所有组件都支持通过 `className` prop 进行样式定制：

```tsx
<Button 
  className="bg-blue-500 hover:bg-blue-600 text-white"
  variant="primary"
>
  自定义样式按钮
</Button>
```

### 主题配置

组件支持通过 CSS 变量进行主题定制：

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
}
```

### 响应式设计

所有组件都内置了响应式支持：

```tsx
<GalleryGrid
  columns={4}  // 桌面端4列
  // 在组件内部会自动适配移动端为2列或1列
/>
```

### 无障碍支持

组件遵循 WCAG 2.1 标准：

```tsx
<Button
  aria-label="关闭模态框"
  aria-describedby="modal-description"
>
  ×
</Button>
```

### 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 支持懒加载和代码分割
- 图片组件自动优化

```tsx
// 懒加载组件
const LazyMediaModal = lazy(() => import('@/components/gallery/MediaModal'));

// 使用时
<Suspense fallback={<Loading />}>
  <LazyMediaModal {...props} />
</Suspense>
```

### 测试支持

所有组件都提供了测试工具：

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 🔧 开发指南

### 创建新组件

1. **创建组件文件**
   ```tsx
   // src/components/ui/NewComponent.tsx
   import React from 'react';
   
   interface NewComponentProps {
     // 定义 props 类型
   }
   
   export const NewComponent: React.FC<NewComponentProps> = (props) => {
     return (
       <div>
         {/* 组件内容 */}
       </div>
     );
   };
   ```

2. **添加类型定义**
   ```tsx
   export interface NewComponentProps {
     variant?: 'default' | 'primary';
     size?: 'sm' | 'md' | 'lg';
     children: React.ReactNode;
     className?: string;
   }
   ```

3. **编写测试**
   ```tsx
   // src/components/ui/__tests__/NewComponent.test.tsx
   import { render } from '@testing-library/react';
   import { NewComponent } from '../NewComponent';
   
   describe('NewComponent', () => {
     it('renders correctly', () => {
       // 测试代码
     });
   });
   ```

4. **更新导出**
   ```tsx
   // src/components/ui/index.ts
   export { NewComponent } from './NewComponent';
   export type { NewComponentProps } from './NewComponent';
   ```

### 组件规范

- **命名**: 使用 PascalCase
- **Props**: 使用 TypeScript 接口定义
- **样式**: 使用 Tailwind CSS 类名
- **文档**: 添加 JSDoc 注释
- **测试**: 编写单元测试

### 贡献组件

1. Fork 项目
2. 创建功能分支
3. 开发组件
4. 编写测试和文档
5. 提交 Pull Request

---

**更新日期**: 2023-09-06  
**文档版本**: v1.0.0