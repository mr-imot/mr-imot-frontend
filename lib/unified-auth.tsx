"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';

// Define types for unified auth state
export interface UnifiedAuthUser {
  email: string;
  user_type: 'developer' | 'admin' | 'buyer';
  source: 'developer' | 'admin'; // Which auth system provided this user
}

interface UnifiedAuthContextType {
  user: UnifiedAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  getDashboardUrl: () => string;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider = ({ children }: UnifiedAuthProviderProps) => {
  const [unifiedUser, setUnifiedUser] = useState<UnifiedAuthUser | null>(null);
  const [unifiedLoading, setUnifiedLoading] = useState(true);
  
  // Check developer auth
  const { user: devUser, isAuthenticated: devAuth, isLoading: devLoading, logout: devLogout } = useAuth();

  // Check admin auth by directly checking localStorage (since admin auth might not be available in main context)
  const [adminUser, setAdminUser] = useState<UnifiedAuthUser | null>(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Check admin authentication state
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        // Check sessionStorage as that's where admin tokens are stored
        const adminToken = sessionStorage.getItem('admin_token');
        const adminExpiry = sessionStorage.getItem('admin_token_expiry');
        
        if (adminToken && adminExpiry) {
          const expiryTime = parseInt(adminExpiry);
          if (Date.now() < expiryTime) {
            // Admin is authenticated - get email from stored admin data if available
            const adminEmail = sessionStorage.getItem('admin_email') || 'admin@mrimot.com';
            setAdminUser({
              email: adminEmail,
              user_type: 'admin',
              source: 'admin'
            });
            setAdminAuth(true);
          } else {
            // Token expired, clear admin tokens
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_token_expiry');
            sessionStorage.removeItem('admin_email');
            setAdminUser(null);
            setAdminAuth(false);
          }
        } else {
          setAdminUser(null);
          setAdminAuth(false);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setAdminUser(null);
        setAdminAuth(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminAuth();
    
    // For sessionStorage, we need to check on focus instead of storage event
    const handleFocus = () => {
      checkAdminAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Update unified auth state based on developer and admin auth
  useEffect(() => {
    if (!devLoading && !adminLoading) {
      if (adminAuth && adminUser) {
        // Admin takes priority (they're logged into admin panel)
        setUnifiedUser(adminUser);
      } else if (devAuth && devUser) {
        // Developer auth
        setUnifiedUser({
          email: devUser.email,
          user_type: devUser.user_type as 'developer' | 'admin' | 'buyer',
          source: 'developer'
        });
      } else {
        // No auth
        setUnifiedUser(null);
      }
      setUnifiedLoading(false);
    }
  }, [devAuth, devUser, devLoading, adminAuth, adminUser, adminLoading]);

  const logout = () => {
    if (unifiedUser?.source === 'admin') {
      // Logout from admin using sessionStorage
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_token_expiry');
      sessionStorage.removeItem('admin_email');
      setAdminUser(null);
      setAdminAuth(false);
      setUnifiedUser(null);
      // Redirect to admin login
      window.location.href = '/admin/login';
    } else {
      // Logout from developer
      devLogout();
      setUnifiedUser(null);
    }
  };

  const getDashboardUrl = (): string => {
    if (!unifiedUser) return '/login';
    
    switch (unifiedUser.user_type) {
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

  const value: UnifiedAuthContextType = {
    user: unifiedUser,
    isAuthenticated: !!unifiedUser,
    isLoading: unifiedLoading,
    logout,
    getDashboardUrl,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};
