import enLocale from './locales/en.json';
import esLocale from './locales/es.json';
import type { GuidanceMessage } from '../macros';

/**
 * Supported locales
 */
export type Locale = 'en' | 'es';

/**
 * Locale data structure
 */
export interface LocaleData {
  guidance: {
    mealTiming: Record<string, string>;
    micronutrient: Record<string, string>;
    hydration: Record<string, string>;
    allergySwap: Record<string, string>;
    lifestyle: Record<string, string>;
  };
  validation: Record<string, string>;
  disclaimer: Record<string, string>;
}

/**
 * Available locales with their data
 */
const LOCALES: Record<Locale, LocaleData> = {
  en: enLocale as LocaleData,
  es: esLocale as LocaleData
};

/**
 * Default locale
 */
const DEFAULT_LOCALE: Locale = 'en';

/**
 * Current active locale (can be changed at runtime)
 */
let currentLocale: Locale = DEFAULT_LOCALE;

/**
 * Detect user's preferred locale from browser
 */
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact match first
  if (browserLang === 'es' || browserLang === 'es-es') {
    return 'es';
  }
  
  // Check for language prefix match
  if (browserLang.startsWith('es-')) {
    return 'es';
  }
  
  // Default to English
  return 'en';
}

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
  if (!LOCALES[locale]) {
    console.warn(`Locale '${locale}' not supported, falling back to '${DEFAULT_LOCALE}'`);
    currentLocale = DEFAULT_LOCALE;
    return;
  }
  
  currentLocale = locale;
  
  // Store preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('diet-calculator-locale', locale);
  }
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): Locale {
  return currentLocale;
}

/**
 * Get stored locale preference from localStorage
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const stored = localStorage.getItem('diet-calculator-locale');
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored as Locale;
  }
  
  return null;
}

/**
 * Initialize locale from stored preference or browser detection
 */
export function initializeLocale(): void {
  const storedLocale = getStoredLocale();
  const detectedLocale = detectUserLocale();
  
  setLocale(storedLocale || detectedLocale);
}

/**
 * Simple token replacement function
 * Replaces {token} with values from replacements object
 */
function replaceTokens(
  template: string, 
  replacements?: Record<string, string | number>
): string {
  if (!replacements) {
    return template;
  }
  
  return template.replace(/\{(\w+)\}/g, (match, token) => {
    const value = replacements[token];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get localized message by key path
 */
function getMessageByPath(locale: LocaleData, keyPath: string): string | undefined {
  const parts = keyPath.split('.');
  let current: unknown = locale;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translate a guidance message using the current locale
 */
export function translateGuidanceMessage(message: GuidanceMessage): string {
  const locale = LOCALES[currentLocale];
  
  // Get the template from the locale data
  const template = getMessageByPath(locale, message.key);
  
  if (!template) {
    // Fallback to English if translation not found
    const fallbackTemplate = getMessageByPath(LOCALES[DEFAULT_LOCALE], message.key);
    
    if (!fallbackTemplate) {
      // Ultimate fallback: return a readable version of the key
      return message.key.replace(/[._]/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
    }
    
    return replaceTokens(fallbackTemplate, message.replacements);
  }
  
  return replaceTokens(template, message.replacements);
}

/**
 * Get available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(LOCALES) as Locale[];
}

/**
 * Get locale display names
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    en: 'English',
    es: 'Español'
  };
  
  return displayNames[locale] || locale;
}

/**
 * Translate a validation or disclaimer message
 */
export function translateValidationMessage(key: string, replacements?: Record<string, string | number>): string {
  const locale = LOCALES[currentLocale];
  
  // Try validation messages first
  let template = locale.validation[key];
  
  // Try disclaimer messages if not found in validation
  if (!template && key.startsWith('disclaimer.')) {
    const disclaimerKey = key.replace('disclaimer.', '');
    template = locale.disclaimer[disclaimerKey];
  }
  
  if (!template) {
    // Fallback to English
    const fallbackLocale = LOCALES[DEFAULT_LOCALE];
    template = fallbackLocale.validation[key] || fallbackLocale.disclaimer[key.replace('disclaimer.', '')];
  }
  
  if (!template) {
    // Ultimate fallback
    return key.replace(/[._]/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
  }
  
  return replaceTokens(template, replacements);
}

// Initialize locale on module load
if (typeof window !== 'undefined') {
  initializeLocale();
}
