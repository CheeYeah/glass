// src/utils/i18nLitMixin.js
import { i18nEventEmitter } from './i18nextConfig';
import i18next from './i18nextConfig';

/**
 * LitElement组件的i18n更新混入
 * 为所有使用翻译的LitElement组件提供语言变化监听和自动更新功能
 */
export const i18nLitMixin = (superClass) => class extends superClass {
  constructor() {
    super();
    this._languageChangeHandler = null;
  }

  connectedCallback() {
    super.connectedCallback();
    
    // 创建语言变化处理函数
    this._languageChangeHandler = () => {
      // 当语言更改时，强制组件重新渲染
      this.requestUpdate();
    };
    
    // 监听语言变化事件
    i18nEventEmitter.on('languageChanged', this._languageChangeHandler);
    
    // 监听全局自定义事件
    window.addEventListener('languageChanged', this._languageChangeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    // 移除语言变化事件监听
    if (this._languageChangeHandler) {
      i18nEventEmitter.removeListener('languageChanged', this._languageChangeHandler);
      window.removeEventListener('languageChanged', this._languageChangeHandler);
      this._languageChangeHandler = null;
    }
  }
};

/**
 * 为现有LitElement组件添加语言更新能力的工具函数
 * @param {HTMLElement} element - LitElement组件实例
 */
export const enhanceWithI18nUpdates = (element) => {
  if (!element || typeof element.requestUpdate !== 'function') {
    return;
  }

  const updateHandler = () => {
    element.requestUpdate();
  };

  // 添加事件监听
  i18nEventEmitter.on('languageChanged', updateHandler);
  window.addEventListener('languageChanged', updateHandler);

  // 为元素添加清理方法
  const originalDisconnected = element.disconnectedCallback;
  element.disconnectedCallback = function() {
    if (originalDisconnected) {
      originalDisconnected.call(this);
    }
    i18nEventEmitter.removeListener('languageChanged', updateHandler);
    window.removeEventListener('languageChanged', updateHandler);
  };

  return element;
};

/**
 * 手动触发所有已注册组件的语言更新
 * 在需要强制刷新所有UI翻译时使用
 */
export const forceI18nUpdate = () => {
  // 发射语言变化事件
  i18nEventEmitter.emit('languageChanged', i18next.language);
  
  // 同时触发全局自定义事件
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: i18next.language } 
  }));
};