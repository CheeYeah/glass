import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import Store from 'electron-store';

const store = new Store();

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

export const initI18next = async () => {
  // 从存储中获取保存的语言设置
  const savedLanguage = store.get('appLanguage');
  
  await i18next
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace, callback) => {
      // 动态导入语言资源文件
      import(`../locales/${language}/${namespace}.json`)
        .then(res => {
          callback(null, res.default);
        })
        .catch(err => {
          console.warn(`Failed to load namespace ${namespace} for language ${language}:`, err);
          // 尝试加载默认命名空间作为回退
          if (namespace !== 'common') {
            import(`../locales/${language}/common.json`)
              .then(res => callback(null, res.default))
              .catch(() => callback(null, {}));
          } else {
            callback(null, {});
          }
        });
    }))
    .init({
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh-CN'],
      ns: supportedNamespaces,
      defaultNS: 'common',
      fallbackNS: ['common'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        // 自定义语言检测选项
        order: ['navigator', 'localStorage'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      debug: process.env.NODE_ENV === 'development',
      // 预加载所有命名空间
      preload: ['en', 'zh-CN']
    });
  
  return i18next;
};

export const changeLanguage = async (language) => {
  await i18next.changeLanguage(language);
  store.set('appLanguage', language);
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