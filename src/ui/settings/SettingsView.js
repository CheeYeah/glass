import { css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import { t, changeLanguage } from '../../utils/i18n/useTranslation.js';
import { i18nLitMixin } from '../../utils/i18n/i18nLitMixin.js';
import { getSettingsTemplate } from './SettingsView.template.js';

// import { getOllaProgressTracker } from '../../features/common/services/localProgressTracker.js'; // 제거됨

export class SettingsView extends i18nLitMixin(LitElement) {
    static styles = css`
        * {
            font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 240px;
            height: 100%;
            color: white;
        }

        .settings-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            background: rgba(20, 20, 20, 0.8);
            border-radius: 12px;
            outline: 0.5px rgba(255, 255, 255, 0.2) solid;
            outline-offset: -1px;
            box-sizing: border-box;
            position: relative;
            overflow-y: auto;
            padding: 12px 12px;
            z-index: 1000;
        }

        .settings-container::-webkit-scrollbar {
            width: 6px;
        }

        .settings-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
        }

        .settings-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }

        .settings-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .settings-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            filter: blur(10px);
            z-index: -1;
        }
            
        .settings-button[disabled],
        .api-key-section input[disabled] {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            z-index: 1;
        }

        .title-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .app-title {
            font-size: 13px;
            font-weight: 500;
            color: white;
            margin: 0 0 4px 0;
        }

        .account-info {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
        }

        .invisibility-icon {
            padding-top: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .invisibility-icon.visible {
            opacity: 1;
        }

        .invisibility-icon svg {
            width: 16px;
            height: 16px;
        }

        .shortcuts-section {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 4px 0;
            position: relative;
            z-index: 1;
        }

        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            color: white;
            font-size: 11px;
        }

        .shortcut-name {
            font-weight: 300;
        }

        .shortcut-keys {
            display: flex;
            align-items: center;
            gap: 3px;
        }

        .cmd-key, .shortcut-key {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
        }

        /* Buttons Section */
        .buttons-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: 6px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            z-index: 1;
            flex: 1;
        }

        .settings-button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }

        .settings-button:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .settings-button:active {
            transform: translateY(1px);
        }

        .settings-button.full-width {
            width: 100%;
        }

        .settings-button.half-width {
            flex: 1;
        }

        .settings-button.danger {
            background: rgba(255, 59, 48, 0.1);
            border-color: rgba(255, 59, 48, 0.3);
            color: rgba(255, 59, 48, 0.9);
        }

        .settings-button.danger:hover {
            background: rgba(255, 59, 48, 0.15);
            border-color: rgba(255, 59, 48, 0.4);
        }

        .move-buttons, .bottom-buttons {
            display: flex;
            gap: 4px;
        }

        .api-key-section {
            padding: 6px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .api-key-section input {
            width: 100%;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            border-radius: 4px;
            padding: 4px;
            font-size: 11px;
            margin-bottom: 4px;
            box-sizing: border-box;
        }

        .api-key-section input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        /* Preset Management Section */
        .preset-section {
            padding: 6px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .preset-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .preset-title {
            font-size: 11px;
            font-weight: 500;
            color: white;
        }

        .preset-count {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.5);
            margin-left: 4px;
        }

        .preset-toggle {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            transition: background-color 0.15s ease;
        }

        .preset-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .preset-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 120px;
            overflow-y: auto;
        }

        .preset-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 11px;
            border: 1px solid transparent;
        }

        .preset-item:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .preset-item.selected {
            background: rgba(0, 122, 255, 0.25);
            border-color: rgba(0, 122, 255, 0.6);
            box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
        }

        .preset-name {
            color: white;
            flex: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            font-weight: 300;
        }

        .preset-item.selected .preset-name {
            font-weight: 500;
        }

        .preset-status {
            font-size: 9px;
            color: rgba(0, 122, 255, 0.8);
            font-weight: 500;
            margin-left: 6px;
        }

        .no-presets-message {
            padding: 12px 8px;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 10px;
            line-height: 1.4;
        }

        .no-presets-message .web-link {
            color: rgba(0, 122, 255, 0.8);
            text-decoration: underline;
            cursor: pointer;
        }

        .no-presets-message .web-link:hover {
            color: rgba(0, 122, 255, 1);
        }

        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 11px;
        }

        .loading-spinner {
            width: 12px;
            height: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 6px;
        }

        .hidden {
            display: none;
        }

        .api-key-section, .model-selection-section {
            padding: 8px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .provider-key-group, .model-select-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        label {
            font-size: 11px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.8);
            margin-left: 2px;
        }
        label > strong {
            color: white;
            font-weight: 600;
        }
        .provider-key-group input {
            width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2);
            color: white; border-radius: 4px; padding: 5px 8px; font-size: 11px; box-sizing: border-box;
        }
        .key-buttons { display: flex; gap: 4px; }
        .key-buttons .settings-button { flex: 1; padding: 4px; }
        .model-list {
            display: flex; flex-direction: column; gap: 2px; max-height: 120px;
            overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 4px;
            padding: 4px; margin-top: 4px;
        }
        .model-item { 
            padding: 5px 8px; 
            font-size: 11px; 
            border-radius: 3px; 
            cursor: pointer; 
            transition: background-color 0.15s; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .model-item:hover { background-color: rgba(255,255,255,0.1); }
        .model-item.selected { background-color: rgba(0, 122, 255, 0.4); font-weight: 500; }
        .model-status { 
            font-size: 9px; 
            color: rgba(255,255,255,0.6); 
            margin-left: 8px; 
        }
        .model-status.installed { color: rgba(0, 255, 0, 0.8); }
        .model-status.not-installed { color: rgba(255, 200, 0, 0.8); }
        .install-progress {
            flex: 1;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            margin-left: 8px;
            overflow: hidden;
        }
        .install-progress-bar {
            height: 100%;
            background: rgba(0, 122, 255, 0.8);
            transition: width 0.3s ease;
        }
        
        /* Dropdown styles */
        select.model-dropdown {
            background: rgba(0,0,0,0.2);
            color: white;
            cursor: pointer;
        }
        
        select.model-dropdown option {
            background: #1a1a1a;
            color: white;
        }
        
        select.model-dropdown option:disabled {
            color: rgba(255,255,255,0.4);
        }
            
        /* ────────────────[ GLASS BYPASS ]─────────────── */
        :host-context(body.has-glass) {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            will-change: auto !important;
        }

        :host-context(body.has-glass) * {
            background: transparent !important;
            filter: none !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            outline: none !important;
            border: none !important;
            border-radius: 0 !important;
            transition: none !important;
            animation: none !important;
        }

        :host-context(body.has-glass) .settings-container::before {
            display: none !important;
        }
    `;
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
            const ollaMaStatus = await window.api.settingsView.getOllamaStatus();
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
            const shortcutsResult = await window.api.settingsView.getCurrentShortcuts();
            if (shortcutsResult?.success) {
                this.shortcuts = shortcutsResult.shortcuts || {};
            }
            
            // Load user info
            const userResult = await window.api.settingsView.getCurrentUser();
            if (userResult?.success) {
                this.firebaseUser = userResult.user || null;
            }
            
            // Load API keys
            const keysResult = await window.api.settingsView.getAllKeys();
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
            // Get LLM models
            const llmResult = await window.api.settingsView.getAvailableModels('llm');
            // Get STT models
            const sttResult = await window.api.settingsView.getAvailableModels('stt');

            if (llmResult?.success) {
                this.availableLlmModels = llmResult.models || [];
            }
            if (sttResult?.success) {
                this.availableSttModels = sttResult.models || [];
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
            const result = await window.api.settingsView.saveApiKey({ provider, apiKey: this.apiKeys[provider] });
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
            const result = await window.api.settingsView.removeApiKey(provider);
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
            const result = await window.api.settingsView.setSelectedModel({ type, modelId });
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
            // Note: selectPreset function not found in preload.js, using placeholder
            console.warn('selectPreset function not implemented in preload.js');
            this.selectedPreset = preset;
            console.log('Preset selected:', preset.title);
        } catch (error) {
            console.error('Error selecting preset:', error);
        }
        this.requestUpdate();
    }

    handlePersonalize() {
        if (window.api) {
            window.api.settingsView.openPersonalizePage();
        }
    }

    async handleMoveLeft() {
        if (window.api) {
            await window.api.settingsView.moveWindowStep('left');
        }
    }

    async handleMoveRight() {
        if (window.api) {
            await window.api.settingsView.moveWindowStep('right');
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
            const result = await window.api.settingsView.startFirebaseAuth();
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
            await window.api.settingsView.quitApplication();
        }
    }

    render() {
        return getSettingsTemplate(this);
    }
}

customElements.define('settings-view', SettingsView);