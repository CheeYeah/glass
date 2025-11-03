// i18n初始化入口文件 - 主进程专用
const { initI18next, i18nEventEmitter } = require('./i18nextConfigMain');

// 全局i18n初始化状态
let i18nInitialized = false;
let i18nInitPromise = null;

/**
 * 初始化i18n系统
 * @returns {Promise} i18next实例
 */
const initializeI18n = async () => {
  // 如果已经初始化或正在初始化，直接返回Promise
  if (i18nInitPromise) {
    return i18nInitPromise;
  }

  try {
    // 创建初始化Promise
    i18nInitPromise = initI18next();
    const i18next = await i18nInitPromise;
    i18nInitialized = true;
    console.log('i18next initialized successfully with language:', i18next.language);
    
    // 确保在初始化完成后，i18next的languageChanged事件能正确触发自定义事件
    i18next.on('languageChanged', (lng) => {
      console.log('i18next language changed to:', lng);
      i18nEventEmitter.emit('languageChanged', lng);
    });
    
    return i18next;
  } catch (error) {
    console.error('Failed to initialize i18next:', error);
    i18nInitPromise = null;
    throw error;
  }
};

/**
 * 检查i18n是否已初始化
 * @returns {boolean} 是否已初始化
 */
const isI18nInitialized = () => {
  return i18nInitialized;
};

/**
 * 预加载i18n系统（异步，不阻塞其他操作）
 */
const preloadI18n = () => {
  if (!i18nInitPromise) {
    i18nInitPromise = initializeI18n().catch(error => {
      console.error('i18n preload failed:', error);
      i18nInitPromise = null;
    });
  }
};

// 导出为CommonJS模块
module.exports = {
  initializeI18n,
  isI18nInitialized,
  preloadI18n
};