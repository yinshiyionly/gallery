import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../mongodb';

/**
 * 数据库连接中间件
 * 为 API 路由提供数据库连接
 * 
 * @param {Function} handler - API 路由处理函数
 * @returns {Function} 包装后的处理函数
 */
export function withDatabase(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 连接到数据库
      await connectToDatabase();
      
      // 调用原始处理函数
      return handler(req, res);
    } catch (error) {
      console.error('Database connection error in API route:', error);
      
      // 返回数据库连接错误
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}