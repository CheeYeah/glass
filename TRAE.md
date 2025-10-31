# TRAE - Glass 项目开发指南

## 项目概述

Glass 是一个基于 Electron 的桌面 AI 助手应用，提供实时语音转录、会议摘要和上下文感知的 AI 交互功能。项目采用模块化架构，支持本地 SQLite 和云端 Firebase 双数据库存储。

**项目特色：**
- 🧠 实时语音转录和会议摘要
- 💬 上下文感知的 AI 问答
- 🔒 本地优先，支持离线使用
- ☁️ 云端同步（Firebase）
- 🖥️ 跨平台支持（Windows、macOS）
- 🌐 完整的多语言国际化支持（基于i18next）
- 🔄 动态语言切换，无需重启应用

## 项目架构

### 整体架构
```
e:\develop\glass\
├── src/                    # Electron 主应用
│   ├── features/           # 功能模块
│   ├── bridge/             # 进程间通信桥接
│   ├── window/             # 窗口管理
│   ├── ui/                 # UI组件
│   ├── locales/            # 国际化语言资源
│   └── utils/              # 工具函数（含i18n配置）

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
- 支持多种 AI 模型（OpenAI、Gemini、Claude、DeepSeek、本地 Ollama）
- 工厂模式实现，易于扩展新提供商

#### 4. 响应式国际化架构
- 基于i18next的完整翻译系统
- 响应式组件设计（i18nLitMixin）
- 全局语言事件通知机制
- 多语言切换（英文、中文）无需重启应用
- 命名空间隔离的翻译资源
- 语言偏好持久化存储

## 开发环境配置

### 前置要求
- Node.js 20.x.x（必须使用 20.x.x 版本）
- Python 3.x
- Windows 用户：Visual Studio Build Tools 2022
- macOS 用户：Xcode Command Line Tools
- Git

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
# Windows 安装 nvm-windows
# 下载地址: https://github.com/coreybutler/nvm-windows/releases

# macOS/Linux 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装并使用 Node.js 20
nvm install 20
nvm use 20

# 设置默认版本
nvm alias default 20
```

## 常用命令

### 开发命令
```bash
npm start                    # 启动开发环境
npm run build:renderer       # 构建渲染进程代码
npm run watch:renderer       # 监听渲染进程代码变化
npm run build:web            # 构建 Web 前端
npm run build:all            # 构建所有组件
npm run dev:web              # 仅启动 Web 仪表板开发服务器
```

### 构建和打包
```bash
npm run build               # 构建生产版本
npm run build:win           # 构建 Windows 版本
npm run build:mac           # 构建 macOS 版本
npm run package             # 打包但不发布
npm run publish             # 构建并发布
```

### 代码质量
```bash
npm run lint                # ESLint 代码检查
npm run lint:fix           # 自动修复 ESLint 问题
npm run format             # 使用 Prettier 格式化代码
```

## 代码规范

### 文件结构规范
- 功能模块化：每个功能在 `src/features/` 下独立目录
- UI组件：界面组件放在 `src/ui/` 目录
- 共享代码：公共组件和工具放在 `src/common/` 和 `src/utils/`
- 国际化资源：翻译文件放在 `src/locales/` 按语言和命名空间组织
- 进程间通信：桥接代码放在 `src/bridge/` 目录

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
- 重构分支：`refactor/模块描述`
- 提交信息：使用英文，描述清晰，遵循 Angular 提交消息格式
  ```
  <类型>: <简短描述>
  
  [详细描述]
  
  [关联的 Issue/PR 编号]
  ```
- 类型包括：feat, fix, docs, style, refactor, test, build, ci

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
- 多模型支持（OpenAI、Gemini、Claude、DeepSeek、Ollama）
- 会话历史管理

**关键文件：**
- `src/features/ask/askService.js` - 问答服务
- `src/features/ask/repositories/` - 数据存储

### 3. 设置管理 (Settings Feature)
- 用户偏好设置
- API 密钥管理
- 模型配置

**关键文件：**
- `src/features/settings/` - 主服务
- `src/features/settings/repositories/` - 数据存储

### 国际化模块

#### 架构设计
国际化模块采用响应式设计，支持动态语言切换而无需重启应用：

1. **核心组件**：
   - `useTranslation`: 翻译钩子函数，提供t()方法
   - `i18nLitMixin`: LitElement响应式混入，自动响应语言变化
   - `initializeI18n`: 初始化函数，支持错误处理和状态管理
   - `i18nEventEmitter`: 全局事件管理器，处理跨组件语言变化通知

2. **事件通知机制**：
   - 主进程和渲染进程间的语言变化同步
   - 多窗口协同更新
   - 响应式组件自动重新渲染

#### 文件结构
国际化资源文件按语言和命名空间组织，存放在 `src/locales/` 目录下：
- `src/locales/en/`: 英文翻译文件
- `src/locales/zh-CN/`: 中文翻译文件

