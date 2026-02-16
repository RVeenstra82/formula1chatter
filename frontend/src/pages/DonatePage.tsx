import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const KOFI_LINK = 'https://ko-fi.com/f1chatterchampionship';

const DonatePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="card p-6 my-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {t('donate.title')}
        </h1>
        <p className="text-slate-400 text-center mb-8">
          {t('donate.subtitle')}
        </p>

        <h2 className="text-xl font-bold text-white mb-3">
          {t('donate.why.title')}
        </h2>
        <p className="text-slate-300 mb-6">
          {t('donate.why.description')}
        </p>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">
            {t('donate.costs.title')}
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-f1-red">&#9679;</span>
              {t('donate.costs.hosting')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-f1-red">&#9679;</span>
              {t('donate.costs.database')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-f1-red">&#9679;</span>
              {t('donate.costs.api')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-f1-red">&#9679;</span>
              {t('donate.costs.development')}
            </li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <a
            href={KOFI_LINK || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block px-8 py-3 text-lg font-bold text-white rounded-lg transition-all ${
              KOFI_LINK
                ? 'bg-f1-red hover:bg-red-700 hover:scale-105'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!KOFI_LINK) e.preventDefault();
            }}
          >
            {t('donate.button')}
          </a>
        </div>

        <p className="text-slate-500 text-sm text-center">
          {t('donate.note')}
        </p>
      </div>
    </div>
  );
};

export default DonatePage;
