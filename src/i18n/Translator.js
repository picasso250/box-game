class Translator {
  constructor() {
    this.language = this.detectLanguage();
    this.translations = {};
  }

  async loadTranslations() {
    const langFile = `src/i18n/${this.language}.json`;
    try {
      const response = await fetch(langFile);
      this.translations = await response.json();
    } catch {
      // Fallback to English if translation file fails to load
      const enResponse = await fetch('src/i18n/en.json');
      this.translations = await enResponse.json();
    }
  }

  detectLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    return userLang.startsWith('zh') ? 'zh' : 'en';
  }

  translate(key) {
    return this.translations[key] || key;
  }
}

