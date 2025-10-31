# 多语言改造实施计划

## 项目概述
为 PickleGlass 项目添加国际化支持，支持中文和英文两种语言。

## 实施阶段

### 第一阶段：基础架构搭建 ✅ 已完成
- [x] 创建语言资源文件 (`src/locales/`)
  - `en.json` - 英文资源
  - `zh-CN.json` - 中文资源
- [x] 创建 i18n 工具 (`src/utils/i18n.js`)
  - 支持动态语言切换
  - 支持语言资源加载
  - 提供翻译函数

### 第二阶段：UI组件国际化
- [x] AskView.js 组件国际化
  - [x] 添加 i18n 导入
  - [x] 替换硬编码文本：
    - "Ask about your screen or audio" → `ask.placeholder`
    - "Submit" → `ask.send`
    - "AI Response" → `ask.title`
    - "Thinking..." → `ask.thinking`
- [x] SettingsView.js 组件国际化 ✅ 已完成
  - [x] 添加 i18n 导入
  - [x] 替换所有硬编码文本：
    - Loading... → `settings.loading`
    - Save/Clear → `settings.save`/`settings.clear`
    - Ollama状态消息 → `settings.ollamaRunning` 等
    - Whisper状态消息 → `settings.whisperEnabled` 等
    - API密钥占位符 → `settings.usingPicklesKey`/`settings.enterApiKey`
    - 模型选择界面 → `settings.changeLlmModel`/`settings.changeSttModel`
    - 快捷键编辑 → `settings.editShortcuts`
    - 预设管理 → `settings.myPresets`/`settings.selected`
    - 按钮文本 → `settings.personalizeMeetingNotes`/`settings.automaticUpdates` 等
    - 账户信息 → `settings.account`/`settings.loggedIn`/`settings.notLoggedIn`
    - 退出按钮 → `settings.logout`/`settings.login`/`settings.quit`
- [ ] 其他 UI 组件国际化

### 第三阶段：设置界面语言切换
- [ ] 在设置界面添加语言选择器
- [ ] 实现语言切换功能
- [ ] 持久化语言设置

### 第四阶段：测试和优化
- [ ] 测试中英文切换功能
- [ ] 检查文本溢出和布局问题
- [ ] 优化翻译内容

## 技术实现细节

### 语言资源结构
```json
{
  "common": {
    "ok": "确定",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除"
  },
  "app": {
    "title": "应用标题",
    "description": "应用描述"
  },
  "ask": {
    "title": "AI 响应",
    "placeholder": "询问关于您的屏幕或音频",
    "send": "发送",
    "thinking": "思考中..."
  },
  "settings": {
    "title": "设置",
    "language": "语言"
  }
}
```

### i18n 工具功能
- 自动检测系统语言
- 支持手动语言切换
- 提供翻译函数 `i18n.t(key)`
- 支持嵌套键访问

## 当前进度
- ✅ 基础架构已搭建
- ✅ AskView.js 国际化已完成
- ✅ SettingsView.js 国际化已完成
- 🔄 准备进行其他UI组件国际化

## 下一步行动
1. 添加语言切换功能到设置界面
2. 测试中英文切换效果
3. 修复可能出现的布局问题
4. 进行其他UI组件的国际化

## 注意事项
- 确保所有硬编码文本都被替换为 i18n 调用
- 注意动态文本的处理（如变量插值）
- 测试不同语言下的文本长度对布局的影响