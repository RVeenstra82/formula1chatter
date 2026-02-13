import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-f1-dark text-white py-6 mt-auto border-t border-f1-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-f1-red font-bold">F1</span> {t('footer.copyright')} &copy; {new Date().getFullYear()}
          </div>
          <div className="flex space-x-4 md:space-x-4 gap-y-2 flex-wrap justify-center md:justify-end">
            <Link to="/privacy-policy" className="text-slate-400 hover:text-f1-red transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/data-deletion" className="text-slate-400 hover:text-f1-red transition-colors">
              {t('footer.dataDeletion')}
            </Link>
            <a
              href="https://github.com/RVeenstra82/formula1chatter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-f1-red transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
