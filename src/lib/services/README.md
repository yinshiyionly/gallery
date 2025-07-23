# 数据库操作工具函数

本目录包含用于操作数据库的服务类和工具函数。

## MediaService

`MediaService` 类提供了对媒体资源的完整 CRUD 操作支持，以及搜索和分页功能。

### 基本用法

```typescript
import { MediaService } from '../lib/services/mediaService';

// 创建新媒体
const newMedia = await MediaService.create({
  title: '示例媒体',
  url: 'https://example.com/media.jpg',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  type: 'image',
  tags: ['示例', '测试'],
  metadata: {
    width: 1920,
    height: 1080
  },
  isActive: true
});

// 查询媒体列表（带分页）
const mediaList = await MediaService.findAll(
  { type: 'image' }, // 过滤条件
  { page: 1, limit: 10, sort: { createdAt: -1 } } // 分页和排序选项
);

// 搜索媒体
const searchResults = await MediaService.search({
  query: '示例',
  type: 'image',
  tags: ['测试'],
  page: 1,
  limit: 10
});

// 更新媒体
const updatedMedia = await MediaService.update(mediaId, {
  title: '更新后的标题',
  tags: ['示例', '测试', '更新']
});

// 软删除（将 isActive 设置为 false）
await MediaService.softDelete(mediaId);

// 恢复软删除的媒体
await MediaService.restore(mediaId);

// 永久删除媒体
await MediaService.delete(mediaId);
```

### 批量操作

```typescript
// 批量创建媒体
const mediaItems = [
  {
    title: '媒体1',
    url: 'https://example.com/media1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    type: 'image',
    tags: ['示例'],
    metadata: {},
    isActive: true
  },
  {
    title: '媒体2',
    url: 'https://example.com/media2.jpg',
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    type: 'image',
    tags: ['示例'],
    metadata: {},
    isActive: true
  }
];

const createdItems = await MediaService.bulkCreate(mediaItems);

// 批量更新媒体
const updates = [
  { id: 'id1', data: { title: '更新的媒体1' } },
  { id: 'id2', data: { title: '更新的媒体2' } }
];

const updateResult = await MediaService.bulkUpdate(updates);
```

## 数据库工具函数

`dbUtils.ts` 文件提供了一系列通用的数据库操作辅助函数：

- `safeDbOperation`: 安全执行数据库操作，处理常见错误
- `isValidObjectId`: 验证 MongoDB ObjectId 是否有效
- `buildTextSearchQuery`: 构建文本搜索查询
- `buildPaginationParams`: 构建分页参数
- `paginatedQuery`: 执行带分页的查询
- `bulkOperation`: 批量执行操作并收集结果

### 示例用法

```typescript
import { safeDbOperation, paginatedQuery } from '../lib/utils/dbUtils';
import Media from '../lib/models/Media';

// 安全执行数据库操作
const result = await safeDbOperation(async () => {
  return await Media.findById(id);
});

// 执行分页查询
const paginatedResult = await paginatedQuery(
  Media,
  { type: 'image' },
  1, // 页码
  10, // 每页数量
  { createdAt: -1 } // 排序
);
```

## 错误处理

服务类和工具函数包含完善的错误处理机制：

- 验证错误（400 Bad Request）
- ID 格式错误（400 Bad Request）
- 重复键错误（409 Conflict）
- 数据库连接错误（500 Internal Server Error）

所有错误都会被转换为带有状态码的 `DbError` 实例，便于在 API 层处理。