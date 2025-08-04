"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginDeveloper } from './api';

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
      
      // Store the token securely
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_expires', (Date.now() + response.expires_in * 1000).toString());
      
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

    // For now, we'll assume the token is valid if it exists and hasn't expired
    // In a real app, you might want to validate the token with the backend
    const rememberMe = localStorage.getItem('remember_me');
    if (rememberMe) {
      // If remember me is enabled, we can keep the user logged in
      // You might want to get user info from the backend here
      setUser({
        email: 'user@example.com', // This should come from the backend
        user_type: 'developer'
      });
    }

    return true;
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