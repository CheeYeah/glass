# CodeBuddy - Glass 项目开发指南

## 项目概述

Glass 是一个基于 Electron 的桌面 AI 助手应用，提供实时语音转录、会议摘要和上下文感知的 AI 交互功能。项目采用模块化架构，支持本地 SQLite 和云端 Firebase 双数据库存储。

**项目特色：**
- 🧠 实时语音转录和会议摘要
- 💬 上下文感知的 AI 问答
- 🔒 本地优先，支持离线使用
- ☁️ 云端同步（Firebase）
- 🖥️ 跨平台支持（Windows、macOS）

## 项目架构

### 整体架构
```
e:\develop\glass\
├── src/                    # Electron 主应用
│   ├── features/           # 功能模块
│   ├── bridge/             # 进程间通信桥接
│   ├── window/             # 窗口管理
│   └── ui/                 # 用户界面
├── pickleglass_web/        # Next.js Web 仪表板
├── functions/             # Firebase Cloud Functions
├── public/                # 静态资源
└── docs/                  # 文档
```

### 核心架构模式

#### 1. 服务-仓库模式 (Service-Repository Pattern)
- **视图层 (Views)**: UI 组件，负责渲染和用户交互
- **服务层 (Services)**: 业务逻辑，协调数据流
- **仓库层 (Repositories)**: 数据访问，支持双数据库（SQLite + Firebase）

#### 2. 双数据库策略
- **SQLite**: 默认本地存储，支持离线功能
- **Firebase**: 云端存储，支持多设备同步
- **自动切换**: 根据用户登录状态自动选择数据源

#### 3. AI 提供商抽象
- 支持多种 AI 模型（OpenAI、Gemini、Claude、本地 Ollama）
- 工厂模式实现，易于扩展新提供商

## 开发环境配置

### 前置要求
- Node.js 20.x.x（必须使用 20.x.x 版本）
- Python 3.x
- Windows 用户：Visual Studio Build Tools

### 快速开始
```bash
# 1. 克隆项目
git clone https://github.com/pickle-com/glass.git
cd glass

# 2. 检查 Node.js 版本
node --version  # 确保是 20.x.x

# 3. 安装依赖并构建
npm run setup

# 4. 启动开发环境
npm start
```

### 使用 nvm 管理 Node.js 版本
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装并使用 Node.js 20
nvm install 20
nvm use 20
```

## 常用命令

### 开发命令
```bash
npm start                    # 启动开发环境
npm run build:renderer       # 构建渲染进程代码
npm run watch:renderer       # 监听渲染进程代码变化
npm run build:web            # 构建 Web 前端
npm run build:all            # 构建所有组件
```

### 构建和打包
```bash
npm run build               # 构建生产版本
npm run build:win          # 构建 Windows 版本
npm run package            # 打包但不发布
npm run publish            # 构建并发布
```

### 代码质量
```bash
npm run lint               # ESLint 代码检查
npm run lint:fix          # 自动修复 ESLint 问题
```

## 代码规范

### 文件结构规范
- 功能模块化：每个功能在 `src/features/` 下独立目录
- 共享代码：公共组件放在 `src/common/`
- 命名约定：使用驼峰命名法，文件扩展名明确

### 代码风格
项目使用 Prettier 和 ESLint 确保代码一致性：

**.prettierrc 配置：**
```json
{
    "semi": true,
    "tabWidth": 4,
    "printWidth": 150,
    "singleQuote": true,
    "trailingComma": "es5",
    "bracketSpacing": true,
    "arrowParens": "avoid",
    "endOfLine": "lf"
}
```

### 提交规范
- 功能分支：`feat/功能描述`
- 修复分支：`fix/问题描述`
- 提交信息：使用英文，描述清晰

## 核心功能模块

### 1. 语音转录 (Listen Feature)
- 实时音频捕获和处理
- 支持多种 STT 提供商
- 自动会议摘要生成

**关键文件：**
- `src/features/listen/listenService.js` - 主服务
- `src/features/listen/stt/` - 语音转文本
- `src/features/listen/summary/` - 摘要生成

### 2. AI 问答 (Ask Feature)
- 上下文感知的 AI 交互
- 多模型支持（OpenAI、Gemini、Claude、Ollama）
- 会话历史管理

**关键文件：**
- `src/features/ask/askService.js` - 问答服务
- `src/features/ask/repositories/` - 数据存储

### 3. 设置管理 (Settings Feature)
- 用户偏好设置
- API 密钥管理
- 模型配置

### 4. 窗口管理 (Window Management)
- 多窗口协调
- 平滑移动动画
- 布局管理

## 数据库设计

### 本地 SQLite 架构
```sql
-- 用户表
users (id, email, display_name, created_at)

