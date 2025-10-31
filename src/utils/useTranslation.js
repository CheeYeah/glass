import { useCallback, useEffect, useState } from 'react';
import i18next from './i18nextConfig';
import { changeLanguage, getCurrentLanguage } from './i18nextConfig';

// 通用翻译函数
export const t = (key, options = {}) => {
  try {
    return i18next.t(key, options);
  } catch (error) {
    console.warn(`Translation error for key '${key}':`, error);
    return key; // 回退到显示键名
  }
};

// React钩子版本
export const useTranslation = (namespaces = 'common') => {
  const [language, setLanguage] = useState(getCurrentLanguage());
  const [ready, setReady] = useState(false);

  // 确保命名空间始终是数组格式
  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces];

  // 监听语言变化
  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(getCurrentLanguage());
      setReady(true);
    };

    // 初始检查
    updateLanguage();

    // 监听语言变化事件
    const unsubscribe = i18next.on('languageChanged', updateLanguage);
    return () => unsubscribe();
  }, []);

  const t = useCallback((key, options = {}) => {
    try {
      // 优先使用传入的命名空间，否则使用钩子的默认命名空间
      const keyNamespaces = options.ns || nsArray;
      return i18next.t(key, { ...options, ns: keyNamespaces });
    } catch (error) {
      console.warn(`Translation error for key '${key}':`, error);
      return key;
    }
  }, [nsArray]);

  const changeLang = useCallback(async (lang) => {
    try {
      await changeLanguage(lang);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  }, []);

  const i18n = useCallback(() => i18next, []);

  return { 
    t, 
    i18n, 
    changeLanguage: changeLang,
    language,
    ready 
  };
};

// 导出所有相关功能
export { 
  changeLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
  getLanguageDisplayName 
} from './i18nextConfig';

// 用于非React环境的翻译辅助函数
export const translate = t;