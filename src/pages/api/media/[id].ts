import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { isValidObjectId, safeDbOperation } from '@/lib/utils/dbUtils';
import { 
  sendMethodNotAllowed, 
  sendSuccess, 
  sendNotFoundError, 
  sendValidationError,
  sendError
} from '@/lib/utils/apiResponse';
import { MediaItem } from '@/types';
import mongoose from 'mongoose';

/**
 * 获取相关媒体推荐
 * 基于标签和类型匹配，排除当前媒体
 * 
 * @param currentMedia 当前媒体对象
 * @param limit 推荐数量限制
 * @returns 相关媒体列表
 */
async function getRelatedMedia(currentMedia: MediaItem, limit: number = 4) {
  try {
    // 获取 Media 模型
    const Media = mongoose.models.Media || 
      mongoose.model('Media', require('@/lib/models/Media').MediaSchema);
    
    // 构建查询条件：匹配相同类型和标签，排除当前媒体
    const query = {
      _id: { $ne: currentMedia._id },
      isActive: true,
      $or: [
        { type: currentMedia.type },
        { tags: { $in: currentMedia.tags } }
      ]
    };

    // 执行查询并限制结果数量
    return await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  } catch (error) {
    console.error('获取相关媒体推荐失败:', error);
    return [];
  }
}

/**
 * 媒体详情 API 路由处理函数
 * 
 * GET: 获取单个媒体详情和相关推荐
 * 
 * @param req Next.js 请求对象
 * @param res Next.js 响应对象
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  // 获取媒体 ID
  const { id } = req.query;
  
  // 验证 ID 格式
  if (!id || typeof id !== 'string') {
    return sendValidationError(res, '无效的媒体 ID');
  }
  
  // 验证 MongoDB ObjectId 格式
  if (!isValidObjectId(id)) {
    return sendValidationError(res, '无效的媒体 ID 格式');
  }

  try {
    // 连接到数据库
    await connectToDatabase();
    
    // 获取 Media 模型
    const Media = mongoose.models.Media || 
      mongoose.model('Media', require('@/lib/models/Media').MediaSchema);
    
    // 执行查询
    const media = await Media.findOne({ 
      _id: id, 
      isActive: true 
    }).lean().exec();
    
    // 如果媒体不存在，返回 404
    if (!media) {
      return sendNotFoundError(res, '未找到该媒体资源');
    }
    
    // 获取相关媒体推荐
    const relatedMedia = await getRelatedMedia(media as MediaItem);
    
    // 返回成功响应
    return sendSuccess(res, {
      media,
      relatedMedia
    });
  } catch (error: any) {
    console.error('获取媒体详情失败:', error);
    
    // 返回错误响应
    return sendError(
      res, 
      error.message || '获取媒体详情失败', 
      error.statusCode || 500
    );
  }
}