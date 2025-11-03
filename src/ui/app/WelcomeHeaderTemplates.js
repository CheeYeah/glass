import { html } from '../assets/lit-core-2.7.4.min.js';
import { t } from '../../utils/useTranslation.js';
import { initI18next } from '../../utils/i18nextConfig.js';

// 确保i18next在模板加载时已经初始化
initI18next().catch(error => {
  console.error('Failed to initialize i18next in WelcomeHeaderTemplates:', error);
});

export const welcomeHeaderTemplate = (host) => html`
    <div class="container">
        <button class="close-button" @click=${host.handleClose}>×</button>
        <div class="header-section">
            <div class="title">${t('app.title', { ns: 'app' })}</div>
            <div class="subtitle">${t('welcome.chooseConnection', { ns: 'welcome' })}</div>
        </div>
        <div class="option-card">
            <div class="divider"></div>
            <div class="option-content">
                <div class="option-title">${t('welcome.quickStart', { ns: 'welcome' })}</div>
                <div class="option-description">
                    ${t('welcome.quickStartDescription', { ns: 'welcome' })}
                </div>
            </div>
            <button class="action-button" @click=${host.loginCallback}>
                <div class="button-text">${t('welcome.openBrowserLogin', { ns: 'welcome' })}</div>
                <div class="button-icon"><div class="arrow-icon"></div></div>
            </button>
        </div>
        <div class="option-card">
            <div class="divider"></div>
            <div class="option-content">
                <div class="option-title">${t('welcome.personalApiKeys', { ns: 'welcome' })}</div>
                <div class="option-description">
                    ${t('welcome.personalApiKeysDescription', { ns: 'welcome' })}
                </div>
            </div>
            <button class="action-button" @click=${host.apiKeyCallback}>
                <div class="button-text">${t('welcome.enterApiKey', { ns: 'welcome' })}</div>
                <div class="button-icon"><div class="arrow-icon"></div></div>
            </button>
        </div>
        <div class="footer">
            ${t('welcome.privacyNotice', { ns: 'welcome' })}
            <span class="footer-link" @click=${host.openPrivacyPolicy}>${t('welcome.seeDetails', { ns: 'welcome' })}</span>
        </div>
    </div>
`;
