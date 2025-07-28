# API 文档

本文档详细描述了多端画廊项目的所有 API 接口。

## 📋 目录

- [概述](#概述)
- [认证](#认证)
- [错误处理](#错误处理)
- [媒体资源 API](#媒体资源-api)
- [搜索 API](#搜索-api)
- [健康检查 API](#健康检查-api)
- [数据模型](#数据模型)
- [状态码](#状态码)

## 🌟 概述

### 基础信息

- **Base URL**: `https://your-domain.com/api` (生产环境) 或 `http://localhost:3000/api` (开发环境)
- **协议**: HTTPS (生产环境) / HTTP (开发环境)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

所有 API 响应都遵循统一的格式：

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}
```

## 🔐 认证

当前版本暂未实现用户认证，所有 API 接口均为公开访问。

> **注意**: 在生产环境中，建议实现适当的认证和授权机制。

## ❌ 错误处理

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

### 常见错误码

| 错误码 | HTTP 状态码 | 描述 |
|--------|-------------|------|
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `METHOD_NOT_ALLOWED` | 405 | HTTP 方法不被允许 |
| `DATABASE_ERROR` | 500 | 数据库操作失败 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## 🖼️ 媒体资源 API

### 获取媒体列表

获取分页的媒体资源列表，支持搜索和筛选。

```http
GET /api/media
```

#### 查询参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 12 | 每页数量 (1-50) |
| `sortBy` | string | 否 | createdAt | 排序字段 |
| `sortOrder` | string | 否 | desc | 排序方向 (asc/desc) |
| `query` | string | 否 | - | 搜索关键词 |
| `type` | string | 否 | all | 媒体类型 (image/video/all) |
| `tags` | string[] | 否 | - | 标签筛选 |

#### 请求示例

```bash
# 获取第一页媒体列表
curl "https://your-domain.com/api/media?page=1&limit=12"

# 搜索包含 "风景" 的图片
curl "https://your-domain.com/api/media?query=风景&type=image"

# 按标签筛选
curl "https://your-domain.com/api/media?tags=自然&tags=摄影"
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "美丽的日落风景",
      "description": "在海边拍摄的绚烂日落",
      "url": "https://example.com/images/sunset.jpg",
      "thumbnailUrl": "https://example.com/thumbnails/sunset_thumb.jpg",
      "type": "image",
      "tags": ["风景", "日落", "海边"],
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 245760,
        "format": "jpeg"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "totalPages": 13
  }
}
```

### 获取媒体详情

根据 ID 获取单个媒体资源的详细信息和相关推荐。

```http
GET /api/media/{id}
```

#### 路径参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `id` | string | 是 | 媒体资源的 MongoDB ObjectId |

#### 请求示例

```bash
curl "https://your-domain.com/api/media/64f8a1b2c3d4e5f6a7b8c9d0"
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "media": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "美丽的日落风景",
      "description": "在海边拍摄的绚烂日落，展现了大自然的壮美景色。",
      "url": "https://example.com/images/sunset.jpg",
      "thumbnailUrl": "https://example.com/thumbnails/sunset_thumb.jpg",
      "type": "image",
      "tags": ["风景", "日落", "海边", "自然"],
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 245760,
        "format": "jpeg",
        "camera": "Canon EOS R5",
        "lens": "RF 24-70mm f/2.8L IS USM"
      },
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "relatedMedia": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "海边的黄昏",
        "thumbnailUrl": "https://example.com/thumbnails/evening_thumb.jpg",
        "type": "image"
      }
    ]
  }
}
```

## 🔍 搜索 API

### 搜索媒体资源

根据关键词、类型、标签等条件搜索媒体资源。

```http
GET /api/search
```

#### 查询参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `q` | string | 否 | - | 搜索关键词 |
| `type` | string | 否 | all | 媒体类型 (image/video/all) |
| `tags` | string[] | 否 | - | 标签筛选 |
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 12 | 每页数量 |
| `sortBy` | string | 否 | relevance | 排序字段 |
| `sortOrder` | string | 否 | desc | 排序方向 |
| `suggest` | boolean | 否 | false | 是否为搜索建议模式 |
| `cache` | boolean | 否 | true | 是否使用缓存 |

#### 请求示例

```bash
# 全文搜索
curl "https://your-domain.com/api/search?q=风景摄影"

# 搜索建议
curl "https://your-domain.com/api/search?q=风&suggest=true&limit=5"

# 复合搜索
curl "https://your-domain.com/api/search?q=日落&type=image&tags=自然"
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "美丽的日落风景",
      "description": "在海边拍摄的绚烂日落",
      "url": "https://example.com/images/sunset.jpg",
      "thumbnailUrl": "https://example.com/thumbnails/sunset_thumb.jpg",
      "type": "image",
      "tags": ["风景", "日落", "海边"],
      "score": 1.2,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 23,
    "totalPages": 2
  }
}
```

### 获取标签列表

获取系统中所有可用的标签。

```http
GET /api/search/tags
```

#### 查询参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `limit` | number | 否 | 50 | 返回标签数量限制 |
| `popular` | boolean | 否 | false | 是否只返回热门标签 |

#### 请求示例

```bash
# 获取所有标签
curl "https://your-domain.com/api/search/tags"

