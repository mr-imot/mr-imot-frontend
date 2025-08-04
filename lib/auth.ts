// Authentication utilities and helper functions

// Utility function to get auth headers for API requests
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const expires = localStorage.getItem('auth_expires');
    
    if (token && expires) {
      const expiryTime = parseInt(expires);
      if (Date.now() < expiryTime) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        // Token expired, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_expires');
      }
    }
  }

  return headers;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const expires = localStorage.getItem('auth_expires');
  
  if (!token || !expires) return false;
  
  const expiryTime = parseInt(expires);
  return Date.now() < expiryTime;
};

// Clear authentication data
export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_expires');
  localStorage.removeItem('remember_me');
};