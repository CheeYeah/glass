import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 预加载关键翻译资源作为备用
// 注意：这里需要正确的i18next资源格式
const enResource = await import('../../locales/en-US.json', { assert: { type: 'json' } });
const zhCNResource = await import('../../locales/zh-CN.json', { assert: { type: 'json' } });

// 正确的i18next资源格式：每个语言包含所有命名空间
export const preloadedResources = {
  en: enResource.default || enResource,
  'zh-CN': zhCNResource.default || zhCNResource
};

// 自定义事件发射器，不依赖Node.js的EventEmitter
class CustomEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    const eventListeners = this.listeners[event] || [];
    eventListeners.forEach(listener => listener(...args));
    return eventListeners.length > 0;
  }

  removeListener(event, listener) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    return this;
  }

  setMaxListeners(max) {
    // 模拟方法，实际上在我们的实现中不需要
    return this;
  }
}

// 创建自定义事件发射器用于语言变化通知
export const i18nEventEmitter = new CustomEventEmitter();

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
  'apiKey',
  'shortcuts'
];

// 确保initI18next可以从其他组件导入使用
export const initI18next = async () => {
  // 检查i18next是否已经初始化
  if (i18next.isInitialized) {
    console.log('i18next already initialized with language:', i18next.language);
    return i18next;
  }
  
  try {
    // 从localStorage中获取保存的语言设置
    const savedLanguage = localStorage.getItem('appLanguage');
    
    // 使用预加载的资源（直接使用，不再重新创建对象）
  const resources = preloadedResources;
  
  // 详细记录初始化资源信息
  console.log('Using resources for initialization:', JSON.stringify({
    languages: Object.keys(resources),
    enNamespaces: Object.keys(resources.en),
    appKeys: Object.keys(resources.en.app),
    welcomeKeys: Object.keys(resources.en.welcome)
  }, null, 2));
  
  // 验证关键翻译键是否存在
  console.log('Starting i18next initialization with config:', JSON.stringify({
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      resources: 'loaded',
      ns: supportedNamespaces,
      defaultNS: 'common'
    }, null, 2));
    
    await i18next
        .use(LanguageDetector)
        // 使用预加载的资源
        .init({
            lng: savedLanguage || 'en',
            fallbackLng: 'en',
            supportedLngs: ['en', 'zh-CN'],
            resources: resources,
            ns: supportedNamespaces,
            defaultNS: 'common',
            interpolation: {
              escapeValue: false,
            },
            detection: {
              order: ['localStorage', 'navigator'],
              lookupLocalStorage: 'appLanguage',
              caches: ['localStorage'],
            },
            // 简化配置，避免复杂选项
            debug: false, // 关闭调试模式
            initImmediate: true,
            compatibilityJSON: 'v3',
            returnEmptyString: false,
            react: {
              useSuspense: false
            }
        });
        
        // 初始化后验证资源是否正确加载
        console.log('i18next initialization completed.');
        console.log('Available resources:', i18next.options.resources ? Object.keys(i18next.options.resources) : 'none');
        console.log('Current language:', i18next.language);
        console.log('Available namespaces:', i18next.options.ns);
    
    console.log('i18next initialized successfully with language:', i18next.language);
    return i18next;
  } catch (error) {
    console.error('Error initializing i18next:', error);
    // 创建一个简单的后备翻译函数
    if (!window.t) {
      window.t = (key) => key;
    }
    throw error;
  }
};

export const changeLanguage = async (language) => {
  try {
    // 确保i18next已初始化
    if (!i18next.isInitialized) {
      console.warn('i18next not initialized, initializing now...');
      await initI18next();
    }

    // 检查语言是否支持
    const supportedLangs = ['en', 'zh-CN'];
    if (!supportedLangs.includes(language)) {
      console.warn(`Language '${language}' not supported, falling back to 'en'`);
      language = 'en';
    }

    await i18next.changeLanguage(language);
    localStorage.setItem('appLanguage', language);

    // 发射语言变化事件
    i18nEventEmitter.emit('languageChanged', language);

    // 返回更新后的i18next实例
    return i18next;
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18next.language;
};

// 获取可用语言列表
export const getAvailableLanguages = () => {
  return ['en', 'zh-CN'];
};

// 获取语言显示名称
export const getLanguageDisplayName = (languageCode) => {
  const displayNames = {
    'en': 'English',
    'zh-CN': '中文'
  };
  return displayNames[languageCode] || languageCode;
};

export default i18next;