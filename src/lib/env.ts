/**
 * 环境变量配置管理
 * 提供类型安全的环境变量访问和验证
 */

import { z } from 'zod';

// 环境变量验证 Schema
const envSchema = z.object({
  // 应用基础配置
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // 数据库配置
  MONGODB_URI: z.string().min(1, '数据库连接字符串不能为空'),
  MONGODB_DB_NAME: z.string().optional(), // 如果 URI 中已包含数据库名称，则可选

  // 身份验证配置
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth 密钥长度至少 32 位'),
  JWT_SECRET: z.string().min(32, 'JWT 密钥长度至少 32 位').optional(),

  // 第三方服务配置 (可选)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),

  // 缓存配置
  REDIS_URL: z.string().optional(),
  IMAGE_CACHE_TTL: z.string().transform(Number).default(3600),
  API_CACHE_TTL: z.string().transform(Number).default(300),

  // 安全配置
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.string().transform(Number).default(100),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default(900000),

  // 日志和监控配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().optional(),

  // 开发环境配置
  DEBUG: z.string().transform(val => val === 'true').default(false),
  SHOW_ERROR_DETAILS: z.string().transform(val => val === 'true').default(false),
});

// 环境变量类型
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * 验证和解析环境变量
 */
function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `环境变量配置错误:\n${missingVars.join('\n')}\n\n请检查 .env 文件配置`
      );
    }
    throw error;
  }
}

// 导出验证后的环境变量
export const env = validateEnv();

/**
 * 检查是否为开发环境
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * 检查是否为测试环境
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * 检查是否为生产环境
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * 获取数据库连接配置
 */
export const getDatabaseConfig = () => {
  // 检查 URI 是否已经包含数据库名称
  const hasDbInUri = env.MONGODB_URI.includes('mongodb.net/') && 
                     env.MONGODB_URI.split('mongodb.net/')[1]?.split('?')[0];
  
  return {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
    hasDbInUri: !!hasDbInUri,
    effectiveDbName: hasDbInUri || env.MONGODB_DB_NAME || 'gallery',
    options: {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: isProduction ? 10 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  };
};

/**
 * 获取缓存配置
 */
export const getCacheConfig = () => ({
  redis: {
    url: env.REDIS_URL,
    enabled: !!env.REDIS_URL,
  },
  ttl: {
    image: env.IMAGE_CACHE_TTL,
    api: env.API_CACHE_TTL,
  },
});

/**
 * 获取安全配置
 */
export const getSecurityConfig = () => ({
  cors: {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW,
  },
  showErrorDetails: env.SHOW_ERROR_DETAILS,
});

/**
 * 获取第三方服务配置
 */
export const getServicesConfig = () => ({
  cloudinary: {
    enabled: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  analytics: {
    vercel: {
      enabled: !!env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
      id: env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    },
  },
  monitoring: {
    sentry: {
      enabled: !!env.SENTRY_DSN,
      dsn: env.SENTRY_DSN,
    },
  },
});

/**
 * 敏感信息脱敏显示
 */
export const maskSensitiveInfo = (value: string): string => {
  if (!value || value.length < 8) return '***';
  return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
};

/**
 * 获取环境信息摘要 (用于日志和调试)
 */
export const getEnvSummary = () => ({
  environment: env.NODE_ENV,
  port: env.PORT,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  database: {
    connected: !!env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
    uri: maskSensitiveInfo(env.MONGODB_URI),
  },
  services: {
    cloudinary: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
    redis: !!env.REDIS_URL,
    sentry: !!env.SENTRY_DSN,
  },
  debug: env.DEBUG,
  logLevel: env.LOG_LEVEL,
});