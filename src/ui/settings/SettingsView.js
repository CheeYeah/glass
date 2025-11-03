import { LitElement } from '../assets/lit-core-2.7.4.min.js';
import { t, changeLanguage } from '../../utils/useTranslation.js';
import { i18nLitMixin } from '../../utils/i18nLitMixin.js';
import { getSettingsTemplate } from './SettingsView.template.js';
import './SettingsView.css';

// import { getOllaProgressTracker } from '../../features/common/services/localProgressTracker.js'; // 제거됨

export class SettingsView extends i18nLitMixin(LitElement) {
    static properties = {
        shortcuts: { type: Object, state: true },
        firebaseUser: { type: Object, state: true },
        isLoading: { type: Boolean, state: true },
        isContentProtectionOn: { type: Boolean, state: true },
        saving: { type: Boolean, state: true },
        providerConfig: { type: Object, state: true },
        apiKeys: { type: Object, state: true },
        availableLlmModels: { type: Array, state: true },
        availableSttModels: { type: Array, state: true },
        selectedLlm: { type: String, state: true },
        selectedStt: { type: String, state: true },
        isLlmListVisible: { type: Boolean },
        isSttListVisible: { type: Boolean },
        presets: { type: Array, state: true },
        selectedPreset: { type: Object, state: true },
        showPresets: { type: Boolean, state: true },
        autoUpdateEnabled: { type: Boolean, state: true },
        autoUpdateLoading: { type: Boolean, state: true },
        // OllaMa related properties
        ollamaStatus: { type: Object, state: true },
        ollamaModels: { type: Array, state: true },
        installingModels: { type: Object, state: true },
        // Whisper related properties
        whisperModels: { type: Array, state: true },
    };

    constructor() {
        super();
        this.shortcuts = {};
        this.firebaseUser = null;
        this.apiKeys = { openai: '', gemini: '', anthropic: '', whisper: '' };
        this.providerConfig = {};
        this.isLoading = true;
        this.isContentProtectionOn = true;
        this.saving = false;
        this.availableLlmModels = [];
        this.availableSttModels = [];
        this.selectedLlm = null;
        this.selectedStt = null;
        this.isLlmListVisible = false;
        this.isSttListVisible = false;
        this.presets = [];
        this.selectedPreset = null;
        this.showPresets = false;
        // OllaMa related
        this.ollamaStatus = { installed: false, running: false };
        this.ollamaModels = [];
        this.installingModels = {}; // { modelName: progress }
        // Whisper related
        this.whisperModels = [];
        this.whisperProgressTracker = null; // Will be initialized when needed
        this.handleUsePicklesKey = this.handleUsePicklesKey.bind(this);
        this.autoUpdateEnabled = true;
        this.autoUpdateLoading = true;
        this.loadInitialData();
    }

    handleLanguageChange(event) {
        const language = event.target.value;
        changeLanguage(language).then(() => {
            // 语言更改成功后，强制更新所有使用翻译的UI元素
            this.requestUpdate(); // 触发组件重新渲染
            
            // 通知应用其他部分语言已更改
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
        }).catch(error => {
            console.error('Failed to change language:', error);
        });
    }

    async loadAutoUpdateSetting() {
        if (!window.api) return;
        this.autoUpdateLoading = true;
        try {
            const enabled = await window.api.settingsView.getAutoUpdate();
            this.autoUpdateEnabled = enabled;
            console.log('Auto-update setting loaded:', enabled);
        } catch (e) {
            console.error('Error loading auto-update setting:', e);
            this.autoUpdateEnabled = true; // fallback
        }
        this.autoUpdateLoading = false;
        this.requestUpdate();
    }

    async handleToggleAutoUpdate() {
        if (!window.api || this.autoUpdateLoading) return;
        this.autoUpdateLoading = true;
        this.requestUpdate();
        try {
            const newValue = !this.autoUpdateEnabled;
            const result = await window.api.settingsView.setAutoUpdate(newValue);
            if (result && result.success) {
                this.autoUpdateEnabled = newValue;
            } else {
                console.error('Failed to update auto-update setting');
            }
        } catch (e) {
            console.error('Error toggling auto-update:', e);
        }
        this.autoUpdateLoading = false;
        this.requestUpdate();
    }