每个命名空间对应一个JSON文件，例如：
- `common.json`: 通用UI元素翻译
- `settings.json`: 设置页面相关翻译
- `shortcuts.json`: 快捷键设置相关翻译
- `app.json`: 应用主界面翻译
- `ask.json`: 问答功能相关翻译
- `listen.json`: 语音转录功能相关翻译
- `welcome.json`: 欢迎页面相关翻译
- `permission.json`: 权限设置相关翻译
- `apiKey.json`: API密钥配置相关翻译
- `stt.json`: 语音识别相关翻译
- `summary.json`: 摘要功能相关翻译

#### 功能列表
- ✅ 统一的翻译工具函数 (useTranslation)
- ✅ 响应式组件设计 (i18nLitMixin)
- ✅ 全局语言事件通知机制
- ✅ 组件级别的翻译支持
- ✅ 实时语言切换，无需重启应用
- ✅ 用户语言偏好持久化
- ✅ 按命名空间组织翻译内容
- ✅ 支持占位符和格式化
- ✅ 动态导入翻译资源
- ✅ 多进程间语言变化同步

#### 开发流程
1. **初始化项目**：使用 `initializeI18n()` 设置i18n环境
2. **创建组件**：继承 `i18nLitMixin(LitElement)` 以支持响应式翻译
3. **使用翻译**：在模板中使用 `t('namespace.key')` 函数
4. **添加翻译**：在对应语言的命名空间文件中添加翻译键值对
5. **语言切换**：调用 `i18next.changeLanguage()` 触发全局更新

#### 组件集成
所有主要组件已集成国际化支持：
- ✅ PickleGlassApp.js - 应用主组件
- ✅ SettingsView.js - 包含语言选择器
- ✅ ShortCutSettingsView.js - 快捷键设置
- ✅ PermissionHeader.js - 权限提示
- ✅ SttView.js - 语音识别视图
- ✅ MainHeader.js - 主界面标题栏
- ✅ WelcomeHeader.js - 欢迎界面
- ✅ ListenView.js - 监听视图
- ✅ ApiKeyHeader.js - API密钥配置
- ✅ AskView.js - 问答视图
- ✅ SummaryView.js - 摘要视图

#### 使用示例
```javascript
// 1. 导入必要的模块
import { t, useTranslation } from '../../utils/useTranslation';
import { i18nLitMixin } from '../../utils/i18nLitMixin';
import { LitElement, html } from 'lit';

// 2. 继承响应式混入
class MyComponent extends i18nLitMixin(LitElement) {
  render() {
    // 3. 在模板中使用翻译
    return html`
      <h1>${t('common.title')}</h1>
      <p>${t('common.description')}</p>
      <button>${t('common.actions.submit')}</button>
    `;
  }
}
```

### 4. 窗口管理 (Window Management)
- 多窗口协调
- 平滑移动动画
- 布局管理

### 5. 国际化 (Internationalization)
- 基于i18next的完整响应式翻译系统
- 命名空间化的翻译内容管理
- 支持英文和中文双语言
- 实时动态语言切换，无需重启应用
- 自动语言检测和偏好设置
- 语言偏好持久化存储
- 响应式组件设计，自动更新UI
- 跨窗口和跨进程的语言变化同步
- 完善的错误处理和加载状态管理

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

### 2. 国际化开发流程

**添加新文本：**
1. 确保组件继承自 `i18nLitMixin(LitElement)` 以支持响应式翻译
2. 在组件中使用 `t()` 函数标记需要翻译的文本
3. 在对应的命名空间语言文件中添加翻译键值对
4. 确保为所有支持的语言（en、zh-CN）提供翻译

**最佳实践：**
- 使用语义化的键名，避免使用随机字符串
- 对于长文本，考虑拆分成更小的、可重用的部分
- 对于复杂的UI模式，使用组合键名（如 `component.action.submit`）
- 为动态内容使用占位符，避免字符串拼接

**示例：**
```javascript
// 组件中使用
import { t } from '../../utils/useTranslation';
import { i18nLitMixin } from '../../utils/i18nLitMixin';
import { LitElement, html } from 'lit';

class MyComponent extends i18nLitMixin(LitElement) {
  render() {
    // 使用翻译
    const title = t('common.title');
    
    // 带参数的翻译
    const greeting = t('common.greeting', { name: 'User' });
    
    return html`
      <h1>${title}</h1>
      <p>${greeting}</p>
    `;
  }
}
```

**语言切换实现：**
```javascript
// 在设置组件中实现语言切换
import i18next from 'i18next';

async function changeLanguage(language) {
  try {
    await i18next.changeLanguage(language);
    // 保存用户偏好
    await saveLanguagePreference(language);
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
}

### 2. 调试技巧

**Electron 主进程调试：**
```javascript
// 在代码中添加调试日志
console.log('[模块名] 调试信息:', data);

