# 环境变量配置指南

本文档详细说明了多端画廊项目的环境变量配置和管理。

## 📋 目录

- [快速开始](#快速开始)
- [环境文件说明](#环境文件说明)
- [配置项详解](#配置项详解)
- [环境特定配置](#环境特定配置)
- [安全最佳实践](#安全最佳实践)
- [部署配置](#部署配置)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. 复制环境变量模板

```bash
# 开发环境
cp .env.example .env.local

# 或者直接复制为 .env
cp .env.example .env
```

### 2. 配置必需的环境变量

编辑 `.env.local` 文件，至少配置以下必需项：

```bash
# 数据库连接 (必需)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/gallery?retryWrites=true&w=majority

# 身份验证密钥 (必需)
NEXTAUTH_SECRET=your-very-secure-secret-key-at-least-32-characters
JWT_SECRET=your-jwt-secret-key-at-least-32-characters

# 应用 URL (必需)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### 3. 启动应用

```bash
npm run dev
```

## 📁 环境文件说明

| 文件名 | 用途 | 优先级 | 版本控制 |
|--------|------|--------|----------|
| `.env.local` | 本地开发环境配置 | 最高 | ❌ 不提交 |
| `.env.development` | 开发环境默认配置 | 中 | ✅ 提交 |
| `.env.test` | 测试环境配置 | 中 | ✅ 提交 |
| `.env.production.example` | 生产环境模板 | - | ✅ 提交 |
| `.env.example` | 通用配置模板 | - | ✅ 提交 |
| `.env` | 通用环境配置 | 低 | ❌ 不提交 |

### 加载顺序

Next.js 按以下顺序加载环境变量文件：

1. `.env.local` (始终加载，所有环境)
2. `.env.{NODE_ENV}` (根据当前环境加载)
3. `.env` (默认配置)

## ⚙️ 配置项详解

### 应用基础配置

```bash
# 应用运行环境
NODE_ENV=development  # development | test | production

# 应用端口
PORT=3000

# 应用访问 URL (客户端可见)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 数据库配置

```bash
# MongoDB Atlas 连接字符串
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# 数据库名称
MONGODB_DB_NAME=gallery
```

**MongoDB URI 格式说明：**
- `username`: MongoDB 用户名
- `password`: MongoDB 密码
- `cluster`: MongoDB 集群地址
- `database`: 默认数据库名
- `retryWrites=true`: 启用重试写入
- `w=majority`: 写入确认级别

### 身份验证配置

```bash
# NextAuth.js 配置
NEXTAUTH_URL=http://localhost:3000  # 应用的完整 URL
NEXTAUTH_SECRET=your-secret-key     # 至少 32 位的随机字符串

# 自定义 JWT 密钥
JWT_SECRET=your-jwt-secret-key      # 至少 32 位的随机字符串
```

**密钥生成方法：**
```bash
# 使用 OpenSSL 生成随机密钥
openssl rand -base64 32

# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 第三方服务配置

```bash
# Cloudinary 图片服务 (可选)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Vercel Analytics (可选)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Sentry 错误监控 (可选)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 缓存和性能配置

```bash
# Redis 缓存 (可选)
REDIS_URL=redis://localhost:6379

# 缓存时间设置 (秒)
IMAGE_CACHE_TTL=3600    # 图片缓存 1 小时
API_CACHE_TTL=300       # API 缓存 5 分钟
```

### 安全配置

```bash
# CORS 配置
CORS_ORIGIN=*  # 开发环境可用 *，生产环境请设置具体域名

# API 限流配置
RATE_LIMIT_MAX=100      # 每个时间窗口最大请求数
RATE_LIMIT_WINDOW=900000 # 时间窗口 (毫秒)，15 分钟
```

### 日志和调试配置

```bash
# 日志级别
LOG_LEVEL=info  # error | warn | info | debug

# 调试模式
DEBUG=false             # 是否启用调试模式
SHOW_ERROR_DETAILS=false # 是否显示详细错误信息
```

## 🌍 环境特定配置

### 开发环境 (development)

```bash
NODE_ENV=development
DEBUG=true
SHOW_ERROR_DETAILS=true
LOG_LEVEL=debug
MONGODB_DB_NAME=gallery_dev
```

**特点：**
- 启用调试模式
- 显示详细错误信息
- 使用开发数据库
- 较短的缓存时间

### 测试环境 (test)

```bash
NODE_ENV=test
DEBUG=false
SHOW_ERROR_DETAILS=true
LOG_LEVEL=warn
MONGODB_DB_NAME=gallery_test
IMAGE_CACHE_TTL=0
API_CACHE_TTL=0
```

**特点：**
- 使用独立测试数据库
- 禁用缓存确保测试一致性
- 显示错误详情便于调试

### 生产环境 (production)

```bash
NODE_ENV=production
DEBUG=false
SHOW_ERROR_DETAILS=false
LOG_LEVEL=error
MONGODB_DB_NAME=gallery
```

**特点：**
- 关闭调试模式
- 隐藏错误详情
- 只记录错误日志
- 较长的缓存时间

## 🔒 安全最佳实践

### 1. 密钥管理

- ✅ 使用至少 32 位的随机字符串作为密钥
- ✅ 定期轮换生产环境密钥
- ✅ 不同环境使用不同的密钥
- ❌ 不要在代码中硬编码密钥

### 2. 数据库安全

- ✅ 使用专用数据库用户，限制权限
- ✅ 启用 MongoDB 网络访问控制
- ✅ 使用 SSL/TLS 连接
- ❌ 不要使用管理员账户连接

### 3. 环境变量保护

- ✅ 将 `.env.local` 和 `.env` 添加到 `.gitignore`
- ✅ 使用环境变量管理服务 (如 Vercel Environment Variables)
- ✅ 定期审查和清理未使用的环境变量
- ❌ 不要在客户端代码中使用敏感环境变量

### 4. CORS 配置

```bash
# 开发环境
CORS_ORIGIN=*

# 生产环境 (指定具体域名)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## 🚀 部署配置

### Vercel 部署

1. **在 Vercel Dashboard 中设置环境变量：**

```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

2. **环境特定配置：**

| 环境 | 配置文件 | 用途 |
|------|----------|------|
| Development | `.env.development` | 预览分支 |
| Preview | `.env.preview` | PR 预览 |
| Production | Vercel Dashboard | 生产环境 |

### 环境变量验证

项目使用 Zod 进行环境变量验证，启动时会自动检查：

```typescript
// src/lib/env.ts 会在应用启动时验证所有必需的环境变量
import { env } from '@/lib/env';
```

如果环境变量配置错误，应用会显示详细的错误信息。

## 🔧 故障排除

### 常见问题

#### 1. 数据库连接失败

**错误信息：** `MongoServerError: Authentication failed`

**解决方案：**
- 检查 `MONGODB_URI` 中的用户名和密码
- 确认数据库用户权限
- 检查 MongoDB Atlas 网络访问设置

#### 2. NextAuth 配置错误

**错误信息：** `[next-auth][error][JWT_SESSION_ERROR]`

**解决方案：**
- 确保 `NEXTAUTH_SECRET` 至少 32 位
- 检查 `NEXTAUTH_URL` 是否正确
- 验证域名配置

#### 3. 环境变量未加载

**解决方案：**
- 检查文件名是否正确 (`.env.local`)
- 确认文件位于项目根目录
- 重启开发服务器
- 检查变量名是否以 `NEXT_PUBLIC_` 开头 (客户端变量)

#### 4. 生产环境配置问题

**解决方案：**
- 在 Vercel Dashboard 中检查环境变量设置
- 确认生产环境 URL 配置正确
- 检查 CORS 设置

### 调试工具

```bash
# 检查环境变量加载情况
npm run env:check

# 验证数据库连接
npm run db:test

# 显示环境配置摘要
npm run env:summary
```

### 日志查看

```bash
# 开发环境日志
npm run dev

# 生产环境日志 (Vercel)
vercel logs your-deployment-url
```

## 📚 相关文档

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [MongoDB Atlas Connection](https://docs.atlas.mongodb.com/connect-to-cluster/)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

如有问题，请查看项目 README 或提交 Issue。