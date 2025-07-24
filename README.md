# 多端画廊 | Multi-Platform Gallery

基于 Next.js 和 MongoDB 的响应式多端画廊应用，提供优秀的用户体验和美观的界面设计。

## 技术栈

- **前端**: Next.js 14 (React 18) + TypeScript
- **样式**: Tailwind CSS + Framer Motion (动画)
- **状态管理**: Zustand (轻量级状态管理)
- **数据库**: MongoDB Atlas
- **ORM**: Mongoose
- **部署**: Vercel
- **图片优化**: Next.js Image Optimization

## 功能特点

- 响应式设计，支持桌面、平板和移动设备
- 美观的 UI 设计和流畅的动画效果
- 多种媒体展示方式（网格布局、瀑布流等）
- 实时搜索和筛选功能
- 媒体详情查看和全屏预览
- 高性能的图片加载和优化

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB Atlas 账号

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后填写相应的环境变量：

```bash
cp .env.example .env
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 项目结构

```
src/
├── components/       # 组件
│   ├── ui/           # 基础 UI 组件
│   ├── gallery/      # 画廊相关组件
│   └── layout/       # 布局组件
├── pages/            # 页面
│   ├── api/          # API 路由
│   ├── index.tsx     # 首页
│   └── gallery/      # 画廊页面
├── lib/              # 工具库
│   ├── models/       # 数据模型
│   ├── services/     # 服务
│   └── utils/        # 工具函数
├── hooks/            # 自定义 Hooks
├── store/            # 状态管理
└── types/            # 类型定义
```

## 测试

### 运行测试

```bash
npm run test
# 或
yarn test
```

### 测试数据库连接

```bash
npm run test:db
# 或
yarn test:db
```

## 部署

项目配置为可直接部署到 Vercel 平台。

## 许可证

MIT