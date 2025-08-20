import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../api/client';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: () => void;
  logout: () => void;
  testLogin?: () => void; // Optioneel, alleen in dev
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is already logged in via JWT token
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check for URL parameters from OAuth2 callback
        console.log('AuthContext: Checking URL parameters...');
        console.log('AuthContext: Current URL:', window.location.href);
        console.log('AuthContext: Search params:', window.location.search);
        console.log('AuthContext: Hash:', window.location.hash);
        
        // Check both search params and hash fragment
        let urlParams = new URLSearchParams(window.location.search);
        let tokenParam = urlParams.get('token');
        let userParam = urlParams.get('user');
        
        // If not found in search params, check hash fragment
        if (!tokenParam || !userParam) {
          // Handle hash fragment that might contain query parameters
          const hashString = window.location.hash.substring(1); // Remove the #
          console.log('AuthContext: Parsing hash string:', hashString);
          
          if (hashString.includes('?')) {
            // Hash contains query parameters like #/?token=...&user=...
            const hashQueryString = hashString.substring(hashString.indexOf('?') + 1);
            console.log('AuthContext: Hash query string:', hashQueryString);
            const hashParams = new URLSearchParams(hashQueryString);
            if (!tokenParam) tokenParam = hashParams.get('token');
            if (!userParam) userParam = hashParams.get('user');
            console.log('AuthContext: From hash params - token:', !!tokenParam, 'user:', !!userParam);
          } else {
            // Hash contains direct parameters like #token=...&user=...
            const hashParams = new URLSearchParams(hashString);
            if (!tokenParam) tokenParam = hashParams.get('token');
            if (!userParam) userParam = hashParams.get('user');
            console.log('AuthContext: From direct hash params - token:', !!tokenParam, 'user:', !!userParam);
          }
        }
        
        console.log('AuthContext: tokenParam exists:', !!tokenParam);
        console.log('AuthContext: userParam exists:', !!userParam);
        
        if (tokenParam && userParam) {
          console.log('AuthContext: Found token and user in URL parameters');
          console.log('AuthContext: Token:', tokenParam.substring(0, 20) + '...');
          console.log('AuthContext: User param:', userParam.substring(0, 50) + '...');
          try {
            const userData = JSON.parse(userParam);
            console.log('AuthContext: Parsed user data:', userData);
            localStorage.setItem('authToken', tokenParam);
            localStorage.setItem('user', userParam);
            setUser(userData);
            
            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('AuthContext: URL cleaned up, user set');
            return;
          } catch (err) {
            console.log('AuthContext: Failed to parse user data from URL:', err);
          }
        } else {
          console.log('AuthContext: No token or user in URL parameters');
          console.log('AuthContext: tokenParam:', tokenParam);
          console.log('AuthContext: userParam:', userParam);
        }
        
        // First check localStorage for stored user and token
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        console.log('AuthContext: storedToken exists:', !!storedToken);
        console.log('AuthContext: storedUser exists:', !!storedUser);
        
        if (storedToken && storedUser) {
          try {
            console.log('AuthContext: Verifying token with API call...');
            // Verify token is still valid by making API call
            const currentUserData = await api.getCurrentUser();
            console.log('AuthContext: API call successful, user:', currentUserData);
            setUser(currentUserData);
          } catch (err) {
            console.log('AuthContext: API call failed, clearing storage:', err);
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          console.log('AuthContext: No stored data, user not logged in');
          // No stored data, user is not logged in
          setUser(null);
        }
      } catch (err) {
        setUser(null);
        console.error('Not logged in', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const login = () => {
    // Redirect to Facebook login
    window.location.href = `${apiClient.defaults.baseURL}/oauth2/authorization/facebook`;
  };

  const logout = () => {
    // Clear JWT token and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    
    // Optionally call backend logout endpoint
    window.location.href = `${apiClient.defaults.baseURL}/logout`;
  };

  // Test login functie alleen in development mode
  const testLogin = () => {
    setUser({
      id: 0,
      name: 'Test User',
      email: 'testuser@f1chatter.com',
      profilePictureUrl: null,
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    ...(import.meta.env.DEV ? { testLogin } : {}),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 