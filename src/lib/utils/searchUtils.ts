import { FilterQuery } from 'mongoose';
import { MediaDocument } from '@/lib/models/Media';

/**
 * 构建媒体搜索查询
 * @param searchQuery 搜索关键词
 * @param type 媒体类型
 * @param tags 标签列表
 * @returns 查询对象
 */
export function buildMediaSearchQuery(
  searchQuery?: string,
  type?: string,
  tags?: string | string[]
): FilterQuery<MediaDocument> {
  const filter: FilterQuery<MediaDocument> = { isActive: true };
  
  // 添加类型筛选
  if (type && ['image', 'video'].includes(type)) {
    filter.type = type;
  }
  
  // 添加标签筛选
  if (tags) {
    const tagList = Array.isArray(tags) 
      ? tags 
      : tags.split(',').map(tag => tag.trim().toLowerCase());
    
    if (tagList.length > 0) {
      filter.tags = { $in: tagList };
    }
  }
  
  // 添加文本搜索
  if (searchQuery && searchQuery.trim()) {
    const searchTerms = searchQuery.trim();
    
    if (searchTerms.length > 2) {
      // 对于较长的查询，使用文本索引
      filter.$text = { $search: searchTerms };
    } else {
      // 对于短查询，使用正则表达式搜索标题、描述和标签
      filter.$or = [
        { title: { $regex: searchTerms, $options: 'i' } },
        { description: { $regex: searchTerms, $options: 'i' } },
        { tags: { $regex: searchTerms, $options: 'i' } }
      ];
    }
  }
  
  return filter;
}

/**
 * 构建搜索排序选项
 * @param sortBy 排序字段
 * @param sortOrder 排序方向
 * @param isTextSearch 是否为文本搜索
 * @returns 排序选项
 */
export function buildSearchSortOptions(
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc',
  isTextSearch: boolean = false
): Record<string, any> {
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  const sortOptions: Record<string, any> = { [sortBy]: sortDirection };
  
  // 如果是文本搜索，添加相关性排序
  if (isTextSearch) {
    sortOptions.score = { $meta: "textScore" };
  }
  
  return sortOptions;
}

/**
 * 解析搜索参数
 * @param query 请求查询参数
 * @returns 解析后的搜索参数
 */
export function parseSearchParams(query: any) {
  return {
    searchQuery: query.q as string || '',
    type: query.type as string,
    tags: query.tags,
    page: parseInt(query.page as string || '1', 10),
    limit: parseInt(query.limit as string || '10', 10),
    sortBy: query.sortBy as string || 'createdAt',
    sortOrder: query.sortOrder as string || 'desc',
    useCache: query.useCache !== 'false',
    suggest: query.suggest === 'true'
  };
}

/**
 * 生成缓存键
 * @param params 查询参数
 * @returns 缓存键
 */
export function generateSearchCacheKey(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}