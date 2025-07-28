#!/usr/bin/env node

/**
 * 环境设置脚本
 * 帮助用户快速设置开发环境
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 创建交互式输入接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 提问工具函数
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 生成安全密钥
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// 主设置函数
async function setupEnvironment() {
  console.log(colorize('🚀 多端画廊项目环境设置向导', 'cyan'));
  console.log(colorize('=' .repeat(50), 'cyan'));
  console.log('');

  // 检查是否已存在环境文件
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envLocalPath) || fs.existsSync(envPath)) {
    console.log(colorize('⚠️  检测到已存在的环境文件:', 'yellow'));
    if (fs.existsSync(envLocalPath)) console.log('  - .env.local');
    if (fs.existsSync(envPath)) console.log('  - .env');
    console.log('');
    
    const overwrite = await question('是否要覆盖现有配置？(y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log(colorize('✅ 保持现有配置不变', 'green'));
      rl.close();
      return;
    }
  }

  console.log(colorize('📝 请提供以下配置信息:', 'blue'));
  console.log('');

  // 收集配置信息
  const config = {};

  // 应用基础配置
  console.log(colorize('1. 应用基础配置', 'magenta'));
  config.PORT = await question('应用端口 (默认: 3000): ') || '3000';
  config.NEXT_PUBLIC_APP_URL = await question('应用 URL (默认: http://localhost:3000): ') || 'http://localhost:3000';
  console.log('');

  // 数据库配置
  console.log(colorize('2. 数据库配置', 'magenta'));
  console.log('请提供 MongoDB Atlas 连接信息:');
  
  const mongoUri = await question('MongoDB URI: ');
  if (!mongoUri) {
    console.log(colorize('❌ MongoDB URI 是必需的', 'red'));
    rl.close();
    return;
  }
  config.MONGODB_URI = mongoUri;
  
  config.MONGODB_DB_NAME = await question('数据库名称 (默认: gallery): ') || 'gallery';
  console.log('');

  // 身份验证配置
  console.log(colorize('3. 身份验证配置', 'magenta'));
  config.NEXTAUTH_URL = config.NEXT_PUBLIC_APP_URL;
  
  const useGeneratedSecrets = await question('是否自动生成安全密钥？(Y/n): ');
  if (useGeneratedSecrets.toLowerCase() !== 'n' && useGeneratedSecrets.toLowerCase() !== 'no') {
    config.NEXTAUTH_SECRET = generateSecureKey();
    config.JWT_SECRET = generateSecureKey();
    console.log(colorize('✅ 已生成安全密钥', 'green'));
  } else {
    config.NEXTAUTH_SECRET = await question('NextAuth 密钥 (至少 32 位): ');
    config.JWT_SECRET = await question('JWT 密钥 (至少 32 位): ');
  }
  console.log('');

  // 可选服务配置
  console.log(colorize('4. 可选服务配置', 'magenta'));
  const configureOptional = await question('是否配置可选服务 (Cloudinary, Sentry 等)？(y/N): ');
  
  if (configureOptional.toLowerCase() === 'y' || configureOptional.toLowerCase() === 'yes') {
    console.log('');
    console.log(colorize('Cloudinary 配置 (图片服务):', 'blue'));
    config.CLOUDINARY_CLOUD_NAME = await question('Cloud Name (可选): ');
    config.CLOUDINARY_API_KEY = await question('API Key (可选): ');
    config.CLOUDINARY_API_SECRET = await question('API Secret (可选): ');
    
    console.log('');
    console.log(colorize('监控配置:', 'blue'));
    config.SENTRY_DSN = await question('Sentry DSN (可选): ');
    config.NEXT_PUBLIC_VERCEL_ANALYTICS_ID = await question('Vercel Analytics ID (可选): ');
  }
  console.log('');

  // 环境特定配置
  console.log(colorize('5. 环境特定配置', 'magenta'));
  const environment = await question('目标环境 (development/test/production) [默认: development]: ') || 'development';
  config.NODE_ENV = environment;

  if (environment === 'development') {
    config.DEBUG = 'true';
    config.SHOW_ERROR_DETAILS = 'true';
    config.LOG_LEVEL = 'debug';
  } else if (environment === 'test') {
    config.DEBUG = 'false';
    config.SHOW_ERROR_DETAILS = 'true';
    config.LOG_LEVEL = 'warn';
    config.MONGODB_DB_NAME = 'gallery_test';
  } else {
    config.DEBUG = 'false';
    config.SHOW_ERROR_DETAILS = 'false';
    config.LOG_LEVEL = 'error';
  }

  // 生成环境文件内容
  const envContent = generateEnvContent(config);

  // 选择保存位置
  const saveLocation = await question('保存到哪个文件？(.env.local/.env) [默认: .env.local]: ') || '.env.local';
  const targetPath = path.join(process.cwd(), saveLocation);

  // 保存文件
  try {
    fs.writeFileSync(targetPath, envContent);
    console.log('');
    console.log(colorize(`✅ 环境配置已保存到 ${saveLocation}`, 'green'));
    
    // 显示配置摘要
    console.log('');
    console.log(colorize('📋 配置摘要:', 'blue'));
    console.log(`  环境: ${config.NODE_ENV}`);
    console.log(`  端口: ${config.PORT}`);
    console.log(`  应用 URL: ${config.NEXT_PUBLIC_APP_URL}`);
    console.log(`  数据库: ${maskSensitive(config.MONGODB_URI)}`);
    console.log(`  NextAuth 密钥: ${maskSensitive(config.NEXTAUTH_SECRET)}`);
    
    if (config.CLOUDINARY_CLOUD_NAME) {
      console.log(`  Cloudinary: ${config.CLOUDINARY_CLOUD_NAME}`);
    }
    
    console.log('');
    console.log(colorize('🎉 环境设置完成！', 'green'));
    console.log('');
    console.log(colorize('下一步:', 'yellow'));
    console.log('  1. 运行 npm run env:validate 验证配置');
    console.log('  2. 运行 npm run dev 启动开发服务器');
    console.log('  3. 查看 docs/ENVIRONMENT_SETUP.md 了解更多配置选项');
    
  } catch (error) {
    console.log(colorize(`❌ 保存配置文件失败: ${error.message}`, 'red'));
  }

  rl.close();
}

// 生成环境文件内容
function generateEnvContent(config) {
  const lines = [
    '# =============================================================================',
    '# 环境变量配置',
    '# =============================================================================',
    `# 生成时间: ${new Date().toISOString()}`,
    '# 此文件由环境设置向导自动生成',
    '',
    '# 应用基础配置',
    `NODE_ENV=${config.NODE_ENV}`,
    `PORT=${config.PORT}`,
    `NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL}`,
    '',
    '# 数据库配置',
    `MONGODB_URI=${config.MONGODB_URI}`,
    `MONGODB_DB_NAME=${config.MONGODB_DB_NAME}`,
    '',
    '# 身份验证配置',
    `NEXTAUTH_URL=${config.NEXTAUTH_URL}`,
    `NEXTAUTH_SECRET=${config.NEXTAUTH_SECRET}`,
  ];

  if (config.JWT_SECRET) {
    lines.push(`JWT_SECRET=${config.JWT_SECRET}`);
  }

  if (config.CLOUDINARY_CLOUD_NAME || config.CLOUDINARY_API_KEY || config.CLOUDINARY_API_SECRET) {
    lines.push('', '# Cloudinary 配置');
    if (config.CLOUDINARY_CLOUD_NAME) lines.push(`CLOUDINARY_CLOUD_NAME=${config.CLOUDINARY_CLOUD_NAME}`);
    if (config.CLOUDINARY_API_KEY) lines.push(`CLOUDINARY_API_KEY=${config.CLOUDINARY_API_KEY}`);
    if (config.CLOUDINARY_API_SECRET) lines.push(`CLOUDINARY_API_SECRET=${config.CLOUDINARY_API_SECRET}`);
  }

  if (config.SENTRY_DSN || config.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
    lines.push('', '# 监控配置');
    if (config.SENTRY_DSN) lines.push(`SENTRY_DSN=${config.SENTRY_DSN}`);
    if (config.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) lines.push(`NEXT_PUBLIC_VERCEL_ANALYTICS_ID=${config.NEXT_PUBLIC_VERCEL_ANALYTICS_ID}`);
  }

  lines.push('', '# 环境特定配置');
  if (config.DEBUG !== undefined) lines.push(`DEBUG=${config.DEBUG}`);
  if (config.SHOW_ERROR_DETAILS !== undefined) lines.push(`SHOW_ERROR_DETAILS=${config.SHOW_ERROR_DETAILS}`);
  if (config.LOG_LEVEL) lines.push(`LOG_LEVEL=${config.LOG_LEVEL}`);

  return lines.join('\n') + '\n';
}

// 敏感信息脱敏
function maskSensitive(value) {
  if (!value || value.length < 8) return '***';
  return value.slice(0, 4) + '*'.repeat(Math.min(value.length - 8, 20)) + value.slice(-4);
}

// 运行设置向导
if (require.main === module) {
  setupEnvironment().catch(error => {
    console.error(colorize(`❌ 设置过程中发生错误: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { setupEnvironment };