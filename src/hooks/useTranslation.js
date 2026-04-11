import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
  const { language, t, locale, setLanguage } = useLanguage();
  const isZh = language === 'zh';

  // tf: t() with simple token interpolation
  // e.g. tf('footer.copyright', { year: 2026 }) → "Yida Tsai © 2020–2026"
  const tf = (key, tokens = {}) => {
    let str = t(key);
    Object.entries(tokens).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  };

  return { t, tf, locale, language, isZh, setLanguage };
}
