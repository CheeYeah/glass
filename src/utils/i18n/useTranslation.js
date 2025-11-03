import { useCallback, useEffect, useState } from 'react';
import i18next from './i18nextConfig';
import { changeLanguage, getCurrentLanguage, i18nEventEmitter } from './i18nextConfig';

// 从i18nextConfig导入预加载资源用于直接回退
import { preloadedResources } from './i18nextConfig';

// 通用翻译函数
export const t = (key, options = {}) => {
  try {
    // 确保命名空间是数组格式
    const ns = options.ns ? (Array.isArray(options.ns) ? options.ns : [options.ns]) : ['common'];
    
    // 1. 首先尝试直接从预加载资源中查找（绕过i18next问题）
    const currentLang = i18next && i18next.isInitialized ? i18next.language : 'en';

    // 按优先级查找：先在指定命名空间，再在所有支持的命名空间
    const allNamespaces = [...ns, 'common', 'app', 'welcome'];
    const uniqueNamespaces = [...new Set(allNamespaces)]; // 去重

    // 首先尝试直接查找键名（支持app.title格式）
    for (const namespace of uniqueNamespaces) {
      if (preloadedResources[currentLang] &&
          preloadedResources[currentLang][namespace] &&
          Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespace], key)) {
        const directValue = preloadedResources[currentLang][namespace][key];
        return directValue;
      }
    }
    
    // 如果直接查找失败，尝试解析键名（支持app.title格式和嵌套键）
    if (key.includes('.')) {
      const keyParts = key.split('.');

      // 支持两层结构：namespace.key
      if (keyParts.length === 2) {
        const [namespacePart, actualKey] = keyParts;

        // 尝试在解析出的命名空间中查找
        if (preloadedResources[currentLang] &&
            preloadedResources[currentLang][namespacePart] &&
            Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespacePart], actualKey)) {
          const directValue = preloadedResources[currentLang][namespacePart][actualKey];
          return directValue;
        }
      }

      // 支持三层结构：namespace.nested.key
      if (keyParts.length === 3) {
        const [namespacePart, nestedPart, actualKey] = keyParts;

        // 尝试在解析出的命名空间和嵌套对象中查找
        if (preloadedResources[currentLang] &&
            preloadedResources[currentLang][namespacePart] &&
            preloadedResources[currentLang][namespacePart][nestedPart] &&
            Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespacePart][nestedPart], actualKey)) {
          const directValue = preloadedResources[currentLang][namespacePart][nestedPart][actualKey];
          return directValue;
        }
      }
    }
    
    // 2. 如果预加载资源中没找到，再尝试使用i18next（作为后备）
    if (i18next && i18next.isInitialized) {
      const result = i18next.t(key, { ...options, ns });
      if (result !== key) {
        return result;
      }
    }
    
    // 3. 如果所有方法都失败，记录详细错误并返回键名
    console.error(
      `CRITICAL: Translation not found anywhere for key '${key}' in languages:`, 
      currentLang,
      'and namespaces:', 
      uniqueNamespaces
    );
    
    // 作为最后的应急措施，检查一下是否预加载资源结构有问题
    if (preloadedResources[currentLang]) {
      // 如果是app.title键，特别检查一下
      if (key === 'app.title') {
        console.log('Specific check for app.title in en/app namespace:', 
          preloadedResources['en'] && 
          preloadedResources['en']['app'] && 
          preloadedResources['en']['app']['title']);
      }
      // 如果是welcome.chooseConnection键，特别检查一下
      if (key === 'welcome.chooseConnection') {
        console.log('Specific check for welcome.chooseConnection in en/welcome namespace:', 
          preloadedResources['en'] && 
          preloadedResources['en']['welcome'] && 
          preloadedResources['en']['welcome']['chooseConnection']);
      }
    }
    
    return key;
  } catch (error) {
    console.error(`Translation error for key '${key}':`, error);
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

    // 同时监听i18next内置事件和我们的自定义事件
    const i18nextListener = i18next.on('languageChanged', updateLanguage);
    const customListener = () => updateLanguage();
    
    i18nEventEmitter.on('languageChanged', customListener);
    
    // 清理函数
    return () => {
      i18nextListener(); // 移除i18next事件监听
      i18nEventEmitter.removeListener('languageChanged', customListener); // 移除自定义事件监听
    };
  }, []);

  const t = useCallback((key, options = {}) => {
    try {
      // 确保keyNamespaces是数组格式
      const keyNamespaces = options.ns ? 
        (Array.isArray(options.ns) ? options.ns : [options.ns]) : 
        nsArray;
      
      
      // 1. 首先尝试直接从预加载资源中查找（绕过i18next问题）
      const currentLang = i18next && i18next.isInitialized ? i18next.language : 'en';

      // 按优先级查找：先在指定命名空间，再在所有支持的命名空间
      const allNamespaces = [...keyNamespaces, 'common', 'app', 'welcome'];
      const uniqueNamespaces = [...new Set(allNamespaces)]; // 去重

      // 首先尝试直接查找键名（支持app.title格式）
      for (const namespace of uniqueNamespaces) {
        if (preloadedResources[currentLang] &&
            preloadedResources[currentLang][namespace] &&
            Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespace], key)) {
          const directValue = preloadedResources[currentLang][namespace][key];
          return directValue;
        }
      }
      
      // 如果直接查找失败，尝试解析键名（支持app.title格式和嵌套键）
      if (key.includes('.')) {
        const keyParts = key.split('.');

        // 支持两层结构：namespace.key
        if (keyParts.length === 2) {
          const [namespacePart, actualKey] = keyParts;

          // 尝试在解析出的命名空间中查找
          if (preloadedResources[currentLang] &&
              preloadedResources[currentLang][namespacePart] &&
              Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespacePart], actualKey)) {
            const directValue = preloadedResources[currentLang][namespacePart][actualKey];
            return directValue;
          }
        }

        // 支持三层结构：namespace.nested.key
        if (keyParts.length === 3) {
          const [namespacePart, nestedPart, actualKey] = keyParts;

          // 尝试在解析出的命名空间和嵌套对象中查找
          if (preloadedResources[currentLang] &&
              preloadedResources[currentLang][namespacePart] &&
              preloadedResources[currentLang][namespacePart][nestedPart] &&
              Object.prototype.hasOwnProperty.call(preloadedResources[currentLang][namespacePart][nestedPart], actualKey)) {
            const directValue = preloadedResources[currentLang][namespacePart][nestedPart][actualKey];
            return directValue;
          }
        }
      }
      
      // 2. 如果预加载资源中没找到，再尝试使用i18next（作为后备）
      if (i18next && i18next.isInitialized) {
        const result = i18next.t(key, { ...options, ns: keyNamespaces });
        if (result !== key) {
          return result;
        }
      }
      
      // 3. 如果所有方法都失败，记录详细错误并返回键名
      console.error(
        `CRITICAL: Translation not found anywhere for key '${key}' in languages:`, 
        currentLang,
        'and namespaces:', 
        uniqueNamespaces
      );
      
      // 作为最后的应急措施，检查一下是否预加载资源结构有问题
      if (preloadedResources[currentLang]) {
        console.log(`Namespaces available in ${currentLang}:`, Object.keys(preloadedResources[currentLang]));
      }
      
      return key;
    } catch (error) {
      console.error(`React hook translation error for key '${key}':`, error);
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