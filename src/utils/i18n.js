const fs = require('fs');
const path = require('path');

class I18n {
  constructor() {
    this.locales = {};
    this.currentLocale = 'en';
    this.loadLocales();
  }

  loadLocales() {
    const localesPath = path.join(__dirname, '../locales');
    
    if (!fs.existsSync(localesPath)) {
      console.warn('Locales directory not found, creating default locales...');
      this.createDefaultLocales(localesPath);
    }

    const localeFiles = fs.readdirSync(localesPath);
    
    localeFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const localeCode = path.basename(file, '.json');
        const filePath = path.join(localesPath, file);
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          this.locales[localeCode] = JSON.parse(content);
        } catch (error) {
          console.error(`Error loading locale ${localeCode}:`, error);
        }
      }
    });

    // Set default locale if no locales loaded
    if (Object.keys(this.locales).length === 0) {
      this.createDefaultLocales(localesPath);
    }
  }

  createDefaultLocales(localesPath) {
    if (!fs.existsSync(localesPath)) {
      fs.mkdirSync(localesPath, { recursive: true });
    }

    const defaultEn = {
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        confirm: "Confirm",
        close: "Close"
      },
      app: {
        title: "Glass",
        description: "Cl*ely for Free",
        settings: "Settings",
        help: "Help",
        about: "About"
      },
      ask: {
        title: "Ask Glass",
        placeholder: "Ask me anything...",
        send: "Send",
        clear: "Clear",
        thinking: "Thinking...",
        noMessages: "No messages yet. Start a conversation!"
      },
      settings: {
        title: "Settings",
        general: "General",
        appearance: "Appearance",
        language: "Language",
        api: "API Settings",
        about: "About"
      }
    };

    const defaultZh = {
      common: {
        loading: "加载中...",
        error: "错误",
        success: "成功",
        cancel: "取消",
        save: "保存",
        delete: "删除",
        edit: "编辑",
        confirm: "确认",
        close: "关闭"
      },
      app: {
        title: "Glass",
        description: "Cl*ely for Free",
        settings: "设置",
        help: "帮助",
        about: "关于"
      },
      ask: {
        title: "询问 Glass",
        placeholder: "问我任何问题...",
        send: "发送",
        clear: "清空",
        thinking: "思考中...",
        noMessages: "还没有消息。开始对话吧！"
      },
      settings: {
        title: "设置",
        general: "通用",
        appearance: "外观",
        language: "语言",
        api: "API 设置",
        about: "关于"
      }
    };

    fs.writeFileSync(path.join(localesPath, 'en.json'), JSON.stringify(defaultEn, null, 2));
    fs.writeFileSync(path.join(localesPath, 'zh-CN.json'), JSON.stringify(defaultZh, null, 2));
    
    this.locales.en = defaultEn;
    this.locales['zh-CN'] = defaultZh;
  }

  setLocale(locale) {
    if (this.locales[locale]) {
      this.currentLocale = locale;
      return true;
    }
    return false;
  }

  getLocale() {
    return this.currentLocale;
  }

  t(key, defaultValue = '') {
    const keys = key.split('.');
    let value = this.locales[this.currentLocale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = this.locales.en;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return defaultValue || key;
          }
        }
      }
    }
    
    return value || defaultValue || key;
  }

  getAvailableLocales() {
    return Object.keys(this.locales);
  }
}

// Create singleton instance
const i18n = new I18n();

module.exports = i18n;