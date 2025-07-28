// 媒体类型
export type MediaType = 'image' | 'video';

// 媒体项目接口
export interface MediaItem {
  _id: string;
  // DDL 必需字段
  code: string;
  origin_url: string;
  hd_url: string;
  
  // 可选字段
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  type: MediaType;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: MediaMetadata;
}

// 媒体元数据接口
export interface MediaMetadata {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  duration?: number; // 视频时长（秒）
}

// API 响应接口
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 分页响应接口
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 搜索参数接口
export interface SearchParams {
  query?: string;
  type?: MediaType | 'all';
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 布局类型
export type LayoutType = 'grid' | 'masonry' | 'list';