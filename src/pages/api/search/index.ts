import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase } from '@/lib/middleware/with-database';
import { Media } from '@/lib/models/Media';
import { buildPaginationParams, safeDbOperation } from '@/lib/utils/dbUtils';
import { sendMethodNotAllowed, sendPaginatedSuccess, sendError } from '@/lib/utils/apiResponse';
import { FilterQuery } from 'mongoose';
import { MediaDocument } from '@/lib/models/Media';
import { buildMediaSearchQuery, buildSearchSortOptions, parseSearchParams, generateSearchCacheKey } from '@/lib/utils/searchUtils';

// 缓存存储
interface CacheItem {
  data: any;
  expiry: number;
  hitCount: number;
}

// 缓存配置
const cache: Record<string, CacheItem> = {};
const CACHE_TTL_BASE = 60 * 1000; // 基础缓存有效期：60秒
const CACHE_TTL_MAX = 5 * 60 * 1000; // 最大缓存有效期：5分钟
const CACHE_SIZE_LIMIT = 100; // 最大缓存条目数
const POPULAR_QUERY_THRESHOLD = 5; // 热门查询阈值

// 使用 searchUtils.ts 中的 generateSearchCacheKey 函数替代

/**
 * 清理过期缓存
 */
function cleanupCache(): void {
  const now = Date.now();
  const cacheEntries = Object.entries(cache);
  
  // 删除过期缓存
  cacheEntries.forEach(([key, item]) => {
    if (item.expiry < now) {
      delete cache[key];
    }
  });
  
  // 如果缓存条目数超过限制，删除最不常用的条目
  if (Object.keys(cache).length > CACHE_SIZE_LIMIT) {
    const sortedEntries = cacheEntries
      .sort(([, itemA], [, itemB]) => itemA.hitCount - itemB.hitCount)
      .slice(0, Object.keys(cache).length - CACHE_SIZE_LIMIT);
    
    sortedEntries.forEach(([key]) => {
      delete cache[key];
    });
  }
}

/**
 * 搜索 API 路由处理函数
 * 
 * GET: 根据条件搜索媒体资源
 * 
 * @param req Next.js 请求对象
 * @param res Next.js 响应对象
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    // 定期清理缓存
    cleanupCache();
    
    // 解析查询参数
    const params = parseSearchParams(req.query);
    const {
      searchQuery,
      type,
      tags,
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      useCache,
      suggest: suggestMode
    } = params;

    // 生成缓存键
    const cacheKey = generateSearchCacheKey(params);
    
    // 检查缓存
    if (useCache && cache[cacheKey] && cache[cacheKey].expiry > Date.now()) {
      console.log('Using cached search results');
      
      // 增加缓存命中计数
      cache[cacheKey].hitCount += 1;
      
      // 对于热门查询，延长缓存时间
      if (cache[cacheKey].hitCount > POPULAR_QUERY_THRESHOLD) {
        cache[cacheKey].expiry = Date.now() + CACHE_TTL_MAX;
      }
      
      return sendPaginatedSuccess(
        res, 
        cache[cacheKey].data.data, 
        cache[cacheKey].data.pagination
      );
    }
    
    // 对于搜索建议请求，限制返回数量
    const effectiveLimit = suggestMode ? Math.min(limitNum, 5) : limitNum;
    
    // 检查是否为文本搜索
    const isTextSearch = searchQuery && searchQuery.trim().length > 0;
    
    // 构建排序对象
    const sortOptions = buildSearchSortOptions(sortBy, sortOrder, isTextSearch && searchQuery.length > 2);
    
    // 构建查询条件
    const filter = buildMediaSearchQuery(searchQuery, type, tags);
    }

    // 执行查询
    const result = await safeDbOperation(async () => {
      const { skip, limit: validLimit, page: validPage } = buildPaginationParams(
        pageNum, 
        suggestMode ? effectiveLimit : limitNum
      );
      
      // 构建查询
      let query = Media.find(filter);
      
      // 如果使用文本搜索，添加相关性评分字段
      if (isTextSearch && searchQuery.length > 2) {
        query = query.select({ score: { $meta: "textScore" } });
      }
      
      // 应用排序、分页并执行查询
      const [data, total] = await Promise.all([
        query
          .sort(sortOptions)
          .skip(skip)
          .limit(validLimit)
          .lean()
          .exec(),
        Media.countDocuments(filter)
      ]);
      
      // 如果是搜索建议模式，简化返回的数据
      const processedData = suggestMode 
        ? data.map(item => ({
            _id: item._id,
            title: item.title,
            type: item.type,
            thumbnailUrl: item.thumbnailUrl
          }))
        : data;
      
      return {
        data: processedData,
        pagination: {
          page: validPage,
          limit: validLimit,
          total,
          totalPages: Math.ceil(total / validLimit)
        }
      };
    });

    // 缓存结果
    if (useCache === 'true') {
      // 计算缓存有效期 - 对于实时搜索建议使用较短的缓存时间
      const cacheTTL = suggestMode ? CACHE_TTL_BASE / 2 : CACHE_TTL_BASE;
      
      cache[cacheKey] = {
        data: result,
        expiry: Date.now() + cacheTTL,
        hitCount: 1
      };
    }

    // 设置缓存控制头
    res.setHeader('Cache-Control', 'private, max-age=60');
    
    // 返回成功响应
    return sendPaginatedSuccess(res, result.data, result.pagination);
  } catch (error: any) {
    console.error('Error in search API route:', error);
    
    // 返回错误响应
    return sendError(
      res,
      error.message || '搜索媒体失败',
      error.statusCode || 500
    );
  }
}

// 使用数据库中间件包装处理函数
export default withDatabase(handler);