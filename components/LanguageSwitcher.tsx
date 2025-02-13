'use client';

import { useLanguage } from '@/utils/i18n/LanguageProvider';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
        className="bg-forest-900/80 backdrop-blur-sm text-earth-100 px-4 py-2 rounded-full hover:bg-forest-800 transition-colors border border-forest-700 flex items-center gap-2"
      >
        <span>{language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
        <span>{language === 'en' ? 'EN' : 'ES'}</span>
      </button>
    </div>
  );
} 