// 在主进程启用远程调试
// 在 main.js 中添加
app.commandLine.appendSwitch('remote-debugging-port', '9222');
```

**渲染进程调试：**
- 在主窗口按 F12 打开开发者工具
- 使用 Chrome DevTools 进行断点调试和性能分析

**Web 前端调试：**
- 访问 `http://localhost:3000` 查看 Web 仪表板
- 使用浏览器开发者工具调试

**国际化调试：**
```javascript
// 检查当前语言设置
console.log('Current language:', i18next.language);

// 检查翻译键是否存在
const exists = i18next.exists('namespace.key');

// 强制重新渲染组件
this.requestUpdate();
```

## 部署和发布

### 构建配置
项目使用 electron-builder 进行打包：

**electron-builder.yml 关键配置：**
- Windows: NSIS 安装程序，支持自动更新
- macOS: DMG 安装包，支持 App Store 提交
- 自动更新支持（基于 Electron Updater）
- 代码签名配置（Windows 和 macOS）
- 多架构支持（x64, arm64）

### 发布流程
1. 更新 `package.json` 版本号（遵循语义化版本规范）
2. 运行 `npm run build:all` 构建所有组件
3. 运行 `npm run publish` 构建并发布
4. 在 GitHub Releases 中管理版本
5. 运行 `npm run publish:win` 或 `npm run publish:mac` 单独发布特定平台版本

### 持续集成/持续部署
项目使用 GitHub Actions 进行 CI/CD：
- 代码提交后自动运行 lint 和构建检查
- 标签发布时自动构建和发布安装包
- 支持多平台并行构建

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
npm install --build-from-source

# Windows 特定问题
npm install --global --production windows-build-tools
```

**3. 数据库连接问题**
- 检查 `src/common/services/sqliteClient.js` 配置
- 确认数据库文件权限
- 查看日志中的错误信息
- 尝试删除数据库文件并重启应用以重新创建

**4. 国际化问题**
- 检查翻译键是否存在于对应的语言文件中
- 确认组件正确继承了 `i18nLitMixin(LitElement)`
- 查看控制台是否有翻译警告
- 检查语言设置是否正确持久化

### 日志查看
- 主进程日志：控制台输出或应用目录下的主日志文件
- 渲染进程日志：开发者工具 Console
- 文件日志：应用数据目录下的日志文件
- 错误报告：可通过 `Help > Report Issue` 提交

## 贡献指南

### 代码贡献流程
1. Fork 项目仓库
2. 创建功能分支（`feat/功能名`、`fix/问题描述`或`refactor/模块描述`）
3. 开发并测试代码
4. 运行 `npm run lint` 和 `npm run build:all` 确保代码质量
5. 提交 Pull Request
6. 代码审查和合并

### 代码审查要点
- 遵循项目架构模式和代码规范
- 添加适当的错误处理和边界条件检查
- 包含必要的测试和文档
- 国际化支持（使用 `t()` 函数和 `i18nLitMixin`）
- 性能优化和内存泄漏检查

### 新功能开发检查清单
- [ ] 功能实现完整
- [ ] 所有组件支持国际化
- [ ] 添加适当的单元测试
- [ ] 更新相关文档
- [ ] 通过所有 lint 和构建检查

## 相关资源

### 文档链接
- [设计模式指南](./docs/DESIGN_PATTERNS.md)
- [重构计划](./docs/refactor-plan.md)
- [贡献指南](./CONTRIBUTING.md)
- [国际化实施计划](./i18n-implementation-plan.md)
- [数据库设计文档](./docs/DATABASE_DESIGN.md)

### 技术栈文档
- [Electron 文档](https://www.electronjs.org/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Firebase 文档](https://firebase.google.com/docs)
- [i18next 文档](https://www.i18next.com/)
- [Lit 文档](https://lit.dev/docs/)
- [SQLite 文档](https://www.sqlite.org/docs.html)

### 社区支持
- 项目 GitHub Discussions
- Discord 社区
- 邮件支持：support@pickle.com

---

**最后更新：** 2024-11-20  
**维护者：** Pickle Team  
**项目状态：** 活跃开发中

> 提示：在开发过程中遇到问题时，请先查阅相关文档，或在 Discord 社区寻求帮助。

**许可协议：** MIT License  
**代码仓库：** [GitHub](https://github.com/pickle-com/glass)

---

### 快速导航

- [项目架构](#项目架构)
- [开发环境配置](#开发环境配置)
- [常用命令](#常用命令)
- [代码规范](#代码规范)
- [核心功能模块](#核心功能模块)
- [国际化模块](#国际化模块)
- [开发工作流](#开发工作流)
- [部署和发布](#部署和发布)
- [故障排除](#故障排除)
- [贡献指南](#贡献指南)
- [相关资源](#相关资源)