import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import FacebookIcon from './FacebookIcon';

const Navbar: React.FC = () => {
  const { user, isLoading, login, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-md border transition-all font-medium uppercase tracking-f1 text-sm ${
      isActive(path)
        ? 'border-f1-red bg-f1-red/20 text-white shadow-[inset_0_0_12px_rgba(225,6,0,0.15)]'
        : 'border-transparent hover:border-f1-red hover:bg-f1-red/10 text-white'
    }`;

  const mobileNavLinkClass = (path: string) =>
    `px-4 py-3 rounded-md transition-all font-medium uppercase tracking-f1 ${
      isActive(path)
        ? 'bg-f1-red/20 border-l-2 border-l-f1-red text-white'
        : 'hover:bg-f1-red/10 hover:border-l-2 hover:border-l-f1-red text-white'
    }`;

  const ariaCurrent = (path: string) => isActive(path) ? 'page' as const : undefined;

  return (
    <nav className="carbon-bg text-white border-b border-f1-border speed-line">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="text-f1-red mr-2 drop-shadow-[0_0_8px_var(--f1-red-glow)]">F1</span>
            <span>{t('nav.brand')}</span>
          </Link>

          <div className="border-l border-f1-border pl-6 ml-6 flex space-x-2">
            <Link to="/races" className={navLinkClass('/races')} aria-current={ariaCurrent('/races')}>
              {t('nav.races')}
            </Link>
            <Link to="/leaderboard" className={navLinkClass('/leaderboard')} aria-current={ariaCurrent('/leaderboard')}>
              {t('nav.leaderboard')}
            </Link>
            <Link to="/stats" className={navLinkClass('/stats')} aria-current={ariaCurrent('/stats')}>
              {t('nav.stats')}
            </Link>
          </div>

          <div className="flex-1" />

          <div className="border-l border-f1-border pl-6 flex space-x-1">
            <button
              onClick={() => setLanguage('nl')}
              aria-label="Wissel naar Nederlands"
              aria-pressed={language === 'nl'}
              className={`px-2 py-2 rounded-md text-sm font-medium uppercase tracking-f1 transition-colors ${
                language === 'nl' ? 'text-f1-red' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              NL
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
              className={`px-2 py-2 rounded-md text-sm font-medium uppercase tracking-f1 transition-colors ${
                language === 'en' ? 'text-f1-red' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>

          <div className="border-l border-f1-border pl-6 ml-6">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-f1-surface-elevated animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center">
                <Link to="/profile" className="flex items-center hover:text-f1-red transition-colors">
                  {user.profilePictureUrl && (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2 border-2 border-f1-border hover:border-f1-red transition-colors"
                    />
                  )}
                  <span className="font-body">{user.name}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="ml-4 text-sm btn btn-primary"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="btn btn-primary flex items-center"
              >
                <FacebookIcon className="w-4 h-4 mr-2" />
                {t('nav.loginWithFacebook')}
              </button>
            )}
          </div>
        </div>

              {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold flex items-center">
              <span className="text-f1-red mr-2 drop-shadow-[0_0_8px_var(--f1-red-glow)]">F1</span>
              <span>{t('nav.brandShort')}</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <button
                  onClick={() => setLanguage('nl')}
                  aria-label="Wissel naar Nederlands"
                  aria-pressed={language === 'nl'}
                  className={`px-1 py-1 rounded text-sm font-medium uppercase tracking-f1 transition-colors ${
                    language === 'nl' ? 'text-f1-red' : 'text-slate-500'
                  }`}
                >
                  NL
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  aria-label="Switch to English"
                  aria-pressed={language === 'en'}
                  className={`px-1 py-1 rounded text-sm font-medium uppercase tracking-f1 transition-colors ${
                    language === 'en' ? 'text-f1-red' : 'text-slate-500'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-f1-surface-elevated transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mt-4 pb-4 border-t border-f1-border">
              <div className="flex flex-col space-y-3 mt-4">
                <Link
                  to="/races"
                  className={mobileNavLinkClass('/races')}
                  aria-current={ariaCurrent('/races')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.races')}
                </Link>
                <Link
                  to="/leaderboard"
                  className={mobileNavLinkClass('/leaderboard')}
                  aria-current={ariaCurrent('/leaderboard')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.leaderboard')}
                </Link>
                <Link
                  to="/stats"
                  className={mobileNavLinkClass('/stats')}
                  aria-current={ariaCurrent('/stats')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.stats')}
                </Link>

                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-f1-surface-elevated animate-pulse"></div>
                ) : user ? (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 hover:text-f1-red transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.profilePictureUrl && (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-3 border-2 border-f1-border"
                        />
                      )}
                      <span className="font-body">{user.name}</span>
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-md hover:bg-f1-red/10 transition-all font-medium text-white uppercase tracking-f1"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    <FacebookIcon className="w-4 h-4 mr-2" />
                    {t('nav.loginWithFacebook')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
