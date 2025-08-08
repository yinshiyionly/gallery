/**
 * MongoDB URI 工具函数
 */

/**
 * 解析 MongoDB URI 中的数据库名称
 * @param uri MongoDB 连接字符串
 * @returns 数据库名称或 null
 */
export function extractDbNameFromUri(uri: string): string | null {
  try {
    // 处理 mongodb+srv:// 格式
    if (uri.includes('mongodb+srv://')) {
      const match = uri.match(/mongodb\+srv:\/\/[^\/]+\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    // 处理 mongodb:// 格式
    if (uri.includes('mongodb://')) {
      const match = uri.match(/mongodb:\/\/[^\/]+\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing MongoDB URI:', error);
    return null;
  }
}

/**
 * 检查 MongoDB URI 是否包含数据库名称
 * @param uri MongoDB 连接字符串
 * @returns 是否包含数据库名称
 */
export function hasDbNameInUri(uri: string): boolean {
  const dbName = extractDbNameFromUri(uri);
  return dbName !== null && dbName.length > 0;
}

/**
 * 构建完整的 MongoDB 连接字符串
 * @param uri 基础 URI
 * @param dbName 数据库名称
 * @returns 完整的连接字符串
 */
export function buildMongoUri(uri: string, dbName?: string): string {
  if (!dbName || hasDbNameInUri(uri)) {
    return uri;
  }
  
  // 如果 URI 包含查询参数，在数据库名称后添加
  if (uri.includes('?')) {
    return uri.replace('?', `/${dbName}?`);
  }
  
  // 否则直接添加数据库名称
  return `${uri}/${dbName}`;
}

/**
 * 获取数据库连接信息摘要
 * @param uri MongoDB 连接字符串
 * @param envDbName 环境变量中的数据库名称
 * @returns 连接信息摘要
 */
export function getConnectionSummary(uri: string, envDbName?: string) {
  const uriDbName = extractDbNameFromUri(uri);
  const hasUriDb = !!uriDbName;
  
  return {
    hasDbInUri: hasUriDb,
    uriDbName,
    envDbName,
    effectiveDbName: uriDbName || envDbName || 'test',
    source: hasUriDb ? 'uri' : envDbName ? 'env' : 'default',
    needsDbNameParam: !hasUriDb && !!envDbName,
  };
}