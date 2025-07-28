/**
 * 安全配置和敏感信息处理工具
 */

import { env, isProduction } from './env';

/**
 * 敏感信息脱敏配置
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /auth/i,
  /credential/i,
];

/**
 * 检查字符串是否包含敏感信息
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * 脱敏处理敏感信息
 */
export function maskSensitiveValue(value: string, showLength = 4): string {
  if (!value) return '';
  
  if (value.length <= showLength * 2) {
    return '*'.repeat(value.length);
  }
  
  const start = value.slice(0, showLength);
  const end = value.slice(-showLength);
  const middle = '*'.repeat(Math.min(value.length - showLength * 2, 20));
  
  return `${start}${middle}${end}`;
}

/**
 * 安全的日志记录 - 自动脱敏敏感信息
 */
export function secureLog(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key) && typeof value === 'string') {
      sanitized[key] = maskSensitiveValue(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = secureLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * 环境变量安全检查
 */
export function validateSecurityConfig(): {
  isSecure: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 生产环境安全检查
  if (isProduction) {
    // 检查调试模式
    if (env.DEBUG) {
      warnings.push('生产环境不应启用 DEBUG 模式');
    }

    // 检查错误详情显示
    if (env.SHOW_ERROR_DETAILS) {
      warnings.push('生产环境不应显示详细错误信息');
    }

    // 检查 CORS 配置
    if (env.CORS_ORIGIN === '*') {
      errors.push('生产环境不应将 CORS_ORIGIN 设置为 *');
    }

    // 检查密钥强度
    if (env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET 长度应至少 32 位');
    }

    if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET 长度应至少 32 位');
    }
  }

  // 检查默认密钥
  const defaultSecrets = [
    'your-secret-key',
    'your-nextauth-secret',
    'your-jwt-secret',
    'test-secret',
  ];

  if (defaultSecrets.includes(env.NEXTAUTH_SECRET)) {
    errors.push('请更换默认的 NEXTAUTH_SECRET');
  }

  if (env.JWT_SECRET && defaultSecrets.includes(env.JWT_SECRET)) {
    errors.push('请更换默认的 JWT_SECRET');
  }

  return {
    isSecure: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * 生成安全的随机密钥
 */
export function generateSecureKey(length = 32): string {
  if (typeof crypto !== 'undefined' && crypto.randomBytes) {
    // Node.js 环境
    return crypto.randomBytes(length).toString('base64');
  } else if (typeof window !== 'undefined' && window.crypto) {
    // 浏览器环境
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  } else {
    // 降级方案
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * 安全的 URL 构建
 */
export function buildSecureUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  try {
    const url = new URL(path, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    return url.toString();
  } catch (error) {
    throw new Error(`无效的 URL 配置: ${baseUrl}${path}`);
  }
}

/**
 * 请求头安全配置
 */
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  return headers;
}

/**
 * 数据库连接安全配置
 */
export function getDatabaseSecurityOptions() {
  return {
    // 连接池配置
    maxPoolSize: isProduction ? 10 : 5,
    minPoolSize: isProduction ? 2 : 1,
    
    // 超时配置
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    // 安全配置
    ssl: isProduction,
    authSource: 'admin',
    retryWrites: true,
    w: 'majority',
    
    // 监控配置
    monitorCommands: !isProduction,
  };
}

/**
 * API 安全中间件配置
 */
export function getApiSecurityConfig() {
  return {
    // 限流配置
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW,
      max: env.RATE_LIMIT_MAX,
      message: '请求过于频繁，请稍后再试',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // CORS 配置
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    
    // 请求体大小限制
    bodyParser: {
      json: { limit: '10mb' },
      urlencoded: { limit: '10mb', extended: true },
    },
  };
}