    async loadLocalAIStatus() {
        try {
            // Load OllaMa status
            const ollaMaStatus = await window.api.settingsView.getOllaMaStatus();
            if (ollaMaStatus?.success) {
                this.ollamaStatus = { installed: ollaMaStatus.installed, running: ollaMaStatus.running };
                this.ollamaModels = ollaMaStatus.models || [];
            }
            
            // Load Whisper models status only if Whisper is enabled
            if (this.apiKeys?.whisper === 'local') {
                const whisperModelsResult = await window.api.settingsView.getWhisperInstalledModels();
                if (whisperModelsResult?.success) {
                    const installedWhisperModels = whisperModelsResult.models;
                    if (this.providerConfig?.whisper) {
                        this.providerConfig.whisper.sttModels.forEach(m => {
                            const installedInfo = installedWhisperModels.find(i => i.id === m.id);
                            if (installedInfo) {
                                m.installed = installedInfo.installed;
                            }
                        });
                    }
                }
            }
            
            // Trigger UI update
            this.requestUpdate();
        } catch (error) {
            console.error('Error loading local AI status:', error);
        }
    }

    async loadInitialData() {
        try {
            // Load shortcuts
            const shortcutsResult = await window.api.settingsView.getShortcuts();
            if (shortcutsResult?.success) {
                this.shortcuts = shortcutsResult.shortcuts || {};
            }
            
            // Load user info
            const userResult = await window.api.settingsView.getUserInfo();
            if (userResult?.success) {
                this.firebaseUser = userResult.user || null;
            }
            
            // Load API keys
            const keysResult = await window.api.settingsView.getApiKeys();
            if (keysResult?.success) {
                this.apiKeys = keysResult.keys || { openai: '', gemini: '', anthropic: '', whisper: '' };
            }
            
            // Load provider config
            const configResult = await window.api.settingsView.getProviderConfig();
            if (configResult?.success) {
                this.providerConfig = configResult.config || {};
            }
            
            // Load content protection status
            const protectionResult = await window.api.settingsView.getContentProtectionStatus();
            if (protectionResult?.success) {
                this.isContentProtectionOn = protectionResult.enabled !== false;
            }
            
            // Load presets
            const presetsResult = await window.api.settingsView.getPresets();
            if (presetsResult?.success) {
                this.presets = presetsResult.presets || [];
            }
            
            // Load selected models
            const modelsResult = await window.api.settingsView.getSelectedModels();
            if (modelsResult?.success) {
                this.selectedLlm = modelsResult.llm || null;
                this.selectedStt = modelsResult.stt || null;
            }
            
            // Load available models
            await this.refreshModelData();
            
            // Load auto-update setting
            await this.loadAutoUpdateSetting();
            
            // Load local AI status
            await this.loadLocalAIStatus();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            this.isLoading = false;
            this.requestUpdate();
        }
    }

    async refreshModelData() {
        try {
            const modelsResult = await window.api.settingsView.getAvailableModels();
            if (modelsResult?.success) {
                this.availableLlmModels = modelsResult.llm || [];
                this.availableSttModels = modelsResult.stt || [];
            }
        } catch (error) {
            console.error('Error refreshing model data:', error);
        }
    }

    getMainShortcuts() {
        const mainShortcuts = [
            { name: t('shortcuts.toggleWindow'), accelerator: this.shortcuts.toggleWindow },
            { name: t('shortcuts.toggleInvisibility'), accelerator: this.shortcuts.toggleInvisibility },
            { name: t('shortcuts.toggleRecording'), accelerator: this.shortcuts.toggleRecording },
            { name: t('shortcuts.toggleTranscription'), accelerator: this.shortcuts.toggleTranscription }
        ];
        return mainShortcuts.filter(shortcut => shortcut.accelerator);
    }

    renderShortcutKeys(accelerator) {
        if (!accelerator) return '';
        const keys = accelerator.split('+');
        return keys.map(key => {
            if (key.toLowerCase() === 'command' || key.toLowerCase() === 'cmd') {
                return html`<div class="cmd-key">⌘</div>`;
            }
            return html`<div class="shortcut-key">${key}</div>`;
        });
    }

    openShortcutEditor() {
        if (window.api) {
            window.api.settingsView.openShortcutEditor();
        }
    }

    handleApiKeyChange(provider, value) {
        this.apiKeys[provider] = value;
        this.requestUpdate();
    }

