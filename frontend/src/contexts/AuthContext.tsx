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
        
        // First check localStorage for stored user and token
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // Verify token is still valid by making API call
            const currentUserData = await api.getCurrentUser();
            setUser(currentUserData);
          } catch (err) {
            // Token invalid, clear storage and try API call
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            const userData = await api.getCurrentUser();
            setUser(userData);
          }
        } else {
          // No stored data, try API call (for OAuth2 callback)
          const userData = await api.getCurrentUser();
          setUser(userData);
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