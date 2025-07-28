#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 用于检查环境变量配置是否正确
 */

const fs = require('fs');
const path = require('path');

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

// 必需的环境变量
const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_APP_URL',
];

// 可选的环境变量
const optionalVars = [
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'REDIS_URL',
  'SENTRY_DSN',
];

// 验证规则
const validationRules = {
  MONGODB_URI: (value) => {
    if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
      return 'MongoDB URI 必须以 mongodb:// 或 mongodb+srv:// 开头';
    }
    return null;
  },
  NEXTAUTH_SECRET: (value) => {
    if (value.length < 32) {
      return 'NEXTAUTH_SECRET 长度必须至少 32 位';
    }
    return null;
  },
  JWT_SECRET: (value) => {
    if (value && value.length < 32) {
      return 'JWT_SECRET 长度必须至少 32 位';
    }
    return null;
  },
  NEXTAUTH_URL: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'NEXTAUTH_URL 必须是有效的 URL';
    }
  },
  NEXT_PUBLIC_APP_URL: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'NEXT_PUBLIC_APP_URL 必须是有效的 URL';
    }
  },
};

// 加载环境变量
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// 主验证函数
function validateEnvironment() {
  console.log(colorize('🔍 环境变量验证开始...', 'cyan'));
  console.log('');

  // 检查环境文件
  const envFiles = [
    '.env.local',
    '.env',
    '.env.development',
    '.env.test',
  ];

  const foundFiles = [];
  const allEnvVars = {};

  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      foundFiles.push(file);
      const vars = loadEnvFile(filePath);
      Object.assign(allEnvVars, vars);
    }
  });

  console.log(colorize('📁 发现的环境文件:', 'blue'));
  if (foundFiles.length === 0) {
    console.log(colorize('  ❌ 未找到任何环境文件', 'red'));
    console.log(colorize('  💡 请复制 .env.example 为 .env.local', 'yellow'));
    return false;
  }

  foundFiles.forEach(file => {
    console.log(colorize(`  ✅ ${file}`, 'green'));
  });
  console.log('');

  // 验证必需变量
  console.log(colorize('🔑 必需的环境变量:', 'blue'));
  let hasErrors = false;

  requiredVars.forEach(varName => {
    const value = allEnvVars[varName] || process.env[varName];
    if (!value) {
      console.log(colorize(`  ❌ ${varName}: 未设置`, 'red'));
      hasErrors = true;
    } else {
      const error = validationRules[varName]?.(value);
      if (error) {
        console.log(colorize(`  ❌ ${varName}: ${error}`, 'red'));
        hasErrors = true;
      } else {
        const maskedValue = maskSensitiveValue(varName, value);
        console.log(colorize(`  ✅ ${varName}: ${maskedValue}`, 'green'));
      }
    }
  });

  console.log('');

  // 检查可选变量
  console.log(colorize('🔧 可选的环境变量:', 'blue'));
  optionalVars.forEach(varName => {
    const value = allEnvVars[varName] || process.env[varName];
    if (value) {
      const error = validationRules[varName]?.(value);
      if (error) {
        console.log(colorize(`  ⚠️  ${varName}: ${error}`, 'yellow'));
      } else {
        const maskedValue = maskSensitiveValue(varName, value);
        console.log(colorize(`  ✅ ${varName}: ${maskedValue}`, 'green'));
      }
    } else {
      console.log(colorize(`  ➖ ${varName}: 未设置`, 'yellow'));
    }
  });

  console.log('');

  // 环境特定检查
  const nodeEnv = allEnvVars.NODE_ENV || process.env.NODE_ENV || 'development';
  console.log(colorize(`🌍 当前环境: ${nodeEnv}`, 'blue'));

  if (nodeEnv === 'production') {
    console.log(colorize('🔒 生产环境安全检查:', 'blue'));
    
    // 检查生产环境特定配置
    const productionChecks = [
      {
        name: 'DEBUG 模式',
        check: () => {
          const debug = allEnvVars.DEBUG || process.env.DEBUG;
          return debug !== 'true';
        },
        message: 'DEBUG 模式应该在生产环境中关闭',
      },
      {
        name: 'CORS 配置',
        check: () => {
          const cors = allEnvVars.CORS_ORIGIN || process.env.CORS_ORIGIN;
          return cors && cors !== '*';
        },
        message: 'CORS_ORIGIN 不应该在生产环境中设置为 *',
      },
      {
        name: '错误详情',
        check: () => {
          const showErrors = allEnvVars.SHOW_ERROR_DETAILS || process.env.SHOW_ERROR_DETAILS;
          return showErrors !== 'true';
        },
        message: 'SHOW_ERROR_DETAILS 应该在生产环境中关闭',
      },
    ];

    productionChecks.forEach(({ name, check, message }) => {
      if (check()) {
        console.log(colorize(`  ✅ ${name}: 配置正确`, 'green'));
      } else {
        console.log(colorize(`  ⚠️  ${name}: ${message}`, 'yellow'));
      }
    });
  }

  console.log('');

  // 总结
  if (hasErrors) {
    console.log(colorize('❌ 环境变量验证失败', 'red'));
    console.log(colorize('💡 请修复上述错误后重新运行验证', 'yellow'));
    return false;
  } else {
    console.log(colorize('✅ 环境变量验证通过', 'green'));
    console.log(colorize('🚀 应用可以正常启动', 'green'));
    return true;
  }
}

// 敏感信息脱敏
function maskSensitiveValue(key, value) {
  const sensitiveKeys = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN', 'URI'];
  const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
  
  if (!isSensitive) {
    return value;
  }

  if (value.length <= 8) {
    return '***';
  }

  return value.slice(0, 4) + '*'.repeat(Math.min(value.length - 8, 20)) + value.slice(-4);
}

// 运行验证
if (require.main === module) {
  const success = validateEnvironment();
  process.exit(success ? 0 : 1);
}

module.exports = { validateEnvironment };