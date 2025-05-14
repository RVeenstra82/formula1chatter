import React from 'react';
import { useLanguage, type Language } from '../../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">{t('common.language')}:</span>
      <div className="flex space-x-1">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-2 py-1 text-sm rounded ${
            language === 'en' ? 'bg-f1-red text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('nl')}
          className={`px-2 py-1 text-sm rounded ${
            language === 'nl' ? 'bg-f1-red text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          NL
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector; 