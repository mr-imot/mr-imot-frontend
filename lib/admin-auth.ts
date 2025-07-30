// Admin Authentication system for secure JWT-based authentication
// Designed for production-level security with proper token management

import { createContext, useContext, useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Admin-specific types
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_type: string;
}

// Constants for security
const TOKEN_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';
const REFRESH_THRESHOLD = 300; // 5 minutes before expiry

// Secure token storage using sessionStorage
class SecureTokenStorage {
  static setToken(token: string, expiresIn: number): void {
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    if (typeof window !== 'undefined') {
      // Use sessionStorage for better security than localStorage
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    
    return token;
  }

  static clearToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  }

  static isTokenExpiringSoon(): boolean {
    if (typeof window === 'undefined') return false;
    
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    
    return Date.now() > (parseInt(expiry) - (REFRESH_THRESHOLD * 1000));
  }

  static getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null;
    
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry) : null;
  }
}

// Admin API client for authentication
class AdminAuthAPI {
  static async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
    const token = SecureTokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        SecureTokenStorage.clearToken();
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to fetch admin profile');
    }

    return response.json();
  }

  static async refreshSession(): Promise<boolean> {
    // For now, we'll just validate the current token
    // In a full implementation, you might have a refresh token endpoint
    try {
      await this.getCurrentAdmin();
      return true;
    } catch {
      return false;
    }
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

  const isAuthenticated = !!user && !!SecureTokenStorage.getToken();

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const authResponse = await AdminAuthAPI.login(email, password);
      
      // Store token securely
      SecureTokenStorage.setToken(authResponse.access_token, authResponse.expires_in);
      
      // Get admin profile
      const adminUser = await AdminAuthAPI.getCurrentAdmin();
      setUser(adminUser);
      
    } catch (error) {
      SecureTokenStorage.clearToken();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    SecureTokenStorage.clearToken();
    setUser(null);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await AdminAuthAPI.refreshSession();
      if (!success) {
        logout();
        return false;
      }
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = SecureTokenStorage.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const adminUser = await AdminAuthAPI.getCurrentAdmin();
        setUser(adminUser);
      } catch {
        SecureTokenStorage.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      if (SecureTokenStorage.isTokenExpiringSoon()) {
        refreshToken();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  // Handle page visibility change to check auth status
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Validate auth when page becomes visible
        refreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshToken]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };
};

// Utility function to get auth headers for API requests
export const getAdminAuthHeaders = (): HeadersInit => {
  const token = SecureTokenStorage.getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Export token storage for direct access if needed
export { SecureTokenStorage }; 