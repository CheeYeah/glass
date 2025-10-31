# i18next 国际化重构实施计划

## 项目概述

本项目是一个Electron应用程序，现需要将现有的国际化方案完全重构为基于i18next的解决方案。i18next是一个功能强大、生态丰富的国际化框架，支持多种框架和环境，非常适合本项目的需求。

## 实施阶段

### 阶段一：环境准备与基础配置

**目标**：安装必要依赖并创建i18next基础配置

**任务列表**：
- [x] 切换到Node.js v20版本 (`nvm use 20`)
- [x] 安装i18next核心依赖：
  - `i18next` - 核心国际化框架
  - `i18next-browser-languagedetector` - 浏览器语言检测插件
- [x] 安装其他必要插件：
  - `i18next-resources-to-backend` - 资源加载插件
  - `electron-store` - 用于持久化语言设置
- [x] 创建新的i18next配置文件
- [x] 设计资源文件结构和命名规范

**技术实现**：

```javascript
// src/utils/i18nextConfig.js
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import Store from 'electron-store';

const store = new Store();

export const initI18next = async () => {
  // 从存储中获取保存的语言设置
  const savedLanguage = store.get('appLanguage');
  
  await i18next
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace, callback) => {
      import(`../locales/${language}/${namespace}.json`)
        .then(res => {
          callback(null, res.default);
        })
        .catch(err => {
          callback(err, null);
        });
    }))
    .init({
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh-CN'],
      ns: ['common', 'app', 'ask', 'listen', 'settings'],
      defaultNS: 'common',
      fallbackNS: ['common'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        // 自定义语言检测选项
        order: ['navigator', 'localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      debug: process.env.NODE_ENV === 'development',
    });
  
  return i18next;
};

export const changeLanguage = async (language) => {
  await i18next.changeLanguage(language);
  store.set('appLanguage', language);
};

export default i18next;
```

### 阶段二：语言资源迁移

**目标**：将现有语言资源文件转换为i18next兼容格式

**任务列表**：
- [x] 分析现有语言资源结构 (`src/locales/en.json` 和 `src/locales/zh-CN.json`)
- [x] 按照命名空间重构语言资源文件
- [x] 创建新的资源文件目录结构
- [x] 验证资源文件格式正确性

**技术实现**：

**资源文件结构设计**：

```
src/locales/
├── en/
│   ├── common.json       # 通用翻译
│   ├── app.json          # 应用主界面翻译
│   ├── ask.json          # Ask功能翻译
│   ├── listen.json       # Listen功能翻译
│   └── settings.json     # 设置页面翻译
└── zh-CN/
    ├── common.json
    ├── app.json
    ├── ask.json
    ├── listen.json
    └── settings.json
```

**资源文件示例** (`common.json`):

```json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close"
  },
  "loading": {
    "loading": "Loading...",
    "processing": "Processing..."
  },
  "errors": {
    "somethingWentWrong": "Something went wrong",
    "networkError": "Network error"
  }
}
```

### 阶段三：API适配与组件更新

**目标**：更新所有组件以使用新的i18next API

**任务列表**：
- [ ] 创建统一的翻译钩子/函数
- [ ] 更新组件以使用i18next翻译
- [ ] 处理复杂翻译场景（复数、上下文、格式化等）
- [ ] 集成到现有代码库

**技术实现**：

```javascript
// src/utils/useTranslation.js
import { useCallback } from 'react';
import i18next from './i18nextConfig';

// 通用翻译函数
export const t = (key, options = {}) => {
  return i18next.t(key, options);
};

// React钩子版本（如果使用React）
export const useTranslation = (namespace = 'common') => {
  const t = useCallback((key, options = {}) => {
    return i18next.t(key, { ...options, ns: options.ns || namespace });
  }, [namespace]);
  
  const i18n = useCallback(() => i18next, []);
  
  return { t, i18n };
};
```

**组件使用示例**：

```javascript
// 类组件中使用
import { t } from '../utils/useTranslation';

class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>{t('app.title')}</h1>
        <button>{t('buttons.save')}</button>
      </div>
    );
  }
}

// 函数组件中使用
import { useTranslation } from '../utils/useTranslation';

function MyFunctionalComponent() {
  const { t } = useTranslation('app');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('buttons.save', { ns: 'common' })}</button>
    </div>
  );
}
```

### 阶段四：语言切换功能实现

**目标**：实现语言切换界面和功能

**任务列表**：
- [ ] 在设置页面添加语言选择器
- [ ] 实现语言切换逻辑
- [ ] 实现语言更改后的界面更新
- [ ] 持久化保存用户语言偏好

**技术实现**：

```javascript
// src/features/settings/LanguageSelector.js
import { useState } from 'react';
import { changeLanguage, t } from '../../utils/useTranslation';

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(i18next.language);
  
  const handleChange = async (event) => {
    const language = event.target.value;
    setSelectedLanguage(language);
    await changeLanguage(language);
  };
  
  return (
    <div className="language-selector">
      <label>{t('settings.language')}</label>
      <select value={selectedLanguage} onChange={handleChange}>
        <option value="en">{t('languages.english')}</option>
        <option value="zh-CN">{t('languages.chinese')}</option>
      </select>
    </div>
  );
};
```

### 阶段五：测试与优化

**目标**：全面测试国际化功能并进行优化

**任务列表**：
- [ ] 语言切换测试
- [ ] 翻译完整性检查
- [ ] 边缘情况测试（缺失键、不支持的语言等）
- [ ] 性能优化
- [ ] 文档更新

## 已完成工作

- [x] 切换到Node.js v20版本
- [x] 安装i18next核心依赖（i18next, i18next-browser-languagedetector）
- [x] 安装其他必要插件（i18next-resources-to-backend、electron-store）
- [x] 创建i18next核心配置文件
- [x] 创建useTranslation工具函数
- [x] 创建initI18n初始化入口文件
- [x] 设计并创建资源文件目录结构（en和zh-CN语言，多个命名空间）
- [x] 分析现有语言资源结构
- [x] 按照命名空间重构语言资源文件
- [x] 创建shortcuts命名空间翻译文件
- [x] 清理不再使用的文件：删除根目录下的en.json和zh-CN.json文件

## 当前进度

- **整体进度**：50%
- **已完成**：阶段一（环境准备与基础配置）、阶段二（语言资源迁移）
- **下一阶段**：阶段三（API适配与组件更新）

## 下一步行动

1. 创建统一的翻译钩子/函数（如尚未完善）
2. 开始阶段三的API适配工作
3. 更新组件以使用i18next翻译
4. 处理复杂翻译场景（复数、上下文、格式化等）

## 时间估算

| 阶段 | 预计完成时间 |
|------|------------|
| 阶段一 | 1天 |
| 阶段二 | 2天 |
| 阶段三 | 5天 |
| 阶段四 | 2天 |
| 阶段五 | 2天 |
| **总计** | **12天** |

## 风险与挑战

1. **翻译完整性**：确保所有UI元素都被正确翻译
2. **性能优化**：处理大量翻译资源的加载性能
3. **复杂翻译**：处理特殊格式、复数形式等复杂翻译场景
4. **兼容性**：确保在Electron环境中正常工作

## 注意事项

1. 所有新添加的文本必须立即添加到翻译文件中
2. 使用有意义的键名，避免使用数字或无意义字符
3. 对于动态内容，使用i18next的插值功能
4. 测试时确保检查所有语言的显示效果