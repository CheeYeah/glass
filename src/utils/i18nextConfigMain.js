// 主进程专用的i18n配置文件
const i18next = require('i18next');
const resourcesToBackend = require('i18next-resources-to-backend');
const { EventEmitter } = require('events');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs');

const store = new Store();

// 创建事件发射器用于语言变化通知
const i18nEventEmitter = new EventEmitter();
i18nEventEmitter.setMaxListeners(100); // 增加监听器上限以避免警告

// 定义所有支持的命名空间
const supportedNamespaces = [
  'common',
  'app',
  'ask',
  'listen',
  'settings',
  'header',
  'stt',
  'summary',
  'welcome',
  'permission',
  'apiKey'
];

const initI18next = async () => {
  // 从存储中获取保存的语言设置
  const savedLanguage = store.get('appLanguage');
  
  // 同步加载语言资源的函数
  const loadResourcesSync = (language, namespace) => {
    const resourcePath = path.join(__dirname, `../locales/${language}/${namespace}.json`);
    try {
      if (fs.existsSync(resourcePath)) {
        const content = fs.readFileSync(resourcePath, 'utf8');
        return JSON.parse(content);
      }
      // 尝试加载默认命名空间作为回退
      if (namespace !== 'common') {
        const commonPath = path.join(__dirname, `../locales/${language}/common.json`);
        if (fs.existsSync(commonPath)) {
          const content = fs.readFileSync(commonPath, 'utf8');
          return JSON.parse(content);
        }
      }
      return {};
    } catch (err) {
      console.warn(`Failed to load namespace ${namespace} for language ${language}:`, err);
      return {};
    }
  };
  
  // 预加载所有语言资源
  const resources = {};
  ['en', 'zh-CN'].forEach(lang => {
    resources[lang] = {};
    supportedNamespaces.forEach(ns => {
      resources[lang][ns] = loadResourcesSync(lang, ns);
    });
  });
  
  await i18next
    .use(resourcesToBackend((language, namespace, callback) => {
      // 在主进程中使用同步加载的资源
      setTimeout(() => {
        callback(null, resources[language]?.[namespace] || {});
      }, 0);
    }))
    .init({
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh-CN'],
      ns: supportedNamespaces,
      defaultNS: 'common',
      fallbackNS: ['common'],
      resources: resources,
      interpolation: {
        escapeValue: false,
      },
      debug: process.env.NODE_ENV === 'development',
    });
  
  return i18next;
};

const changeLanguage = async (language) => {
  await i18next.changeLanguage(language);
  store.set('appLanguage', language);
  
  // 发射语言变化事件
  i18nEventEmitter.emit('languageChanged', language);
  
  // 返回更新后的i18next实例
  return i18next;
};

// 获取当前语言
const getCurrentLanguage = () => {
  return i18next.language;
};

// 获取可用语言列表
const getAvailableLanguages = () => {
  return ['en', 'zh-CN'];
};

// 获取语言显示名称
const getLanguageDisplayName = (languageCode) => {
  const displayNames = {
    'en': 'English',
    'zh-CN': '中文'
  };
  return displayNames[languageCode] || languageCode;
};

// 导出为CommonJS模块
module.exports = {
  initI18next,
  i18nEventEmitter,
  changeLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
  getLanguageDisplayName,
  default: i18next
};