import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PaginatedResponse, MediaItem } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<MediaItem> | { success: false; message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '只允许 GET 请求' });
  }

  try {
    // 获取查询参数
    const {
      page = '1',
      limit = '12',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      query,
      type,
      tags,
    } = req.query;

    // 转换参数类型
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const filter: any = {};

    // 添加搜索查询
    if (query) {
      filter.$text = { $search: query as string };
    }

    // 添加类型过滤
    if (type && type !== 'all') {
      filter.type = type;
    }

    // 添加标签过滤
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // 连接数据库
    const mongoose = await connectToDatabase();
    const Media = mongoose.models.Media || mongoose.model('Media', require('@/lib/models/Media').MediaSchema);

    // 查询数据
    const [data, total] = await Promise.all([
      Media.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Media.countDocuments(filter),
    ]);

    // 计算总页数
    const totalPages = Math.ceil(total / limitNum);

    // 返回结果
    return res.status(200).json({
      success: true,
      data: data as MediaItem[],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('获取媒体列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取媒体列表失败',
    });
  }
}