import { useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const VALID_LANGS = ['en', 'zh'];

export default function LangWrapper() {
  const { lang } = useParams();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    if (VALID_LANGS.includes(lang)) {
      setLanguage(lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
    }
  }, [lang, setLanguage]);

  if (!VALID_LANGS.includes(lang)) {
    return <Navigate to="/en/" replace />;
  }

  return <Outlet />;
}