# 获取热门标签
curl "https://your-domain.com/api/search/tags?popular=true&limit=20"
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "tag": "风景",
      "count": 45,
      "category": "类型"
    },
    {
      "tag": "摄影",
      "count": 38,
      "category": "技术"
    },
    {
      "tag": "自然",
      "count": 32,
      "category": "主题"
    }
  ]
}
```

## 🏥 健康检查 API

### 系统健康检查

检查系统整体健康状态。

```http
GET /api/health
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-09-06T10:30:00.000Z",
    "uptime": 86400,
    "version": "1.0.0",
    "environment": "production"
  }
}
```

### 数据库健康检查

检查数据库连接状态。

```http
GET /api/health/db
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "status": "connected",
    "database": "gallery",
    "collections": {
      "media": 156,
      "users": 0
    },
    "responseTime": 23,
    "lastCheck": "2023-09-06T10:30:00.000Z"
  }
}
```

## 📊 数据模型

### MediaItem 模型

```typescript
interface MediaItem {
  _id: string;                    // MongoDB ObjectId
  title: string;                  // 媒体标题 (必需, 最大200字符)
  description?: string;           // 媒体描述 (可选, 最大1000字符)
  url: string;                   // 媒体文件URL (必需, 有效的HTTP/HTTPS URL)
  thumbnailUrl: string;          // 缩略图URL (必需)
  type: 'image' | 'video';       // 媒体类型 (必需)
  tags: string[];                // 标签数组 (小写)
  metadata: {                    // 元数据 (可选)
    width?: number;              // 宽度 (像素)
    height?: number;             // 高度 (像素)
    size?: number;               // 文件大小 (字节)
    format?: string;             // 文件格式
    duration?: number;           // 视频时长 (秒)
    camera?: string;             // 拍摄设备
    lens?: string;               // 镜头信息
    location?: string;           // 拍摄地点
  };
  isActive: boolean;             // 是否激活 (默认: true)
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

### 分页参数

```typescript
interface PaginationParams {
  page: number;                  // 页码 (从1开始)
  limit: number;                 // 每页数量 (1-50)
  total: number;                 // 总记录数
  totalPages: number;            // 总页数
}
```

### 搜索参数

```typescript
interface SearchParams {
  query?: string;                // 搜索关键词
  type?: 'image' | 'video' | 'all'; // 媒体类型
  tags?: string[];               // 标签筛选
  sortBy?: 'createdAt' | 'title' | 'relevance'; // 排序字段
  sortOrder?: 'asc' | 'desc';    // 排序方向
  page?: number;                 // 页码
  limit?: number;                // 每页数量
}
```

## 📋 状态码

### HTTP 状态码

| 状态码 | 含义 | 描述 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | HTTP 方法不被允许 |
| 500 | Internal Server Error | 服务器内部错误 |

### 业务状态码

| 代码 | 描述 | 解决方案 |
|------|------|----------|
| `INVALID_OBJECT_ID` | 无效的 MongoDB ObjectId | 检查 ID 格式 |
| `MEDIA_NOT_FOUND` | 媒体资源不存在 | 确认资源 ID 正确 |
| `DATABASE_CONNECTION_FAILED` | 数据库连接失败 | 检查数据库配置 |
| `SEARCH_QUERY_TOO_SHORT` | 搜索关键词太短 | 至少输入2个字符 |
| `PAGINATION_LIMIT_EXCEEDED` | 分页限制超出 | 每页最多50条记录 |

## 🔧 使用示例

### JavaScript/TypeScript

```typescript
// 获取媒体列表
async function getMediaList(page = 1, limit = 12) {
  const response = await fetch(`/api/media?page=${page}&limit=${limit}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

// 搜索媒体
async function searchMedia(query: string, type = 'all') {
  const params = new URLSearchParams({
    q: query,
    type: type
  });
  
  const response = await fetch(`/api/search?${params}`);
  const data = await response.json();
  
  return data;
}

// 获取媒体详情
async function getMediaDetail(id: string) {
  const response = await fetch(`/api/media/${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data.data;
}
```

### React Hook 示例

```typescript
import { useState, useEffect } from 'react';

function useMediaList(page = 1, limit = 12) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/media?page=${page}&limit=${limit}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}
```

## 🚀 性能优化

### 缓存策略

- **API 响应缓存**: 搜索结果缓存60秒
- **数据库查询优化**: 使用索引提升查询性能
- **CDN 加速**: 静态资源通过 CDN 分发

### 限流机制

- **API 限流**: 每个 IP 每15分钟最多100次请求
- **搜索限流**: 搜索 API 每分钟最多30次请求

### 监控指标

- **响应时间**: 平均响应时间 < 200ms
- **错误率**: 错误率 < 1%
- **可用性**: 99.9% 可用性保证

## 📞 技术支持

如果在使用 API 过程中遇到问题，请：

1. 查看本文档的相关章节
2. 检查请求参数和格式
3. 查看浏览器开发者工具的网络面板
4. 在 GitHub Issues 中报告问题

---

**更新日期**: 2023-09-06  
**API 版本**: v1.0.0