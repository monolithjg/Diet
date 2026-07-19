import React, { useState, useEffect } from 'react';
void React;
import { cn } from '../../lib/utils';
import {
  setLocale,
  getCurrentLocale,
  getAvailableLocales,
  getLocaleDisplayName,
  type Locale
} from '../../lib/cge/i18n';

interface LocaleSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'toggle';
  showFlag?: boolean;
}

const getLocaleFlag = (locale: Locale): string => {
  const flags: Record<Locale, string> = {
    en: '🇺🇸',
    es: '🇪🇸'
  };
  return flags[locale] || '🌐';
};

export function LocaleSwitcher({
  className,
  variant = 'dropdown',
  showFlag = true
}: LocaleSwitcherProps) {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>(getCurrentLocale());
  const [isOpen, setIsOpen] = useState(false);
  const availableLocales = getAvailableLocales();

  useEffect(() => {
    // Update state when locale changes
    const handleStorageChange = () => {
      setCurrentLocaleState(getCurrentLocale());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocaleState(locale);
    setIsOpen(false);

    // Force re-render of guidance messages by triggering a custom event
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
  };

  if (variant === 'toggle' && availableLocales.length === 2) {
    const otherLocale = availableLocales.find(l => l !== currentLocale) as Locale;

    return (
      <button
        onClick={() => handleLocaleChange(otherLocale)}
        className={cn(
          "inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium",
          "bg-secondary hover:bg-surface-overlay transition-colors",
          "text-foreground",
          className
        )}
        title={`Switch to ${getLocaleDisplayName(otherLocale)}`}
      >
        {showFlag && (
          <span className="text-base">{getLocaleFlag(otherLocale)}</span>
        )}
        <span>{getLocaleDisplayName(otherLocale)}</span>
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium",
          "bg-secondary hover:bg-surface-overlay transition-colors",
          "text-foreground",
          isOpen && "bg-surface-overlay"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {showFlag && (
          <span className="text-base">{getLocaleFlag(currentLocale)}</span>
        )}
        <span>{getLocaleDisplayName(currentLocale)}</span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-overlay rounded-md shadow-lg border border-border z-50">
          <div className="py-1">
            {availableLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors",
                  "flex items-center space-x-3",
                  locale === currentLocale
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-foreground"
                )}
              >
                {showFlag && (
                  <span className="text-base">{getLocaleFlag(locale)}</span>
                )}
                <span>{getLocaleDisplayName(locale)}</span>
                {locale === currentLocale && (
                  <svg
                    className="w-4 h-4 ml-auto text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Hook to use locale switching in other components
export function useLocale() {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>(getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent<{ locale: Locale }>) => {
      setCurrentLocaleState(event.detail.locale);
    };

    const handleStorageChange = () => {
      setCurrentLocaleState(getCurrentLocale());
    };

    window.addEventListener('localeChanged', handleLocaleChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeLocale = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocaleState(locale);
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
  };

  return {
    currentLocale,
    changeLocale,
    availableLocales: getAvailableLocales(),
    getDisplayName: getLocaleDisplayName
  };
}
