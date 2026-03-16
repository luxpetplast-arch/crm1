import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'uz', label: 'ЎЗ', name: 'O\'zbekcha (Кирил)' },
    { code: 'ru', label: 'РУ', name: 'Русский' }
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'uz' ? 'ru' : 'uz';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
      title={currentLang.name}
    >
      <Globe className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium">
        {currentLang.label}
      </span>
    </button>
  );
}
