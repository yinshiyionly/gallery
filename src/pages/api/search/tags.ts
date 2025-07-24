import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase } from '@/lib/middleware/with-database';
import { Media } from '@/lib/models/Media';
import { safeDbOperation } from '@/lib/utils/dbUtils';
import { sendMethodNotAllowed, sendSuccess, sendError } from '@/lib/utils/apiResponse';
import { generateSearchCacheKey } from '@/lib/utils/searchUtils';

// 缓存存储
interface CacheItem {
  data: string[];
  expiry: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_TTL = 5 * 60 * 1000; // 缓存有效期：5分钟

/**
 * 标签建议 API 路由处理函数
 * 
 * GET: 获取标签建议列表
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
    // 解析查询参数
    const {
      q = '', // 搜索关键词
      limit = '10',
      useCache = 'true' // 是否使用缓存
    } = req.query;

    const searchQuery = q as string;
    const limitNum = Math.min(parseInt(limit as string, 10), 20); // 最多返回20个标签建议
    const cacheKey = generateSearchCacheKey({ type: 'tags', q: searchQuery, limit: limitNum });

    // 检查缓存
    if (useCache === 'true' && cache[cacheKey] && cache[cacheKey].expiry > Date.now()) {
      console.log('Using cached tag suggestions');
      return sendSuccess(res, cache[cacheKey].data);
    }

    // 执行查询
    const tags = await safeDbOperation(async () => {
      const pipeline = [
        // 只查询活跃的媒体
        { $match: { isActive: true } },
        
        // 展开标签数组
        { $unwind: '$tags' },
        
        // 如果有搜索词，过滤标签
        ...(searchQuery
          ? [{ $match: { tags: { $regex: searchQuery, $options: 'i' } } }]
          : []),
        
        // 分组并计数
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        
        // 按使用频率排序
        { $sort: { count: -1 } },
        
        // 限制返回数量
        { $limit: limitNum },
        
        // 格式化输出
        {
          $project: {
            _id: 0,
            tag: '$_id',
            count: 1
          }
        }
      ];

      const result = await Media.aggregate(pipeline);
      return result.map(item => item.tag);
    });

    // 缓存结果
    if (useCache === 'true') {
      cache[cacheKey] = {
        data: tags,
        expiry: Date.now() + CACHE_TTL
      };
    }

    // 返回成功响应
    return sendSuccess(res, tags);
  } catch (error: any) {
    console.error('Error in tag suggestions API route:', error);
    
    // 返回错误响应
    return sendError(
      res,
      error.message || '获取标签建议失败',
      error.statusCode || 500
    );
  }
}

// 使用数据库中间件包装处理函数
export default withDatabase(handler);