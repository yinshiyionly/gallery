import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase } from '@/lib/middleware/with-database';
import { isConnected, getConnectionState } from '@/lib/mongodb';
import { sendSuccess, sendError } from '@/lib/utils/apiResponse';

/**
 * 健康检查 API 路由
 * 
 * GET: 返回 API 和数据库连接状态
 * 
 * @param req Next.js 请求对象
 * @param res Next.js 响应对象
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: { 
        message: 'Method not allowed', 
        statusCode: 405 
      } 
    });
  }

  try {
    // 获取数据库连接状态
    const dbConnected = isConnected();
    const connectionState = getConnectionState();
    
    // 构建状态映射
    const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    return sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        state: stateMap[connectionState] || `unknown (${connectionState})`,
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return sendError(res, 'Health check failed', 500);
  }
}

export default withDatabase(handler);