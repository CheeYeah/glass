import { LitElement } from '../assets/lit-core-2.7.4.min.js';
import { i18nLitMixin } from '../../utils/i18nLitMixin.js';
import { initI18next } from '../../utils/i18nextConfig.js';
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
        
        // 确保i18n初始化
        this.initializeI18n();
    }
    
    async initializeI18n() {
        try {
            await initI18next();
            console.log('i18n initialized in WelcomeHeader');
            // 初始化后请求更新组件
            this.requestUpdate();
        } catch (error) {
            console.error('Failed to initialize i18n in WelcomeHeader:', error);
        }
    }
    
    connectedCallback() {
        super.connectedCallback();
        
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