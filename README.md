# 多端画廊 | Multi-Platform Gallery

基于 Next.js 和 MongoDB 的响应式多端画廊应用，提供优秀的用户体验和美观的界面设计。

## 📋 目录

- [功能特点](#功能特点)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API 文档](#api-文档)
- [组件文档](#组件文档)
- [开发指南](#开发指南)
- [测试](#测试)
- [部署](#部署)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## ✨ 功能特点

### 🎨 用户界面
- **响应式设计**: 完美适配桌面、平板和移动设备
- **现代化 UI**: 基于 Tailwind CSS 的美观界面设计
- **流畅动画**: 使用 Framer Motion 实现丰富的交互动画
- **主题支持**: 支持亮色/暗色主题切换
- **无障碍访问**: 遵循 WCAG 2.1 无障碍标准

### 🖼️ 媒体展示
- **多种布局**: 网格布局、瀑布流、轮播等展示方式
- **高性能加载**: 图片懒加载和渐进式加载
- **全屏预览**: 支持图片缩放和全屏查看
- **媒体详情**: 完整的媒体信息展示页面
- **相关推荐**: 基于标签和类型的智能推荐

### 🔍 搜索与筛选
- **实时搜索**: 支持标题、标签、描述的全文搜索
- **智能筛选**: 按类型、标签、日期等多维度筛选
- **搜索建议**: 实时搜索建议和历史记录
- **分页加载**: 支持分页和无限滚动加载

### ⚡ 性能优化
- **代码分割**: 路由级和组件级代码分割
- **图片优化**: Next.js Image 组件自动优化
- **缓存策略**: 多层缓存提升访问速度
- **PWA 支持**: 渐进式 Web 应用功能

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 14 (React 18) + TypeScript
- **样式**: Tailwind CSS + Framer Motion
- **状态管理**: Zustand (轻量级状态管理)
- **图片处理**: Next.js Image Optimization
- **测试**: Jest + React Testing Library

### 后端技术
- **数据库**: MongoDB Atlas
- **ORM**: Mongoose
- **API**: Next.js API Routes
- **身份验证**: NextAuth.js (可选)

### 开发工具
- **代码质量**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **部署**: Vercel
- **监控**: Vercel Analytics

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **MongoDB Atlas**: 云数据库账号

### 1. 克隆项目

```bash
git clone https://github.com/your-username/multi-platform-gallery.git
cd multi-platform-gallery
```

### 2. 安装依赖

```bash
npm install
# 或使用 yarn
yarn install
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

**必需的环境变量：**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gallery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

详细的环境配置请参考 [环境设置文档](docs/ENVIRONMENT_SETUP.md)。

### 4. 验证配置

```bash
# 验证环境变量
npm run env:check

# 测试数据库连接
npm run test:db
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 6. 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
multi-platform-gallery/
├── .kiro/                    # Kiro 配置和规范
│   ├── specs/               # 功能规范文档
│   └── steering/            # 项目指导文档
├── docs/                    # 项目文档
│   ├── ENVIRONMENT_SETUP.md # 环境配置指南
│   ├── API.md              # API 文档
│   ├── COMPONENTS.md       # 组件文档
│   └── DEPLOYMENT.md       # 部署指南
├── public/                  # 静态资源
│   ├── manifest.json       # PWA 配置
│   └── sw.js              # Service Worker
├── scripts/                 # 工具脚本
│   ├── test-db-connection.ts
│   ├── validate-env.js
│   └── setup-env.js
├── src/                     # 源代码
│   ├── components/          # React 组件
│   │   ├── ui/             # 基础 UI 组件
│   │   ├── gallery/        # 画廊相关组件
│   │   ├── layout/         # 布局组件
│   │   └── dev/            # 开发工具组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── models/         # 数据模型
│   │   ├── utils/          # 工具函数
│   │   ├── middleware/     # 中间件
│   │   └── services/       # 服务层
│   ├── pages/              # Next.js 页面
│   │   ├── api/            # API 路由
│   │   ├── gallery/        # 画廊页面
│   │   └── media/          # 媒体详情页面
│   ├── store/              # 状态管理
│   ├── styles/             # 样式文件
│   └── types/              # TypeScript 类型定义
├── .env.example            # 环境变量模板
├── .gitignore             # Git 忽略文件
├── jest.config.js         # Jest 配置
├── next.config.js         # Next.js 配置
├── package.json           # 项目依赖
├── tailwind.config.ts     # Tailwind CSS 配置
└── tsconfig.json          # TypeScript 配置
```

## 📚 文档

### 详细文档

- **[API 文档](docs/API.md)** - 完整的 API 接口文档
- **[组件文档](docs/COMPONENTS.md)** - 组件使用指南和示例
- **[环境配置](docs/ENVIRONMENT_SETUP.md)** - 详细的环境配置指南
- **[部署指南](docs/DEPLOYMENT.md)** - 生产环境部署说明

### 开发文档

- **[开发指南](#开发指南)** - 开发规范和最佳实践
- **[贡献指南](#贡献指南)** - 如何参与项目贡献
- **[测试指南](#测试)** - 测试策略和执行方法

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 测试类型

- **单元测试**: 组件和工具函数测试
- **集成测试**: API 路由和数据库操作测试
- **E2E 测试**: 用户流程端到端测试

### 测试工具

```bash
# 测试数据库连接
npm run test:db

# 测试媒体 API
npm run test:media-api

# 验证环境配置
npm run env:check
```

## 🚀 部署

### Vercel 部署（推荐）

1. **连接 GitHub 仓库**
   ```bash
   # 推送代码到 GitHub
   git push origin main
   ```

2. **在 Vercel 中导入项目**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project" 导入 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

4. **部署**
   Vercel 会自动构建和部署项目。

详细部署指南请参考 [部署文档](docs/DEPLOYMENT.md)。

### 其他部署选项

- **Docker**: 支持容器化部署
- **传统服务器**: 支持 PM2 进程管理
- **CDN**: 静态资源 CDN 加速

## 👥 开发指南

### 代码规范

- **TypeScript**: 严格的类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 自动化

### 开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   ```bash
   npm run dev
   npm run test
   ```

3. **代码检查**
   ```bash
   npm run lint
   npm run format
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### 组件开发

- 使用 TypeScript 进行类型定义
- 遵循 React Hooks 最佳实践
- 编写单元测试
- 添加 Storybook 文档（可选）

### API 开发

- 使用 Next.js API Routes
- 实现错误处理和验证
- 添加 API 文档注释
- 编写集成测试

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 贡献类型

- 🐛 **Bug 修复**
- ✨ **新功能开发**
- 📚 **文档改进**
- 🎨 **UI/UX 优化**
- ⚡ **性能优化**
- 🧪 **测试覆盖**

### 代码审查

所有 Pull Request 都需要经过代码审查：

- 代码质量检查
- 测试覆盖率验证
- 文档完整性检查
- 性能影响评估

### 问题报告

使用 GitHub Issues 报告问题：

- 使用问题模板
- 提供详细的重现步骤
- 包含环境信息
- 添加相关标签

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系我们

- **项目主页**: [GitHub Repository](https://github.com/your-username/multi-platform-gallery)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/multi-platform-gallery/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/your-username/multi-platform-gallery/discussions)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！