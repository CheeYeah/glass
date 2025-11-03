import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// 预加载关键翻译资源作为备用
export const preloadedResources = {
  en: {
    app: require('../../locales/en/app.json'),
    welcome: require('../../locales/en/welcome.json'),
    common: require('../../locales/en/common.json'),
    apiKey: require('../../locales/en/apiKey.json')
  },
  'zh-CN': {
    app: require('../../locales/zh-CN/app.json'),
    welcome: require('../../locales/zh-CN/welcome.json'),
    common: require('../../locales/zh-CN/common.json'),
    apiKey: require('../../locales/zh-CN/apiKey.json')
  }
};

// 详细检查预加载资源内容
console.log('Preloaded translation resources languages:', Object.keys(preloadedResources));
console.log('Preloaded translation resources namespaces for en:', Object.keys(preloadedResources.en));
// 检查app命名空间的具体内容
console.log('Preloaded app namespace content:', preloadedResources.en.app);
console.log('Preloaded app.title value:', preloadedResources.en.app.title);
// 检查welcome命名空间的具体内容
console.log('Preloaded welcome namespace content:', preloadedResources.en.welcome);
console.log('Preloaded welcome.chooseConnection value:', preloadedResources.en.welcome.chooseConnection);

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
  'apiKey'
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
  console.log('Verifying key existence - app.title:', 'title' in resources.en.app);
  console.log('Verifying key existence - welcome.chooseConnection:', 'chooseConnection' in resources.en.welcome);
  
  console.log('Starting i18next initialization with config:', JSON.stringify({
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      resources: 'loaded',
      ns: supportedNamespaces,
      defaultNS: 'common'
    }, null, 2));
    
    await i18next
        .use(LanguageDetector)
        // 首先使用预加载的资源
        .init({
            lng: savedLanguage || 'en',
            fallbackLng: 'en',
            supportedLngs: ['en', 'zh-CN'],
            ns: supportedNamespaces,
            defaultNS: 'common',
            fallbackNS: ['common'],
            resources: resources, // 直接使用预加载的资源对象
            interpolation: {
              escapeValue: false,
            },
            detection: {
              // 自定义语言检测选项
              order: ['localStorage', 'navigator'],
              lookupLocalStorage: 'i18nextLng',
              caches: ['localStorage'],
            },
            // 确保所有需要的命名空间都被加载
            load: 'currentOnly',
            // 更宽松的回退策略
            nonExplicitWhitelist: true,
            debug: true, // 始终启用调试模式
            // 立即执行初始化，不延迟
            initImmediate: true,
            // 增加缓存控制
            compatibilityJSON: 'v3',
            // 额外的错误处理选项
            saveMissing: true,
            // 禁用资源加载器，因为我们使用预加载的资源
            // resourcesLoadPath: undefined,
            // 强制资源加载完成后再返回
            returnEmptyString: false,
            // 确保使用正确的资源格式
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
  await i18next.changeLanguage(language);
  localStorage.setItem('appLanguage', language);
  
  // 发射语言变化事件
  i18nEventEmitter.emit('languageChanged', language);
  
  // 返回更新后的i18next实例
  return i18next;
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