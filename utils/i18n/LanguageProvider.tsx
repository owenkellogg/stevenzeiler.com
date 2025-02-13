'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from './dictionaries';

type Language = 'en' | 'es';
type Dictionary = typeof dictionaries.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dictionary: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getSystemLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const systemLanguage = navigator.language.toLowerCase();
  // Default to English for Catalan users
  if (systemLanguage.startsWith('ca')) return 'es';
  // Spanish for Spanish users
  if (systemLanguage.startsWith('es')) return 'es';
  // English for everyone else
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [dictionary, setDictionary] = useState<Dictionary>(dictionaries.en);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage);
      setDictionary(dictionaries[savedLanguage]);
    } else {
      const systemLang = getSystemLanguage();
      setLanguage(systemLang);
      setDictionary(dictionaries[systemLang]);
      localStorage.setItem('language', systemLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setDictionary(dictionaries[lang]);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        dictionary,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 