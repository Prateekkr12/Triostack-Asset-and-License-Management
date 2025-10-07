import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';
import { AuthContextType, User, LoginForm } from '@/types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('token');
      const storedRefreshToken = Cookies.get('refreshToken');
      
      console.log('Auth initialization:', { storedToken: !!storedToken, storedRefreshToken: !!storedRefreshToken });

      if (storedToken && storedRefreshToken) {
        try {
          setToken(storedToken);
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            const { token: newToken } = await authService.refreshToken(storedRefreshToken);
            setToken(newToken);
            Cookies.set('token', newToken, { expires: 7, path: '/' });
            
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (refreshError) {
            // Refresh failed, clear tokens
            console.log('Token refresh failed, clearing tokens');
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            setToken(null);
            setUser(null);
          }
        }
      } else if (storedRefreshToken && !storedToken) {
        // Only refresh token available, try to refresh
        try {
          const { token: newToken } = await authService.refreshToken(storedRefreshToken);
          setToken(newToken);
          Cookies.set('token', newToken, { expires: 7, path: '/' });
          
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          console.log('Token refresh failed, clearing tokens');
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          setToken(null);
          setUser(null);
        }
      } else {
        // No tokens available, clear state
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginForm): Promise<void> => {
    try {
      const { user: userData, token: authToken, refreshToken } = await authService.login(credentials);
      
      setUser(userData);
      setToken(authToken);
      
      // Store tokens in cookies
      Cookies.set('token', authToken, { expires: 7, path: '/' });
      Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/' });
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    // Clear all tokens from cookies
    Cookies.remove('token', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    // Clear any stored data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
