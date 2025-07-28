#!/usr/bin/env node

/**
 * 环境设置测试脚本
 * 验证环境变量配置是否正确工作
 */

const { validateEnvironment } = require('./validate-env');

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function testEnvironmentSetup() {
  console.log(colorize('🧪 环境设置测试开始...', 'cyan'));
  console.log('');

  try {
    // 1. 验证环境变量
    console.log(colorize('1. 验证环境变量配置...', 'blue'));
    const isValid = validateEnvironment();
    
    if (!isValid) {
      console.log(colorize('❌ 环境变量验证失败', 'red'));
      return false;
    }
    
    console.log(colorize('✅ 环境变量验证通过', 'green'));
    console.log('');

    // 2. 测试环境变量加载
    console.log(colorize('2. 测试环境变量加载...', 'blue'));
    
    // 动态导入环境配置 (模拟 Next.js 环境)
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    
    try {
      // 这里我们不能直接导入 TypeScript 文件，所以只做基本检查
      const requiredVars = [
        'MONGODB_URI',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'NEXT_PUBLIC_APP_URL',
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.log(colorize(`❌ 缺少必需的环境变量: ${missingVars.join(', ')}`, 'red'));
        return false;
      }
      
      console.log(colorize('✅ 环境变量加载成功', 'green'));
    } catch (error) {
      console.log(colorize(`❌ 环境变量加载失败: ${error.message}`, 'red'));
      return false;
    }
    
    console.log('');

    // 3. 测试数据库连接字符串格式
    console.log(colorize('3. 验证数据库连接字符串...', 'blue'));
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      console.log(colorize('❌ MongoDB URI 格式不正确', 'red'));
      return false;
    }
    
    console.log(colorize('✅ 数据库连接字符串格式正确', 'green'));
    console.log('');

    // 4. 测试密钥强度
    console.log(colorize('4. 验证密钥强度...', 'blue'));
    
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (nextAuthSecret.length < 32) {
      console.log(colorize('❌ NEXTAUTH_SECRET 长度不足 32 位', 'red'));
      return false;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      console.log(colorize('❌ JWT_SECRET 长度不足 32 位', 'red'));
      return false;
    }
    
    console.log(colorize('✅ 密钥强度验证通过', 'green'));
    console.log('');

    // 5. 测试 URL 格式
    console.log(colorize('5. 验证 URL 配置...', 'blue'));
    
    try {
      new URL(process.env.NEXTAUTH_URL);
      new URL(process.env.NEXT_PUBLIC_APP_URL);
      console.log(colorize('✅ URL 格式验证通过', 'green'));
    } catch (error) {
      console.log(colorize('❌ URL 格式不正确', 'red'));
      return false;
    }
    
    console.log('');

    // 6. 环境特定配置检查
    console.log(colorize('6. 检查环境特定配置...', 'blue'));
    
    const nodeEnv = process.env.NODE_ENV;
    console.log(colorize(`  当前环境: ${nodeEnv}`, 'yellow'));
    
    if (nodeEnv === 'production') {
      const productionWarnings = [];
      
      if (process.env.DEBUG === 'true') {
        productionWarnings.push('DEBUG 模式在生产环境中启用');
      }
      
      if (process.env.SHOW_ERROR_DETAILS === 'true') {
        productionWarnings.push('SHOW_ERROR_DETAILS 在生产环境中启用');
      }
      
      if (process.env.CORS_ORIGIN === '*') {
        productionWarnings.push('CORS_ORIGIN 在生产环境中设置为 *');
      }
      
      if (productionWarnings.length > 0) {
        console.log(colorize('⚠️  生产环境配置警告:', 'yellow'));
        productionWarnings.forEach(warning => {
          console.log(colorize(`    - ${warning}`, 'yellow'));
        });
      } else {
        console.log(colorize('✅ 生产环境配置检查通过', 'green'));
      }
    } else {
      console.log(colorize('✅ 开发环境配置检查通过', 'green'));
    }
    
    console.log('');

    // 测试总结
    console.log(colorize('🎉 环境设置测试完成！', 'green'));
    console.log(colorize('✅ 所有测试项目都已通过', 'green'));
    console.log('');
    console.log(colorize('下一步建议:', 'blue'));
    console.log('  1. 运行 npm run dev 启动开发服务器');
    console.log('  2. 运行 npm run test:db 测试数据库连接');
    console.log('  3. 查看 docs/ENVIRONMENT_SETUP.md 了解更多配置选项');
    
    return true;

  } catch (error) {
    console.log(colorize(`❌ 测试过程中发生错误: ${error.message}`, 'red'));
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testEnvironmentSetup().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testEnvironmentSetup };