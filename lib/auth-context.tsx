"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginDeveloper, getCurrentDeveloper } from './api';

interface AuthUser {
  email: string;
  user_type: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token');

  const login = async (email: string, password: string) => {
    try {
      const response = await loginDeveloper(email, password);
      
      // Validate user role for developer login
      if (response.user_type !== 'developer') {
        // Clear any stored tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_expires');
        setUser(null);
        throw new Error('Access denied. This login is for developers only. Please use the admin login if you have an admin account.');
      }
      
      // Store the token securely
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_expires', (Date.now() + response.expires_in * 1000).toString());
      localStorage.setItem('user_email', email); // Cache email for faster future loads
      
      // Set user info
      setUser({
        email,
        user_type: response.user_type
      });
    } catch (error) {
      // Clear any existing tokens on login failure
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('user_email'); // Clear cached email
    setUser(null);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    const expires = localStorage.getItem('auth_expires');
    
    if (!token || !expires) {
      setUser(null);
      return false;
    }

    const expiryTime = parseInt(expires);
    if (Date.now() >= expiryTime) {
      // Token expired
      logout();
      return false;
    }

    // OPTIMIZATION: Try cached user data first for faster initial load
    const cachedUserEmail = localStorage.getItem('user_email');
    if (cachedUserEmail) {
      setUser({
        email: cachedUserEmail,
        user_type: 'developer'
      });
    }

    // Validate token with backend in background (non-blocking)
    try {
      // Use Promise.race with timeout for faster failure detection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth validation timeout')), 5000)
      );
      
      const userInfo = await Promise.race([
        getCurrentDeveloper(),
        timeoutPromise
      ]);
      
      // Update with fresh data from API
      setUser({
        email: userInfo.email,
        user_type: 'developer'
      });
      
      // Cache user email for faster future loads
      localStorage.setItem('user_email', userInfo.email);
      return true;
    } catch (error) {
      console.warn('Auth validation failed, using fallback:', error);
      
      // If we have cached user data, keep using it
      if (cachedUserEmail) {
        return true;
      }
      
      // Check if remember me is enabled
      const rememberMe = localStorage.getItem('remember_me');
      if (rememberMe) {
        // Keep minimal user state for remember me
        setUser({
          email: 'user@example.com', // This should come from stored data
          user_type: 'developer'
        });
        return true;
      } else {
        // Clear invalid tokens
        logout();
        return false;
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};