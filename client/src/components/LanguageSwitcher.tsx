import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`text-xs px-2 py-1 rounded-[8px] font-medium transition cursor-pointer ${
            i18n.language === lang.code
              ? 'bg-[#6C4CF1] text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={lang.name}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