-- 会话表
sessions (id, user_id, title, type, created_at, ended_at)

-- 转录表
transcripts (id, session_id, text, timestamp)

-- AI 消息表
ai_messages (id, session_id, content, role, timestamp)

-- 摘要表
summaries (id, session_id, content, created_at)
```

### 数据同步策略
- 未登录用户：仅使用本地 SQLite
- 登录用户：自动同步到 Firebase
- 冲突解决：本地优先，手动合并

## 开发工作流

### 1. 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feat/your-feature

# 2. 开发代码
# 3. 运行测试
npm run lint
npm run build:all

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 5. 推送并创建 PR
git push origin feat/your-feature
```

### 2. 调试技巧

**Electron 主进程调试：**
```javascript
// 在代码中添加调试日志
console.log('[模块名] 调试信息:', data);

// 使用 Chrome DevTools 调试渲染进程
// 在主窗口按 F12 打开开发者工具
```

**Web 前端调试：**
- 访问 `http://localhost:3000` 查看 Web 仪表板
- 使用浏览器开发者工具调试

## 部署和发布

### 构建配置
项目使用 electron-builder 进行打包：

**electron-builder.yml 关键配置：**
- Windows: NSIS 安装程序
- macOS: DMG 安装包
- 自动更新支持
- 代码签名配置

### 发布流程
1. 更新 `package.json` 版本号
2. 运行 `npm run build`
3. 运行 `npm run publish`
4. 在 GitHub Releases 中管理版本

## 故障排除

### 常见问题

**1. Node.js 版本问题**
```bash
# 确保使用 Node.js 20.x.x
node --version
# 如果不是 20.x.x，使用 nvm 切换
nvm use 20
```

**2. 原生模块构建失败**
```bash
# 清理并重新安装
rm -rf node_modules
npm install
```

**3. 数据库连接问题**
- 检查 `src/common/services/sqliteClient.js`
- 确认数据库文件权限
- 查看日志中的错误信息

### 日志查看
- 主进程日志：控制台输出
- 渲染进程日志：开发者工具 Console
- 文件日志：应用数据目录下的日志文件

## 贡献指南

### 代码贡献流程
1. Fork 项目仓库
2. 创建功能分支 (`feat/功能名`)
3. 开发并测试代码
4. 提交 Pull Request
5. 代码审查和合并

### 代码审查要点
- 遵循项目架构模式
- 添加适当的错误处理
- 包含必要的测试
- 更新相关文档

## 相关资源

### 文档链接
- [设计模式指南](./docs/DESIGN_PATTERNS.md)
- [重构计划](./docs/refactor-plan.md)
- [贡献指南](./CONTRIBUTING.md)

### 外部资源
- [Electron 文档](https://www.electronjs.org/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Firebase 文档](https://firebase.google.com/docs)

---

**最后更新：** 2025-10-31  
**维护者：** Pickle Team  
**项目状态：** 活跃开发中

> 提示：在开发过程中遇到问题时，请先查阅相关文档，或在 Discord 社区寻求帮助。