    async handleSaveKey(provider) {
        if (!window.api) return;
        
        this.saving = true;
        this.requestUpdate();
        
        try {
            const result = await window.api.settingsView.saveApiKey(provider, this.apiKeys[provider]);
            if (result?.success) {
                console.log(`${provider} API key saved successfully`);
                // Refresh model data after saving key
                await this.refreshModelData();
            } else {
                console.error(`Failed to save ${provider} API key`);
            }
        } catch (error) {
            console.error(`Error saving ${provider} API key:`, error);
        } finally {
            this.saving = false;
            this.requestUpdate();
        }
    }

    async handleClearKey(provider) {
        if (!window.api) return;
        
        this.saving = true;
        this.requestUpdate();
        
        try {
            const result = await window.api.settingsView.clearApiKey(provider);
            if (result?.success) {
                this.apiKeys[provider] = '';
                console.log(`${provider} API key cleared successfully`);
                // Refresh model data after clearing key
                await this.refreshModelData();
            } else {
                console.error(`Failed to clear ${provider} API key`);
            }
        } catch (error) {
            console.error(`Error clearing ${provider} API key:`, error);
        } finally {
            this.saving = false;
            this.requestUpdate();
        }
    }

    toggleModelList(type) {
        if (type === 'llm') {
            this.isLlmListVisible = !this.isLlmListVisible;
            this.isSttListVisible = false;
        } else {
            this.isSttListVisible = !this.isSttListVisible;
            this.isLlmListVisible = false;
        }
        this.requestUpdate();
    }

    async selectModel(type, modelId) {
        if (!window.api || this.saving) return;
        
        this.saving = true;
        this.requestUpdate();
        
        try {
            const result = await window.api.settingsView.selectModel(type, modelId);
            if (result?.success) {
                if (type === 'llm') {
                    this.selectedLlm = modelId;
                } else {
                    this.selectedStt = modelId;
                }
                console.log(`${type} model selected:`, modelId);
            } else {
                console.error(`Failed to select ${type} model`);
            }
        } catch (error) {
            console.error(`Error selecting ${type} model:`, error);
        } finally {
            this.saving = false;
            this.isLlmListVisible = false;
            this.isSttListVisible = false;
            this.requestUpdate();
        }
    }

    getProviderForModel(type, modelId) {
        const models = type === 'llm' ? this.availableLlmModels : this.availableSttModels;
        const model = models.find(m => m.id === modelId);
        return model ? model.provider : null;
    }

    togglePresets() {
        this.showPresets = !this.showPresets;
        this.requestUpdate();
    }

    async handlePresetSelect(preset) {
        if (!window.api) return;
        
        try {
            const result = await window.api.settingsView.selectPreset(preset.id);
            if (result?.success) {
                this.selectedPreset = preset;
                console.log('Preset selected:', preset.title);
            } else {
                console.error('Failed to select preset');
            }
        } catch (error) {
            console.error('Error selecting preset:', error);
        }
        this.requestUpdate();
    }

    handlePersonalize() {
        if (window.api) {
            window.api.settingsView.openPersonalize();
        }
    }

    async handleMoveLeft() {
        if (window.api) {
            await window.api.settingsView.moveWindow('left');
        }
    }

    async handleMoveRight() {
        if (window.api) {
            await window.api.settingsView.moveWindow('right');
        }
    }

    async handleToggleInvisibility() {
        if (!window.api) return;
        
        try {
            const result = await window.api.settingsView.toggleContentProtection();
            if (result?.success) {
                this.isContentProtectionOn = result.enabled;
                console.log('Content protection toggled:', this.isContentProtectionOn);
            } else {
                console.error('Failed to toggle content protection');
            }
        } catch (error) {
            console.error('Error toggling content protection:', error);
        }
        this.requestUpdate();
    }

    async handleFirebaseLogout() {
        if (!window.api) return;
        
        try {
            const result = await window.api.settingsView.firebaseLogout();
            if (result?.success) {
                this.firebaseUser = null;
                console.log('User logged out successfully');
            } else {
                console.error('Failed to logout');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
        this.requestUpdate();
    }

    async handleUsePicklesKey() {
        if (!window.api) return;
        
        try {
            const result = await window.api.settingsView.usePicklesKey();
            if (result?.success) {
                console.log('Pickles key authentication initiated');
            } else {
                console.error('Failed to initiate Pickles key authentication');
            }
        } catch (error) {
            console.error('Error during Pickles key authentication:', error);
        }
    }

    async handleQuit() {
        if (window.api) {
            await window.api.settingsView.quitApp();
        }
    }

    render() {
        return getSettingsTemplate(this);
    }
}

customElements.define('settings-view', SettingsView);