import { NextApiRequest, NextApiResponse } from 'next';
import { checkDatabaseHealth } from '../../../lib/utils/db-status';
import { withDatabase } from '../../../lib/middleware/with-database';

/**
 * 数据库健康检查 API
 * 
 * @param {NextApiRequest} req - Next.js API 请求
 * @param {NextApiResponse} res - Next.js API 响应
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 检查数据库健康状态
    const health = await checkDatabaseHealth();
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      database: health
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
}

// 使用数据库中间件包装处理函数
export default withDatabase(handler);