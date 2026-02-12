import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { user, isLoading, login, logout, testLogin } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'nl' : 'en');
  };

  const navLinkClass = "px-4 py-2 rounded-md border border-transparent hover:border-f1-red hover:bg-f1-red/10 transition-all font-medium text-white uppercase tracking-f1 text-sm";
  const adminLinkClass = "px-4 py-2 rounded-md border border-transparent hover:border-purple-500 hover:bg-purple-500/10 transition-all font-medium text-purple-300 uppercase tracking-f1 text-sm";

  return (
    <nav className="carbon-bg text-white border-b border-f1-border speed-line">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="text-f1-red mr-2 drop-shadow-[0_0_8px_var(--f1-red-glow)]">F1</span>
            <span>Chatter Championship</span>
          </Link>

            <div className="flex items-center">
              <div className="flex space-x-2 mr-6">
                <Link to="/races" className={navLinkClass}>
                  {t('nav.races')}
                </Link>
                <Link to="/leaderboard" className={navLinkClass}>
                  {t('nav.leaderboard')}
                </Link>
                <Link to="/stats" className={navLinkClass}>
                  {t('nav.stats')}
                </Link>

                {user?.isAdmin ? (
                  <Link to="/admin" className={adminLinkClass}>
                    Admin
                  </Link>
                ) : null}
              </div>
          </div>

             <div className="border-l border-f1-border pl-6">
               <button
                 onClick={toggleLanguage}
                 className="text-slate-400 hover:text-f1-red transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-f1"
               >
                 {language.toUpperCase()}
               </button>
             </div>

             {isLoading ? (
               <div className="w-8 h-8 rounded-full bg-f1-surface-elevated animate-pulse ml-6"></div>
             ) : user ? (
               <div className="flex items-center ml-6">
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
               <div className="flex items-center space-x-2 ml-6">
                 <button
                   onClick={login}
                   className="btn btn-primary flex items-center"
                 >
                   <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                   </svg>
                   {t('nav.login')} with Facebook
                 </button>
                 {testLogin && (
                   <button
                     onClick={testLogin}
                     className="btn btn-secondary"
                   >
                     Test Login
                   </button>
                 )}
               </div>
             )}
           </div>
         </div>

              {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold flex items-center">
              <span className="text-f1-red mr-2 drop-shadow-[0_0_8px_var(--f1-red-glow)]">F1</span>
              <span>Chatter</span>
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLanguage}
                className="text-slate-400 hover:text-f1-red transition-colors px-2 py-1 rounded text-sm uppercase tracking-f1"
              >
                {language.toUpperCase()}
              </button>

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
                  className="px-4 py-3 rounded-md hover:bg-f1-red/10 hover:border-l-2 hover:border-l-f1-red transition-all font-medium text-white uppercase tracking-f1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.races')}
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-4 py-3 rounded-md hover:bg-f1-red/10 hover:border-l-2 hover:border-l-f1-red transition-all font-medium text-white uppercase tracking-f1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.leaderboard')}
                </Link>
                <Link
                  to="/stats"
                  className="px-4 py-3 rounded-md hover:bg-f1-red/10 hover:border-l-2 hover:border-l-f1-red transition-all font-medium text-white uppercase tracking-f1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.stats')}
                </Link>

                {user?.isAdmin ? (
                  <Link
                    to="/admin"
                    className="px-4 py-3 rounded-md hover:bg-purple-500/10 transition-all font-medium text-purple-300 uppercase tracking-f1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                ) : null}

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
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => {
                        login();
                        setIsMenuOpen(false);
                      }}
                      className="btn btn-primary flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                      </svg>
                      {t('nav.login')} with Facebook
                    </button>
                    {testLogin && (
                      <button
                        onClick={() => {
                          testLogin();
                          setIsMenuOpen(false);
                        }}
                        className="btn btn-secondary"
                      >
                        Test Login
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </nav>
  );
};

export default Navbar;
