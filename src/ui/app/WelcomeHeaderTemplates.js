import { html } from '../assets/lit-core-2.7.4.min.js';
import { t } from '../../utils/useTranslation.js';

export const welcomeHeaderTemplate = (host) => html`
    <div class="container">
        <button class="close-button" @click=${host.handleClose}>×</button>
        <div class="header-section">
            <div class="title">${t('app.title')}</div>
            <div class="subtitle">${t('welcome.chooseConnection')}</div>
        </div>
        <div class="option-card">
            <div class="divider"></div>
            <div class="option-content">
                <div class="option-title">${t('welcome.quickStart')}</div>
                <div class="option-description">
                    ${t('welcome.quickStartDescription')}
                </div>
            </div>
            <button class="action-button" @click=${host.loginCallback}>
                <div class="button-text">${t('welcome.openBrowserLogin')}</div>
                <div class="button-icon"><div class="arrow-icon"></div></div>
            </button>
        </div>
        <div class="option-card">
            <div class="divider"></div>
            <div class="option-content">
                <div class="option-title">${t('welcome.personalApiKeys')}</div>
                <div class="option-description">
                    ${t('welcome.personalApiKeysDescription')}
                </div>
            </div>
            <button class="action-button" @click=${host.apiKeyCallback}>
                <div class="button-text">${t('welcome.enterApiKey')}</div>
                <div class="button-icon"><div class="arrow-icon"></div></div>
            </button>
        </div>
        <div class="footer">
            ${t('welcome.privacyNotice')}
            <span class="footer-link" @click=${host.openPrivacyPolicy}>${t('welcome.seeDetails')}</span>
        </div>
    </div>
`;
