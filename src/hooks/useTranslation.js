import { useCallback } from 'react';

/**
 * @typedef {Object} TranslationHook
 * @property {(key: string, placeholders?: Record<string, string>) => string} t
 */

/**
 * @returns {TranslationHook}
 */
export const useTranslation = () => {
  const t = useCallback((key, placeholders = {}) => {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      return chrome.i18n.getMessage(key, Object.values(placeholders));
    }

    console.warn(`Translation key "${key}" not found - chrome.i18n not available`);
    return key;
  }, []);

  return { t };
}; 