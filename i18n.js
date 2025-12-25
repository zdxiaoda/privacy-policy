// i18n.js - Internationalization handler
(function() {
  'use strict';

  // Available languages
  const AVAILABLE_LANGUAGES = ['zh', 'en', 'ja'];
  const DEFAULT_LANGUAGE = 'zh';
  const STORAGE_KEY = 'preferred_language';

  // Language metadata
  const LANGUAGE_NAMES = {
    'zh': '中文',
    'en': 'English',
    'ja': '日本語'
  };

  let currentLanguage = DEFAULT_LANGUAGE;
  let translations = {};

  // Get nested property from object using dot notation
  function getNestedProperty(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // Detect browser language
  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    return AVAILABLE_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE;
  }

  // Get language from URL parameter
  function getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    return langParam && AVAILABLE_LANGUAGES.includes(langParam) ? langParam : null;
  }

  // Get stored language preference
  function getStoredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && AVAILABLE_LANGUAGES.includes(stored) ? stored : null;
    } catch (e) {
      return null;
    }
  }

  // Store language preference
  function storeLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to store language preference:', e);
    }
  }

  // Determine initial language
  function determineInitialLanguage() {
    return getLanguageFromURL() || getStoredLanguage() || detectBrowserLanguage();
  }

  // Load translation file
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      if (lang !== DEFAULT_LANGUAGE) {
        // Fallback to default language
        return loadTranslations(DEFAULT_LANGUAGE);
      }
      return {};
    }
  }

  // Apply translations to page
  function applyTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = getNestedProperty(translations, key);
      if (translation) {
        element.textContent = translation;
      }
    });

    // Update all elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = getNestedProperty(translations, key);
      if (translation) {
        element.innerHTML = translation;
      }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = getNestedProperty(translations, key);
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Update all elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = getNestedProperty(translations, key);
      if (translation) {
        element.title = translation;
      }
    });

    // Update page title
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.hasAttribute('data-i18n')) {
      const key = titleElement.getAttribute('data-i18n');
      const translation = getNestedProperty(translations, key);
      if (translation) {
        titleElement.textContent = translation;
      }
    }

    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
  }

  // Create language switcher UI
  function createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <label for="language-select"><span data-i18n="common.language">${LANGUAGE_NAMES[currentLanguage]}</span>:</label>
      <select id="language-select" class="language-select">
        ${AVAILABLE_LANGUAGES.map(lang => 
          `<option value="${lang}" ${lang === currentLanguage ? 'selected' : ''}>${LANGUAGE_NAMES[lang]}</option>`
        ).join('')}
      </select>
    `;

    // Insert at the top of body, after h1 if exists
    const h1 = document.querySelector('h1');
    if (h1 && h1.parentNode) {
      h1.parentNode.insertBefore(switcher, h1.nextSibling);
    } else {
      document.body.insertBefore(switcher, document.body.firstChild);
    }

    // Add event listener
    const select = document.getElementById('language-select');
    select.addEventListener('change', async (e) => {
      await changeLanguage(e.target.value);
    });
  }

  // Change language
  async function changeLanguage(lang) {
    if (!AVAILABLE_LANGUAGES.includes(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return;
    }

    currentLanguage = lang;
    storeLanguage(lang);
    
    // Update URL parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);

    // Load and apply translations
    translations = await loadTranslations(lang);
    applyTranslations();

    // Update select element if it exists
    const select = document.getElementById('language-select');
    if (select) {
      select.value = lang;
    }
  }

  // Initialize i18n
  async function init() {
    currentLanguage = determineInitialLanguage();
    translations = await loadTranslations(currentLanguage);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        applyTranslations();
        createLanguageSwitcher();
      });
    } else {
      applyTranslations();
      createLanguageSwitcher();
    }
  }

  // Expose API
  window.i18n = {
    init,
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getAvailableLanguages: () => [...AVAILABLE_LANGUAGES],
    t: (key) => getNestedProperty(translations, key) || key
  };

  // Auto-initialize
  init();
})();
