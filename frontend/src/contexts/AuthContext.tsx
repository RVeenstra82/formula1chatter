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
        
        // Check URL search parameters for OAuth callback data
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        const userParam = urlParams.get('user');
        
        console.log('AuthContext: tokenParam exists:', !!tokenParam);
        console.log('AuthContext: userParam exists:', !!userParam);
        
        if (tokenParam && userParam) {
          console.log('AuthContext: Found token and user in URL parameters');
          console.log('AuthContext: Token:', tokenParam.substring(0, 20) + '...');
          console.log('AuthContext: User param:', userParam.substring(0, 50) + '...');
          try {
            // Support both plain JSON and URL-encoded JSON for the user param
            let userJsonString = userParam;
            try {
              userJsonString = decodeURIComponent(userParam);
            } catch (_) {
              // Not URL-encoded; proceed with original string
            }
            const userData = JSON.parse(userJsonString);
            console.log('AuthContext: Parsed user data:', userData);
            localStorage.setItem('authToken', tokenParam);
            localStorage.setItem('user', JSON.stringify(userData));
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

  const logout = async () => {
    try {
      // Call backend logout endpoint first
      await apiClient.post('/logout');
    } catch (error) {
      console.log('Logout API call failed, but continuing with local cleanup');
    }
    
    // Clear JWT token and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clean up any onboarding-related localStorage items
    localStorage.removeItem('f1chatter_onboarding_completed');
    localStorage.removeItem('f1chatter_first_time_user');
    setUser(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Test login functie alleen in development mode
  const testLogin = () => {
    const testUser = {
      id: 0,
      name: 'Test User',
      email: 'testuser@f1chatter.com',
      profilePictureUrl: null,
      isAdmin: true, // Give test user admin rights
    };
    setUser(testUser);
    // Store test user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('authToken', 'test-token');
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