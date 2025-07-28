# 部署指南

本文档详细说明了多端画廊项目的部署流程和配置方法。

## 📋 目录

- [概述](#概述)
- [Vercel 部署](#vercel-部署)
- [Docker 部署](#docker-部署)
- [传统服务器部署](#传统服务器部署)
- [环境配置](#环境配置)
- [性能优化](#性能优化)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🌟 概述

### 支持的部署方式

- **Vercel** (推荐): 零配置部署，自动 CI/CD
- **Docker**: 容器化部署，适合云服务器
- **传统服务器**: PM2 进程管理，适合 VPS
- **静态部署**: 导出静态文件，适合 CDN

### 部署要求

- **Node.js**: 18.0.0 或更高版本
- **MongoDB Atlas**: 云数据库服务
- **域名**: 生产环境需要自定义域名
- **SSL 证书**: HTTPS 支持

## 🚀 Vercel 部署

### 快速部署

Vercel 是推荐的部署平台，提供零配置的 Next.js 部署体验。

#### 1. 准备工作

```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "准备部署"
git push origin main
```

#### 2. 连接 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择 GitHub 仓库
4. 导入项目

#### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 必需的环境变量
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gallery
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# 可选的环境变量
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SENTRY_DSN=your-sentry-dsn
```

#### 4. 部署配置

创建 `vercel.json` 配置文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 5. 自动部署

配置完成后，每次推送到 `main` 分支都会自动触发部署。

```bash
# 推送代码自动部署
git push origin main
```

### 高级配置

#### 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. 自动获取 SSL 证书

#### 分支部署

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

#### 构建优化

```json
{
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "src/pages/**/*.ts": {
      "includeFiles": "src/lib/**"
    }
  }
}
```

## 🐳 Docker 部署

### Dockerfile

创建 `Dockerfile`：

```dockerfile
# 多阶段构建
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
```

### 部署命令

```bash
# 构建镜像
docker build -t multi-platform-gallery .

# 运行容器
docker run -p 3000:3000 --env-file .env.production multi-platform-gallery

# 使用 Docker Compose
docker-compose up -d
```

## 🖥️ 传统服务器部署

### 环境准备

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 Nginx
sudo apt-get install nginx
```

### 应用部署

```bash
# 克隆代码
git clone https://github.com/your-username/multi-platform-gallery.git
cd multi-platform-gallery

# 安装依赖
npm ci --only=production

# 构建应用
npm run build

# 配置环境变量
cp .env.example .env.production
nano .env.production
```

### PM2 配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'gallery',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/multi-platform-gallery',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '.env.production',
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

### Nginx 配置

创建 `/etc/nginx/sites-available/gallery`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # 静态文件缓存
    location /_next/static {
        alias /path/to/multi-platform-gallery/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        alias /path/to/multi-platform-gallery/public/images;
        expires 30d;
        add_header Cache-Control "public";
    }

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启动服务

```bash
# 启用 Nginx 配置
sudo ln -s /etc/nginx/sites-available/gallery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 启动 PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ⚙️ 环境配置

### 生产环境变量

```bash
# 应用配置
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 数据库配置
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/gallery_prod
MONGODB_DB_NAME=gallery_prod

# 安全配置
NEXTAUTH_SECRET=your-very-secure-production-secret
JWT_SECRET=your-jwt-production-secret
NEXTAUTH_URL=https://your-domain.com

# 第三方服务
CLOUDINARY_CLOUD_NAME=your-prod-cloud
CLOUDINARY_API_KEY=your-prod-key
CLOUDINARY_API_SECRET=your-prod-secret

# 监控配置
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# 缓存配置
REDIS_URL=redis://localhost:6379
IMAGE_CACHE_TTL=86400
API_CACHE_TTL=3600

# 安全配置
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000
```

### 环境验证

创建验证脚本 `scripts/verify-deployment.js`：

```javascript
const https = require('https');
const { MongoClient } = require('mongodb');

async function verifyDeployment() {
  console.log('🔍 验证部署环境...');

  // 验证环境变量
  const requiredEnvs = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.error(`❌ 缺少环境变量: ${env}`);
      process.exit(1);
    }
  }

  // 验证数据库连接
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ 数据库连接成功');
    await client.close();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }

  // 验证应用响应
  try {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    await new Promise((resolve, reject) => {
      https.get(`${url}/api/health`, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ 应用健康检查通过');
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      }).on('error', reject);
    });
  } catch (error) {
    console.error('❌ 应用健康检查失败:', error.message);
    process.exit(1);
  }

  console.log('🎉 部署验证完成！');
}

verifyDeployment();
```

## ⚡ 性能优化

### 构建优化

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 编译器
  swcMinify: true,
  
  // 图片优化
  images: {
    domains: ['your-domain.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  
  // 压缩
  compress: true,
  
  // 实验性功能
  experimental: {
    // 应用目录
    appDir: false,
    // 服务器组件
    serverComponents: false,
    // 边缘运行时
    runtime: 'nodejs',
  },
  
  // 输出配置
  output: 'standalone',
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 重定向
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### CDN 配置

```javascript
// 配置 CDN 加速
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
  
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud/image/fetch/',
  },
});
```

### 缓存策略

```nginx
# Nginx 缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    gzip_static on;
}

location /api/ {
    proxy_pass http://localhost:3000;
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

## 📊 监控和维护

### 健康检查

```javascript
// pages/api/health/index.ts
export default async function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  };

  res.status(200).json(health);
}
```

### 日志配置

```javascript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 监控脚本

```bash
#!/bin/bash
# scripts/monitor.sh

# 检查应用状态
check_app() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
    if [ $response -eq 200 ]; then
        echo "✅ 应用运行正常"
    else
        echo "❌ 应用异常，状态码: $response"
        # 重启应用
        pm2 restart gallery
    fi
}

# 检查磁盘空间
check_disk() {
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        echo "⚠️  磁盘使用率过高: ${usage}%"
        # 清理日志
        find ./logs -name "*.log" -mtime +7 -delete
    fi
}

# 检查内存使用
check_memory() {
    memory=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    echo "📊 内存使用率: ${memory}%"
}

# 执行检查
check_app
check_disk
check_memory
```

## 🔧 故障排除

### 常见问题

#### 1. 构建失败

**问题**: `npm run build` 失败

**解决方案**:
```bash
# 清理缓存
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 2. 数据库连接失败

**问题**: MongoDB 连接超时

**解决方案**:
```bash
# 检查网络连接
ping cluster.mongodb.net

# 验证连接字符串
node -e "console.log(process.env.MONGODB_URI)"

# 测试连接
npm run test:db
```

#### 3. 内存不足

**问题**: 应用内存溢出

**解决方案**:
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=2048"

# PM2 配置
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

#### 4. SSL 证书问题

**问题**: HTTPS 证书错误

**解决方案**:
```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d your-domain.com

# 验证证书
openssl x509 -in /path/to/cert.pem -text -noout
```

### 调试工具

```bash
# 查看应用日志
pm2 logs gallery

# 监控资源使用
pm2 monit

# 查看进程状态
pm2 status

# 重启应用
pm2 restart gallery

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 性能分析

```bash
# 分析 bundle 大小
npm run analyze

# 性能测试
npx lighthouse http://your-domain.com

# 压力测试
npx autocannon http://your-domain.com
```

## 📞 技术支持

如果在部署过程中遇到问题：

1. 查看本文档的故障排除章节
2. 检查应用和服务器日志
3. 在 GitHub Issues 中搜索相关问题
4. 提交新的 Issue 并提供详细信息

---

**更新日期**: 2023-09-06  
**文档版本**: v1.0.0