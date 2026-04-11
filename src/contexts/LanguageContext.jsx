import { createContext, useState, useContext, useEffect } from 'react';
import en from '../locales/en.json';
import zh from '../locales/zh.json';

const LOCALES = { en, zh };
const STORAGE_KEY = 'yida-lang';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'zh' ? 'zh' : 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-TW' : 'en';
  }, [language]);

  const locale = LOCALES[language];

  // Dot-notation key lookup: t('approach.title') → string
  const t = (key) => key.split('.').reduce((obj, k) => obj?.[k], locale) ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
