import { LitElement } from '../assets/lit-core-2.7.4.min.js';
import { i18nLitMixin } from '../../utils/i18n/i18nLitMixin.js';
import { initI18next, i18nEventEmitter } from '../../utils/i18n/i18nextConfig.js';
import { welcomeHeaderTemplate } from './WelcomeHeader.template.js';
import { css } from '../assets/lit-core-2.7.4.min.js';

// 导入CSS文件内容
const welcomeHeaderStyles = css`
/* WelcomeHeader Component Styles */
:host {
    display: block;
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
}

.container {
    width: 100%;
    box-sizing: border-box;
    height: auto;
    padding: 24px 16px;
    background: rgba(0, 0, 0, 0.64);
    box-shadow: 0px 0px 0px 1.5px rgba(255, 255, 255, 0.64) inset;
    border-radius: 16px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: inline-flex;
    -webkit-app-region: drag;
}

.close-button {
    -webkit-app-region: no-drag;
    position: absolute;
    top: 16px;
    right: 16px;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    z-index: 10;
    font-size: 16px;
    line-height: 1;
    padding: 0;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
}

.header-section {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
}

.title {
    color: white;
    font-size: 18px;
    font-weight: 700;
}

.subtitle {
    color: white;
    font-size: 14px;
    font-weight: 500;
}

.option-card {
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
}

.divider {
    width: 1px;
    align-self: stretch;
    position: relative;
    background: #bebebe;
    border-radius: 2px;
}

.option-content {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
    min-width: 0;
}

.option-title {
    color: white;
    font-size: 14px;
    font-weight: 700;
}

.option-description {
    color: #dcdcdc;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0.12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.action-button {
    -webkit-app-region: no-drag;
    padding: 8px 10px;
    background: rgba(132.6, 132.6, 132.6, 0.8);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.16);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-button:hover {
    background: rgba(150, 150, 150, 0.9);
}

.button-text {
    color: white;
    font-size: 12px;
    font-weight: 600;
}

.button-icon {
    width: 12px;
    height: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.arrow-icon {
    border: solid white;
    border-width: 0 1.2px 1.2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
}

.footer {
    align-self: stretch;
    text-align: center;
    color: #dcdcdc;
    font-size: 12px;
    font-weight: 500;
    line-height: 19.2px;
}

.footer-link {
    text-decoration: underline;
    cursor: pointer;
    -webkit-app-region: no-drag;
}
`;

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