import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105"
        title={language === 'uz' ? 'Русский' : 'O\'zbekcha'}
      >
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="font-bold text-sm text-blue-700 dark:text-blue-300">
          {language === 'uz' ? 'O\'Z' : 'РУ'}
        </span>
      </button>
    </div>
  );
}
