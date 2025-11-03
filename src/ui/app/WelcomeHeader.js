import { LitElement } from '../assets/lit-core-2.7.4.min.js';
import { i18nLitMixin } from '../../utils/i18nLitMixin.js';
import { initI18next, i18nEventEmitter } from '../../utils/i18nextConfig.js';
import { welcomeHeaderStyles } from './WelcomeHeaderStyles.js';
import { welcomeHeaderTemplate } from './WelcomeHeaderTemplates.js';

export class WelcomeHeader extends i18nLitMixin(LitElement) {
    static styles = welcomeHeaderStyles;

    static properties = {
        loginCallback: { type: Function },
        apiKeyCallback: { type: Function },
    };

    constructor() {
        super();
        this.loginCallback = () => {};
        this.apiKeyCallback = () => {};
        this.handleClose = this.handleClose.bind(this);
        
        // 初始化i18next
        this.initializeI18n();
    }
    
    async initializeI18n() {
        try {
            await initI18next();
            // 初始化完成后更新组件
            this.requestUpdate();
        } catch (error) {
            console.error('Failed to initialize i18next in WelcomeHeader:', error);
        }
    }
    
    connectedCallback() {
        super.connectedCallback();
        
        // 监听语言变化事件
        this.languageChangeListener = () => {
          this.requestUpdate();
        };
        
        i18nEventEmitter.on('languageChanged', this.languageChangeListener);
        
        // 额外监听来自主进程的语言变化事件
        if (window.api?.common?.onLanguageChanged) {
            this._mainProcessLanguageChangeListener = () => {
                console.log('Language changed event received from main process');
                this.requestUpdate();
            };
            window.api.common.onLanguageChanged(this._mainProcessLanguageChangeListener);
        }
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        
        // 清理语言变化事件监听器
        if (this.languageChangeListener) {
          i18nEventEmitter.removeListener('languageChanged', this.languageChangeListener);
        }
        
        // 清理主进程语言变化事件监听
        if (window.api?.common?.removeOnLanguageChanged && this._mainProcessLanguageChangeListener) {
            window.api.common.removeOnLanguageChanged(this._mainProcessLanguageChangeListener);
            this._mainProcessLanguageChangeListener = null;
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        this.dispatchEvent(new CustomEvent('content-changed', { bubbles: true, composed: true }));
    }

    handleClose() {
        if (window.api?.common) {
            window.api.common.quitApplication();
        }
    }

    render() {
        return welcomeHeaderTemplate(this);
    }

    openPrivacyPolicy() {
        console.log('🔊 openPrivacyPolicy WelcomeHeader');
        if (window.api?.common) {
            window.api.common.openExternal('https://pickle.com/privacy-policy');
        }
    }
}

customElements.define('welcome-header', WelcomeHeader);