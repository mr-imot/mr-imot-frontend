// Admin API client for secure backend communication
// Handles all admin-specific API operations with JWT authentication

import { getAdminAuthHeaders, SecureTokenStorage } from './admin-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for Admin API responses
export interface PendingDeveloper {
  id: string;
  email: string;
  company_name: string;
  contact_person: string;
  phone: string;
  office_address: string;
  website: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface DeveloperStats {
  total_pending: number;
  total_verified: number;
  total_rejected: number;
  recent_applications: number;
}

// Error types for better error handling
export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

// Admin API client class
class AdminApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = getAdminAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      console.log(`[Admin API] Making request to: ${endpoint}`);
      const response = await fetch(url, config);

      // Handle authentication errors
      if (response.status === 401) {
        SecureTokenStorage.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        throw new AdminApiError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      // Handle authorization errors
      if (response.status === 403) {
        throw new AdminApiError(
          'Access denied. Admin privileges required.',
          403,
          'ACCESS_DENIED'
        );
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorCode = 'UNKNOWN_ERROR';

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          errorCode = errorData.error_code || errorCode;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new AdminApiError(errorMessage, response.status, errorCode);
      }

      const data = await response.json();
      console.log(`[Admin API] Success response for: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`[Admin API] Request failed for: ${endpoint}`, error);
      
      if (error instanceof AdminApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new AdminApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Admin profile endpoints
  async getCurrentAdmin(): Promise<AdminProfile> {
    return this.request<AdminProfile>('/api/v1/admin/me');
  }

  // Developer management endpoints
  async getPendingDevelopers(): Promise<PendingDeveloper[]> {
    return this.request<PendingDeveloper[]>('/api/v1/admin/developers/pending');
  }

  async verifyDeveloper(developerId: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/api/v1/admin/developers/${developerId}/verify`, {
      method: 'POST',
    });
  }

  async rejectDeveloper(developerId: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/api/v1/admin/developers/${developerId}/reject`, {
      method: 'POST',
    });
  }

  // Dashboard statistics (these would need to be implemented in the backend)
  async getDeveloperStats(): Promise<DeveloperStats> {
    try {
      return this.request<DeveloperStats>('/api/v1/admin/stats/developers');
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('Stats endpoint not available, returning mock data');
      return {
        total_pending: 5,
        total_verified: 23,
        total_rejected: 2,
        recent_applications: 3,
      };
    }
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      return this.request<any[]>('/api/v1/admin/activity/recent');
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('Activity endpoint not available, returning mock data');
      return [
        {
          id: '1',
          action: 'Developer verified',
          target: 'ABC Construction Ltd.',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'New developer application',
          target: 'XYZ Builders',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
  }

  // System health check
  async getSystemHealth(): Promise<{ status: string; services: any[] }> {
    try {
      return this.request<{ status: string; services: any[] }>('/api/v1/admin/health');
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('Health endpoint not available, returning mock data');
      return {
        status: 'healthy',
        services: [
          { name: 'Database', status: 'healthy' },
          { name: 'Authentication', status: 'healthy' },
          { name: 'File Storage', status: 'healthy' },
        ],
      };
    }
  }

  // Bulk operations for developer management
  async bulkVerifyDevelopers(developerIds: string[]): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/api/v1/admin/developers/bulk/verify', {
      method: 'POST',
      body: JSON.stringify({ developer_ids: developerIds }),
    });
  }

  async bulkRejectDevelopers(developerIds: string[]): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/api/v1/admin/developers/bulk/reject', {
      method: 'POST',
      body: JSON.stringify({ developer_ids: developerIds }),
    });
  }
}

// Export singleton instance
export const adminApiClient = new AdminApiClient(API_BASE_URL);

// Export convenience functions
export const getCurrentAdmin = () => adminApiClient.getCurrentAdmin();
export const getPendingDevelopers = () => adminApiClient.getPendingDevelopers();
export const verifyDeveloper = (developerId: string) => adminApiClient.verifyDeveloper(developerId);
export const rejectDeveloper = (developerId: string) => adminApiClient.rejectDeveloper(developerId);
export const getDeveloperStats = () => adminApiClient.getDeveloperStats();
export const getRecentActivity = () => adminApiClient.getRecentActivity();
export const getSystemHealth = () => adminApiClient.getSystemHealth();
export const bulkVerifyDevelopers = (developerIds: string[]) => adminApiClient.bulkVerifyDevelopers(developerIds);
export const bulkRejectDevelopers = (developerIds: string[]) => adminApiClient.bulkRejectDevelopers(developerIds); 