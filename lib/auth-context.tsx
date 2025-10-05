"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User types
export interface AuthUser {
  id: string;
  email: string;
  user_type: 'admin' | 'developer' | 'buyer';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  website?: string;
  verification_status?: string;
  created_at?: string;
}

// Auth context interface
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  getDashboardUrl: () => string;
  // Simple verification helper
  canCreateProjects: boolean;
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

  // User is authenticated if we have user data (cookies handle the session)
  const isAuthenticated = !!user;

  // API call to login with credentials
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // Include cookies
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Login failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the raw text or default message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // After successful login, fetch user info
      await checkAuth();
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout by calling backend endpoint and clearing state
  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if backend call fails
    }
    
    // Clear local state
    setUser(null);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Check authentication status by calling /me endpoint
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/developers/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - this is expected behavior, don't log as error
          setUser(null);
          return false;
        }
        throw new Error(`Auth check failed: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      // Only log unexpected errors, not 401s
      if (error instanceof Error && !error.message.includes('401')) {
        console.error('Auth check failed:', error);
      }
      setUser(null);
      return false;
    }
  };

  // Get dashboard URL based on user type
  const getDashboardUrl = (): string => {
    if (!user) return '/login';
    
    switch (user.user_type) {
      case 'admin':
        return '/admin/dashboard';
      case 'developer':
        return '/developer/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      default:
        return '/login';
    }
  };

  // Check auth on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Simple verification helper - only for creating projects
  // Check if user exists, is developer type, and is verified
  const canCreateProjects = user?.user_type === 'developer' && user?.verification_status === 'verified';

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    getDashboardUrl,
    canCreateProjects,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};