import { useEffect, useState } from 'react';
import {
  getAvailableLocales,
  getCurrentLocale,
  getLocaleDisplayName,
  setLocale,
  type Locale
} from '../lib/cge/i18n';

export function useLocale() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (event: Event) => {
      setCurrentLocale((event as CustomEvent<{ locale: Locale }>).detail.locale);
    };
    const handleStorageChange = () => setCurrentLocale(getCurrentLocale());

    window.addEventListener('localeChanged', handleLocaleChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeLocale = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
  };

  return {
    currentLocale,
    changeLocale,
    availableLocales: getAvailableLocales(),
    getDisplayName: getLocaleDisplayName
  };
}

