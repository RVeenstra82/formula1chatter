import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Navbar: React.FC = () => {
  const { user, isLoading, login, logout, testLogin } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="bg-f1-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span className="text-f1-red mr-2">F1</span>
          <span>Chatter Championship</span>
        </Link>
        
        <div className="flex space-x-4 items-center">
          <Link to="/races" className="hover:text-f1-red transition-colors">{t('nav.races')}</Link>
          <Link to="/leaderboard" className="hover:text-f1-red transition-colors">{t('nav.leaderboard')}</Link>
          
          <LanguageSelector />
          
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center hover:text-f1-red transition-colors">
                {user.profilePictureUrl && (
                  <img 
                    src={user.profilePictureUrl} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full mr-2 profile-pic"
                  />
                )}
                <span>{user.name}</span>
              </Link>
              <button 
                onClick={logout} 
                className="ml-4 text-sm btn btn-primary"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
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
    </nav>
  );
};

export default Navbar; 