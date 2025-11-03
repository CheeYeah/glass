import { html } from '../assets/lit-core-2.7.4.min.js';
import { t } from '../../utils/i18n/useTranslation.js';

export function getSettingsTemplate(component) {
    const getModelName = (type, modelId) => {
        const models = type === 'llm' ? component.availableLlmModels : component.availableSttModels;
        const model = models.find(m => m.id === modelId);
        return model ? model.name : null;
    };

    const getProviderForModel = (type, modelId) => {
        const models = type === 'llm' ? component.availableLlmModels : component.availableSttModels;
        const model = models.find(m => m.id === modelId);
        return model ? model.provider : null;
    };

    const renderShortcutKeys = (accelerator) => {
        if (!accelerator) return '';
        const keys = accelerator.split('+');
        return keys.map(key => {
            if (key.toLowerCase() === 'command' || key.toLowerCase() === 'cmd') {
                return html`<div class="cmd-key">⌘</div>`;
            }
            return html`<div class="shortcut-key">${key}</div>`;
        });
    };

    const apiKeyManagementHTML = html`
        <div class="api-key-section">
            <div class="provider-key-group">
                <label><strong>OpenAI</strong> API Key</label>
                <input 
                    type="password" 
                    placeholder="${t('settings.enterApiKey')}" 
                    .value="${component.apiKeys.openai}"
                    @input="${(e) => component.handleApiKeyChange('openai', e.target.value)}"
                    ?disabled="${component.saving}"
                />
                <div class="key-buttons">
                    <button class="settings-button" @click="${() => component.handleSaveKey('openai')}" ?disabled="${component.saving}">
                        ${t('settings.save')}
                    </button>
                    <button class="settings-button danger" @click="${() => component.handleClearKey('openai')}" ?disabled="${component.saving}">
                        ${t('settings.clear')}
                    </button>
                </div>
            </div>
            
            <div class="provider-key-group">
                <label><strong>Gemini</strong> API Key</label>
                <input 
                    type="password" 
                    placeholder="${t('settings.enterApiKey')}" 
                    .value="${component.apiKeys.gemini}"
                    @input="${(e) => component.handleApiKeyChange('gemini', e.target.value)}"
                    ?disabled="${component.saving}"
                />
                <div class="key-buttons">
                    <button class="settings-button" @click="${() => component.handleSaveKey('gemini')}" ?disabled="${component.saving}">
                        ${t('settings.save')}
                    </button>
                    <button class="settings-button danger" @click="${() => component.handleClearKey('gemini')}" ?disabled="${component.saving}">
                        ${t('settings.clear')}
                    </button>
                </div>
            </div>
            
            <div class="provider-key-group">
                <label><strong>Anthropic</strong> API Key</label>
                <input 
                    type="password" 
                    placeholder="${t('settings.enterApiKey')}" 
                    .value="${component.apiKeys.anthropic}"
                    @input="${(e) => component.handleApiKeyChange('anthropic', e.target.value)}"
                    ?disabled="${component.saving}"
                />
                <div class="key-buttons">
                    <button class="settings-button" @click="${() => component.handleSaveKey('anthropic')}" ?disabled="${component.saving}">
                        ${t('settings.save')}
                    </button>
                    <button class="settings-button danger" @click="${() => component.handleClearKey('anthropic')}" ?disabled="${component.saving}">
                        ${t('settings.clear')}
                    </button>
                </div>
            </div>
        </div>
    `;

    const modelSelectionHTML = html`
        <div class="model-selection-section">
            <div class="model-select-group">
                <label>LLM Model: <strong>${getModelName('llm', component.selectedLlm) || t('settings.notSet')}</strong></label>
                <button class="settings-button full-width" @click="${() => component.toggleModelList('llm')}" ?disabled="${component.saving || component.availableLlmModels.length === 0}">
                    ${t('settings.changeLlmModel')}
                </button>
                ${component.isLlmListVisible ? html`
                    <div class="model-list">
                        ${component.availableLlmModels.map(model => {
                            const isOllaMa = getProviderForModel('llm', model.id) === 'ollama';
                            const ollaMaModel = isOllaMa ? component.ollamaModels.find(m => m.name === model.id) : null;
                            const isInstalling = component.installingModels[model.id] !== undefined;
                            const installProgress = component.installingModels[model.id] || 0;
                            
                            return html`
                                <div class="model-item ${component.selectedLlm === model.id ? 'selected' : ''}" 
                                     @click="${() => component.selectModel('llm', model.id)}">
                                    <span>${model.name}</span>
                                    ${isOllaMa ? html`
                                        ${isInstalling ? html`
                                            <div class="install-progress">
                                                <div class="install-progress-bar" style="width: ${installProgress}%"></div>
                                            </div>
                                        ` : ollaMaModel?.installed ? html`
                                            <span class="model-status installed">${t('settings.installed')}</span>
                                        ` : html`
                                            <span class="model-status not-installed">${t('settings.clickToInstall')}</span>
                                        `}
                                    ` : ''}
                                </div>
                            `;
                        })}
                    </div>
                ` : ''}
            </div>
            <div class="model-select-group">
                <label>STT Model: <strong>${getModelName('stt', component.selectedStt) || t('settings.notSet')}</strong></label>
                <button class="settings-button full-width" @click="${() => component.toggleModelList('stt')}" ?disabled="${component.saving || component.availableSttModels.length === 0}">
                    ${t('settings.changeSttModel')}
                </button>
                ${component.isSttListVisible ? html`
                    <div class="model-list">
                        ${component.availableSttModels.map(model => {
                            const isWhisper = getProviderForModel('stt', model.id) === 'whisper';
                            const whisperModel = isWhisper && component.providerConfig?.whisper?.sttModels 
                                ? component.providerConfig.whisper.sttModels.find(m => m.id === model.id) 
                                : null;
                            const isInstalling = component.installingModels[model.id] !== undefined;
                            const installProgress = component.installingModels[model.id] || 0;
                            
                            return html`
                                <div class="model-item ${component.selectedStt === model.id ? 'selected' : ''}" 
                                     @click="${() => component.selectModel('stt', model.id)}">
                                    <span>${model.name}</span>
                                    ${isWhisper ? html`
                                        ${isInstalling ? html`
                                            <div class="install-progress">
                                                <div class="install-progress-bar" style="width: ${installProgress}%"></div>
                                            </div>
                                        ` : whisperModel?.installed ? html`
                                            <span class="model-status installed">${t('settings.installed')}</span>
                                        ` : html`
                                            <span class="model-status not-installed">${t('settings.notInstalled')}</span>
                                        `}
                                    ` : ''}
                                </div>
                            `;
                        })}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return html`
        <div class="settings-container">
            <div class="header-section">
                <div>
                    <h1 class="app-title">${t('app.title')}</h1>
                    <div class="account-info">
                        ${component.firebaseUser
                            ? html`${t('settings.account')}: ${component.firebaseUser.email || t('settings.loggedIn')}`
                            : `${t('settings.account')}: ${t('settings.notLoggedIn')}`
                        }
                    </div>
                </div>
                <div class="invisibility-icon ${component.isContentProtectionOn ? 'visible' : ''}" title="${t('settings.invisibilityOn')}">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.785 7.41787C8.7 7.41787 7.79 8.19371 7.55667 9.22621C7.0025 8.98704 6.495 9.05121 6.11 9.22037C5.87083 8.18204 4.96083 7.41787 3.88167 7.41787C2.61583 7.41787 1.58333 8.46204 1.58333 9.75121C1.58333 11.0404 2.61583 12.0845 3.88167 12.0845C5.08333 12.0845 6.06333 11.1395 6.15667 9.93787C6.355 9.79787 6.87417 9.53537 7.51 9.94954C7.615 11.1454 8.58333 12.0845 9.785 12.0845C11.0508 12.0845 12.0833 11.0404 12.0833 9.75121C12.0833 8.46204 11.0508 7.41787 9.785 7.41787ZM3.88167 11.4195C2.97167 11.4195 2.2425 10.6729 2.2425 9.75121C2.2425 8.82954 2.9775 8.08287 3.88167 8.08287C4.79167 8.08287 5.52083 8.82954 5.52083 9.75121C5.52083 10.6729 4.79167 11.4195 3.88167 11.4195ZM9.785 11.4195C8.875 11.4195 8.14583 10.6729 8.14583 9.75121C8.14583 8.82954 8.875 8.08287 9.785 8.08287C10.695 8.08287 11.43 8.82954 11.43 9.75121C11.43 10.6729 10.6892 11.4195 9.785 11.4195ZM12.6667 5.95954H1V6.83454H12.6667V5.95954ZM8.8925 1.36871C8.76417 1.08287 8.4375 0.931207 8.12833 1.03037L6.83333 1.46204L5.5325 1.03037L5.50333 1.02454C5.19417 0.93704 4.8675 1.10037 4.75083 1.39787L3.33333 5.08454H10.3333L8.91 1.39787L8.8925 1.36871Z" fill="white"/>
                    </svg>
                </div>
            </div>

            ${apiKeyManagementHTML}
            ${modelSelectionHTML}

            <div class="buttons-section" style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 6px; margin-top: 6px;">
                <button class="settings-button full-width" @click="${component.openShortcutEditor}">
                    ${t('settings.editShortcuts')}
                </button>
            </div>

            
            <div class="shortcuts-section">
                ${component.getMainShortcuts().map(shortcut => html`
                    <div class="shortcut-item">
                        <span class="shortcut-name">${shortcut.name}</span>
                        <div class="shortcut-keys">
                            ${renderShortcutKeys(shortcut.accelerator)}
                        </div>
                    </div>
                `)}
            </div>

            <div class="preset-section">
                <div class="preset-header">
                    <span class="preset-title">
                        ${t('settings.myPresets')}
                        <span class="preset-count">(${component.presets.filter(p => p.is_default === 0).length})</span>
                    </span>
                    <span class="preset-toggle" @click="${component.togglePresets}">
                        ${component.showPresets ? '▼' : '▶'}
                    </span>
                </div>
                
                <div class="preset-list ${component.showPresets ? '' : 'hidden'}">
                    ${component.presets.filter(p => p.is_default === 0).length === 0 ? html`
                        <div class="no-presets-message">
                            ${t('settings.noCustomPresets')}<br>
                            <span class="web-link" @click="${component.handlePersonalize}">
                                ${t('settings.createFirstPreset')}
                            </span>
                        </div>
                    ` : component.presets.filter(p => p.is_default === 0).map(preset => html`
                        <div class="preset-item ${component.selectedPreset?.id === preset.id ? 'selected' : ''}"
                             @click="${() => component.handlePresetSelect(preset)}">
                            <span class="preset-name">${preset.title}</span>
                            ${component.selectedPreset?.id === preset.id ? html`<span class="preset-status">${t('settings.selected')}</span>` : ''}
                        </div>
                    `)}
                </div>
            </div>

            <div class="buttons-section">
                <button class="settings-button full-width" @click="${component.handlePersonalize}">
                    <span>${t('settings.personalizeMeetingNotes')}</span>
                </button>
                <button class="settings-button full-width" @click="${component.handleToggleAutoUpdate}" ?disabled="${component.autoUpdateLoading}">
                    <span>${t('settings.automaticUpdates')}: ${component.autoUpdateEnabled ? t('settings.on') : t('settings.off')}</span>
                </button>
                
                <div class="language-selector-section">
                    <label class="settings-label">${t('settings.language')}</label>
                    <select class="language-select" @change="${component.handleLanguageChange}">
                        <option value="en">${t('settings.languages.english')}</option>
                        <option value="zh-CN">${t('settings.languages.chinese')}</option>
                    </select>
                </div>
                
                <div class="move-buttons">
                    <button class="settings-button half-width" @click="${component.handleMoveLeft}">
                        <span>← ${t('settings.move')}</span>
                    </button>
                    <button class="settings-button half-width" @click="${component.handleMoveRight}">
                        <span>${t('settings.move')} →</span>
                    </button>
                </div>
                
                <button class="settings-button full-width" @click="${component.handleToggleInvisibility}">
                    <span>${component.isContentProtectionOn ? t('settings.disableInvisibility') : t('settings.enableInvisibility')}</span>
                </button>
                
                <div class="bottom-buttons">
                    ${component.firebaseUser
                        ? html`
                            <button class="settings-button half-width danger" @click="${component.handleFirebaseLogout}">
                                <span>${t('settings.logout')}</span>
                            </button>
                            `
                        : html`
                            <button class="settings-button half-width" @click="${component.handleUsePicklesKey}">
                                <span>${t('settings.login')}</span>
                            </button>
                            `
                    }
                    <button class="settings-button half-width danger" @click="${component.handleQuit}">
                        <span>${t('settings.quit')}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}