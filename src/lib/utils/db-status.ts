import { getConnectionState } from '../mongodb';

/**
 * 获取数据库连接状态的可读描述
 * @returns {string} 连接状态描述
 */
export function getConnectionStateDescription(): string {
  const state = getConnectionState();
  
  switch (state) {
    case 0:
      return 'Disconnected';
    case 1:
      return 'Connected';
    case 2:
      return 'Connecting';
    case 3:
      return 'Disconnecting';
    default:
      return 'Unknown';
  }
}

/**
 * 检查数据库连接健康状态
 * @returns {Promise<{status: string, isHealthy: boolean}>} 健康状态信息
 */
export async function checkDatabaseHealth(): Promise<{status: string, isHealthy: boolean}> {
  const state = getConnectionState();
  
  return {
    status: getConnectionStateDescription(),
    isHealthy: state === 1
  };
}

/**
 * 格式化数据库错误信息
 * @param {Error} error - 数据库错误
 * @returns {string} 格式化的错误信息
 */
export function formatDbError(error: Error): string {
  if (error.name === 'MongoServerError') {
    return `数据库服务器错误: ${error.message}`;
  } else if (error.name === 'MongoNetworkError') {
    return `数据库网络错误: ${error.message}`;
  } else {
    return `数据库错误: ${error.message}`;
  }
}