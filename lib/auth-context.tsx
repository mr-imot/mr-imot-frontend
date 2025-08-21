"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginDeveloper, getCurrentDeveloper } from './api';

interface AuthUser {
  email: string;
  user_type: string;
  verification_status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerificationRequired: boolean;
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
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);

  // User is only authenticated if they have a token AND are verified
  const isAuthenticated = !!user && !!localStorage.getItem('auth_token') && user?.verification_status === 'verified';

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
      
      // Reset verification status on new login
      setIsVerificationRequired(false);
      
      // Set user info
      setUser({
        email,
        user_type: response.user_type
      });
      
      // Check if user needs verification by trying to get current developer info
      try {
        const userInfo = await getCurrentDeveloper();
        // Set verification status based on backend response
        setUser({
          email,
          user_type: response.user_type,
          verification_status: userInfo.verification_status
        });
        setIsVerificationRequired(userInfo.verification_status !== 'verified');
      } catch (error: any) {
        // If failed with verification error, set verification required but don't fail login
        if ((error as any).isVerificationRequired || 
            (error.message && error.message.includes('verification required')) ||
            (error.message && error.message.includes("don't have permission")) ||
            (error as any).statusCode === 403) {
          setUser({
            email,
            user_type: response.user_type,
            verification_status: 'pending_manual_approval' // Default for unverified users
          });
          setIsVerificationRequired(true);
        } else {
          // For other errors, still fail the login
          throw error;
        }
      }
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
        user_type: 'developer',
        verification_status: userInfo.verification_status
      });
      
      // Cache user email for faster future loads
      localStorage.setItem('user_email', userInfo.email);
      return true;
    } catch (error: any) {
      // Only log non-verification errors as warnings
      if (!(error as any).isVerificationRequired) {
        // console.warn('Auth validation failed:', error); // Removed console.warn
      }
      
      // Handle specific error cases
      if ((error as any).isVerificationRequired || 
          (error.message && error.message.includes('verification required'))) {
        // Account needs verification - don't logout, just return false
        // This prevents the refresh loop
        // console.log('Account verification required - keeping user logged in but not authenticated'); // Removed console.log
        setIsVerificationRequired(true);
        
        // Set user with unverified status if we have cached email
        if (cachedUserEmail) {
          setUser({
            email: cachedUserEmail,
            user_type: 'developer',
            verification_status: 'pending_manual_approval' // Default to pending
          });
        }
        return false;
      }
      
      if ((error as any).statusCode === 403 || 
          (error.message && error.message.includes('403'))) {
        // Permission denied - likely verification required
        // console.log('Permission denied - likely verification required'); // Removed console.log
        setIsVerificationRequired(true);
        
        // Set user with unverified status if we have cached email  
        if (cachedUserEmail) {
          setUser({
            email: cachedUserEmail,
            user_type: 'developer',
            verification_status: 'pending_manual_approval' // Default to pending
          });
        }
        return false;
      }
      
      // If we have cached user data, keep using it for other errors
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
        // Clear invalid tokens only for critical errors
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
        // console.error('Auth initialization failed:', error); // Removed console.error
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
    isVerificationRequired,
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