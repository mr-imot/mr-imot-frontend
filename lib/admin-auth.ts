// Admin Authentication system using cookie-based authentication
// Designed for production-level security with HttpOnly cookies

import { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Admin-specific types
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  created_at: string;
}

export interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export interface AdminLoginResponse {
  message: string;
  user_type: string;
  expires_in: number;
}

// Admin API client for cookie-based authentication
class AdminAuthAPI {
  static async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`/api/v1/auth/login`, {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Validate that this is an admin login
    if (data.user_type !== 'admin') {
      throw new Error('Access denied. Admin account required.');
    }

    return data;
  }

  static async getCurrentAdmin(): Promise<AdminUser> {
    const response = await fetch(`/api/v1/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch admin profile');
    }

    return response.json();
  }

  static async logout(): Promise<void> {
    await fetch(`/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies
    });
  }
}

// Auth context
export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Admin Auth Provider Hook
export const useAdminAuthProvider = (): AdminAuthContextType => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);

      // Login and get response
      await AdminAuthAPI.login(email, password);
      
      // Get admin profile
      const adminUser = await AdminAuthAPI.getCurrentAdmin();
      setUser(adminUser);
      
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AdminAuthAPI.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if backend call fails
    }
    
    // Clear local state
    setUser(null);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const adminUser = await AdminAuthAPI.getCurrentAdmin();
      setUser(adminUser);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};

// Utility function to get auth headers for API requests (now uses cookies)
export const getAdminAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  return headers;
}; 