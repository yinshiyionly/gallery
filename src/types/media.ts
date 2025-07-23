/**
 * 媒体资源类型定义
 */

/**
 * 媒体资源类型
 */
export type MediaType = 'image' | 'video';

/**
 * 媒体资源元数据
 */
export interface MediaMetadata {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

/**
 * 媒体资源接口
 */
export interface Media {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  type: MediaType;
  tags: string[];
  metadata: MediaMetadata;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * 创建媒体资源的输入数据
 */
export interface CreateMediaInput {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  type: MediaType;
  tags?: string[];
  metadata?: MediaMetadata;
}

/**
 * 更新媒体资源的输入数据
 */
export interface UpdateMediaInput {
  title?: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  type?: MediaType;
  tags?: string[];
  metadata?: MediaMetadata;
  isActive?: boolean;
}

/**
 * 媒体资源分页响应
 */
export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 媒体资源列表响应
 */
export interface MediaListResponse {
  data: Media[];
  pagination: MediaPagination;
}

/**
 * 媒体资源搜索参数
 */
export interface MediaSearchParams {
  query?: string;
  type?: MediaType | 'all';
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}