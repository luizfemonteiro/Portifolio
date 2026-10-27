import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { copy } from './data.js';

const LangContext = createContext({ lang: 'pt', setLang: () => {}, t: copy.pt });
const KEY = 'lang';

const initialLang = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    /* sem armazenamento: segue o idioma do navegador */
  }
  return (navigator.language || 'pt').toLowerCase().startsWith('en') ? 'en' : 'pt';
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = copy[lang].htmlLang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignora */
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: copy[lang] }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
