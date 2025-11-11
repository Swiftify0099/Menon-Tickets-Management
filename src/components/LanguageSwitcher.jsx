import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    // Set default language if not set
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    } else if (!i18n.language) {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  const isMarathi = i18n.language === 'mr';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages size={18} className="text-gray-500" />
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!isMarathi ? 'text-orange-600' : 'text-gray-500'}`}>
            EN
          </span>
          
          <button
            onClick={toggleLanguage}
            className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:bg-gray-400"
            aria-label="Toggle language"
          >
            <span
              className={`${
                isMarathi ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-lg`}
            />
          </button>
          
          <span className={`text-sm font-medium ${isMarathi ? 'text-orange-600' : 'text-gray-500'}`}>
            मर
          </span>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;