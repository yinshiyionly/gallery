# 贡献指南

感谢您对多端画廊项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 📋 目录

- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [贡献类型](#贡献类型)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [代码审查](#代码审查)
- [社区准则](#社区准则)
- [获得帮助](#获得帮助)

## 🤝 如何贡献

### 快速开始

1. **Fork 项目**
   ```bash
   # 在 GitHub 上点击 Fork 按钮
   # 然后克隆你的 fork
   git clone https://github.com/your-username/multi-platform-gallery.git
   cd multi-platform-gallery
   ```

2. **设置开发环境**
   ```bash
   # 安装依赖
   npm install
   
   # 复制环境变量
   cp .env.example .env.local
   
   # 启动开发服务器
   npm run dev
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **进行更改**
   - 编写代码
   - 添加测试
   - 更新文档

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

## 🛠️ 开发环境设置

### 系统要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Git**: 2.30.0 或更高版本

### 推荐工具

- **编辑器**: VS Code
- **浏览器**: Chrome (用于调试)
- **数据库**: MongoDB Compass (可选)

### VS Code 扩展

安装以下推荐扩展以获得最佳开发体验：

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 环境配置

1. **复制环境变量文件**
   ```bash
   cp .env.example .env.local
   ```

2. **配置 MongoDB 连接**
   ```bash
   # 在 .env.local 中设置
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gallery_dev
   ```

3. **验证配置**
   ```bash
   npm run env:check
   npm run test:db
   ```

## 🎯 贡献类型

### 🐛 Bug 修复

发现了 bug？我们很乐意收到您的修复！

**步骤：**
1. 在 Issues 中搜索是否已有相关报告
2. 如果没有，创建新的 Issue 描述 bug
3. Fork 项目并创建修复分支
4. 编写修复代码和测试
5. 提交 Pull Request

**Bug 报告模板：**
```markdown
## Bug 描述
简要描述遇到的问题

## 重现步骤
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为
描述您期望发生的情况

## 实际行为
描述实际发生的情况

## 环境信息
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 115]
- Node.js: [e.g. 18.17.0]

## 截图
如果适用，添加截图来帮助解释问题
```

### ✨ 新功能

想要添加新功能？太棒了！

**步骤：**
1. 创建 Feature Request Issue
2. 等待维护者反馈和讨论
3. 获得批准后开始开发
4. 遵循开发规范编写代码
5. 添加相应的测试和文档
6. 提交 Pull Request

**功能请求模板：**
```markdown
## 功能描述
清晰简洁地描述您想要的功能

## 问题背景
这个功能解决了什么问题？

## 解决方案
描述您希望如何实现这个功能

## 替代方案
描述您考虑过的其他解决方案

## 附加信息
添加任何其他相关信息、截图或示例
```

### 📚 文档改进

文档对项目至关重要！

**可以改进的文档：**
- README.md
- API 文档
- 组件文档
- 部署指南
- 开发指南
- 代码注释

**文档规范：**
- 使用清晰简洁的语言
- 提供实际的代码示例
- 包含必要的截图或图表
- 保持格式一致性
- 及时更新过时信息

### 🎨 UI/UX 改进

设计和用户体验改进同样重要！

**可以改进的方面：**
- 界面设计
- 交互体验
- 响应式布局
- 无障碍访问
- 性能优化

### 🧪 测试

帮助提高代码质量和稳定性！

**测试类型：**
- 单元测试
- 集成测试
- E2E 测试
- 性能测试
- 无障碍测试

**测试规范：**
```typescript
// 测试文件命名: ComponentName.test.tsx
describe('ComponentName', () => {
  it('should render correctly', () => {
    // 测试实现
  });

  it('should handle user interaction', () => {
    // 测试实现
  });
});
```

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来保持提交历史的清晰和一致。

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(gallery): add infinite scroll` |
| `fix` | Bug 修复 | `fix(api): handle connection timeout` |
| `docs` | 文档更新 | `docs(readme): update installation guide` |
| `style` | 代码格式 | `style(ui): improve button spacing` |
| `refactor` | 代码重构 | `refactor(hooks): optimize useMedia hook` |
| `test` | 测试相关 | `test(api): add search endpoint tests` |
| `chore` | 构建/工具 | `chore(deps): update dependencies` |
| `perf` | 性能优化 | `perf(images): implement lazy loading` |
| `ci` | CI/CD | `ci(github): add automated testing` |

### 提交示例

```bash
# 新功能
git commit -m "feat(search): add real-time search suggestions"

# Bug 修复
git commit -m "fix(modal): prevent body scroll when modal is open"

# 文档更新
git commit -m "docs(api): add authentication examples"

# 重构
git commit -m "refactor(components): extract common button styles"

# 测试
git commit -m "test(gallery): add media card interaction tests"
```

### 提交消息规范

- 使用现在时态："add feature" 而不是 "added feature"
- 使用祈使语气："move cursor to..." 而不是 "moves cursor to..."
- 首字母小写
- 不要在末尾添加句号
- 限制第一行在 50 个字符以内
- 如果需要，在第二行添加详细描述

## 🔄 Pull Request 流程

### PR 准备清单

在提交 PR 之前，请确保：

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
- [ ] 没有合并冲突

### PR 模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 测试改进
- [ ] 其他

## 变更描述
简要描述这个 PR 的变更内容

## 相关 Issue
关闭 #(issue 编号)

## 测试
描述您如何测试了这���变更

## 截图
如果适用，添加截图展示变更效果

## 检查清单
- [ ] 我的代码遵循了项目的代码规范
- [ ] 我已经进行了自我代码审查
- [ ] 我已经添加了必要的注释
- [ ] 我已经添加了相应的测试
- [ ] 新的和现有的单元测试都通过了
- [ ] 我的变更不会产生新的警告
- [ ] 我已经更新了相关文档
```

### PR 审查流程

1. **自动检查**
   - CI/CD 流水线运行
   - 代码质量检查
   - 测试执行

2. **人工审查**
   - 代码逻辑审查
   - 设计模式检查
   - 性能影响评估

3. **反馈处理**
   - 根据审查意见修改
   - 回复审查评论
   - 更新 PR

4. **合并**
   - 获得批准后合并
   - 删除功能分支
   - 更新本地仓库

## 👀 代码审查

### 审查标准

#### 功能性
- 代码是否实现了预期功能
- 边界情况是否处理
- 错误处理是否完善
- 性能是否可接受

#### 代码质量
- 代码是否易读易懂
- 变量和函数命名是否清晰
- 是否遵循项目规范
- 是否有代码重复

#### 安全性
- 输入验证是否充分
- 敏感信息是否保护
- 权限检查是否正确
- 安全漏洞是否修复

#### 测试
- 测试覆盖率是否足够
- 测试是否有意义
- 边界情况是否测试
- 测试是否可维护

### 审查礼仪

**作为审查者：**
- 保持建设性和友好的语调
- 解释"为什么"而不仅仅是"什么"
- 提供具体的改进建议
- 认可好的代码和改进

**作为被审查者：**
- 接受反馈并积极回应
- 不要把批评当作个人攻击
- 解释您的设计决策
- 感谢审查者的时间和努力

### 审查评论示例

**好的评论：**
```
建议使用 useMemo 来优化这个计算，因为它在每次渲染时都会重新计算：

```typescript
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => acc + item.value, 0);
}, [items]);
```

这样可以避免不必要的重复计算。
```

**不好的评论：**
```
这里有性能问题。
```

## 🌟 社区准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

以下行为被认为是不可接受的：

- 使用性别化语言或图像，以及不受欢迎的性关注或挑逗
- 恶意评论、侮辱/贬损评论，以及个人或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 在专业环境中可能被认为不合适的其他行为

### 执行

项目维护者有权利和责任删除、编辑或拒绝与本行为准则不符的评论、提交、代码、wiki 编辑、问题和其他贡献。

## 🆘 获得帮助

### 联系方式

- **GitHub Issues**: 报告 bug 或请求功能
- **GitHub Discussions**: 一般讨论和问题
- **Email**: [your-email@example.com]

### 常见问题

#### Q: 我是新手，可以贡献吗？
A: 当然可以！我们欢迎所有级别的贡献者。可以从标记为 "good first issue" 的问题开始。

#### Q: 我不会编程，还能贡献吗？
A: 绝对可以！您可以：
- 改进文档
- 报告 bug
- 提供设计建议
- 翻译内容
- 测试新功能

#### Q: 我的 PR 被拒绝了，怎么办？
A: 不要气馁！查看反馈意见，进行相应修改，或者在讨论中寻求澄清。

#### Q: 如何跟上项目的最新动态？
A: 您可以：
- Watch 这个仓库
- 关注 Releases
- 参与 Discussions
- 查看 Project Board

### 学习资源

- [Git 基础教程](https://git-scm.com/book)
- [GitHub 使用指南](https://docs.github.com/)
- [React 官方文档](https://react.dev/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

## 🎉 贡献者认可

我们感谢所有贡献者的努力！贡献者将被列在：

- README.md 的贡献者部分
- 项目的 Contributors 页面
- Release Notes 中的特别感谢

### 贡献者类型

我们使用 [All Contributors](https://allcontributors.org/) 规范来认可贡献：

- 💻 代码贡献
- 📖 文档贡献
- 🎨 设计贡献
- 🐛 Bug 报告
- 💡 想法和建议
- 🤔 答疑解惑
- 📢 宣传推广
- 🔍 测试
- 🌍 翻译

## 📄 许可证

通过贡献代码，您同意您的贡献将在与项目相同的 [MIT 许可证](LICENSE) 下获得许可。

---

再次感谢您的贡献！每一个贡献都让这个项目变得更好。

**最后更新**: 2023-09-06