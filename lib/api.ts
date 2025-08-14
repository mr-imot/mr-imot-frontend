// API service layer for NovaDom Real Estate Platform
// Handles all backend communication with proper authentication

import { withRetry, isNetworkError, getConnectionErrorMessage, AUTH_RETRY_OPTIONS } from './network-utils'

// Use same-origin during development so Next.js rewrites proxy to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? '' : 'https://api.mrimot.com');

// Types for API responses
export interface Developer {
  id: number;
  email: string;
  company_name: string;
  contact_person: string;
  phone: string;
  address: string;
  website: string;
  verification_status: string;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  location?: string; // Optional for backward compatibility
  city: string;
  neighborhood?: string;
  project_type: string;
  status: string;
  price_from?: number;
  price_to?: number;
  price_per_m2?: string; // New field from mock API
  completion_date?: string;
  expected_completion_date?: string; // New field from mock API
  developer_id: number;
  created_at: string;
  updated_at: string;
  // New fields from mock API
  latitude?: number;
  longitude?: number;
  cover_image_url?: string;
  gallery_urls?: string[];
  amenities_list?: string[];
  developer?: {
    id: number;
    company_name: string;
    email: string;
    contact_person: string;
    phone: string;
    office_address: string;
    website: string;
    verification_status: string;
    is_active: boolean;
  };
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DeveloperStats {
  total_projects: number;
  active_projects: number;
  total_views: number;
  total_inquiries: number;
}

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get the stored auth token
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
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const baseHeaders = await this.getAuthHeaders();

    // Build headers and automatically drop Content-Type for FormData bodies
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const mergedHeaders: HeadersInit = {
      ...baseHeaders,
      ...options.headers,
    } as HeadersInit;
    if (isFormData && 'Content-Type' in (mergedHeaders as Record<string, any>)) {
      // Let the browser set the correct multipart boundary
      delete (mergedHeaders as Record<string, any>)["Content-Type"];
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error(`API Error Response: ${errorText}`);
        }
        
        // Try to parse the error as JSON to get a better error message
        let errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, use the generic error message
          console.log('Failed to parse error as JSON, using generic error');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API Response data:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Developer endpoints
  async getDevelopers(): Promise<any> {
    return this.request('/api/v1/developers/');
  }

  async getCurrentDeveloper(): Promise<Developer> {
    // Use optimized retry options for auth calls
    return withRetry(async () => {
      return this.request('/api/v1/developers/me');
    }, AUTH_RETRY_OPTIONS);
  }

  async getDeveloperStats(): Promise<DeveloperStats> {
    return this.request('/api/v1/developers/stats');
  }

  async getDeveloperAnalytics(period: string = 'week'): Promise<any> {
    return this.request(`/api/v1/developers/analytics?period=${period}`);
  }

  async getDeveloperSubscription(): Promise<any> {
    return this.request('/api/v1/developers/subscription');
  }

  async getDeveloperProjects(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    project_type?: string;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/developers/projects${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Project endpoints
  async getProjects(params: {
    search?: string;
    city?: string;
    project_type?: string;
    status?: string;
    page?: number;
    per_page?: number;
    sw_lat?: number;
    sw_lng?: number;
    ne_lat?: number;
    ne_lng?: number;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    // Use the real API endpoint now that database connection is fixed
    const endpoint = `/api/v1/projects/${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Analytics endpoints
  async recordProjectView(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/analytics/projects/${projectId}/view`, { method: 'POST' });
  }

  async recordProjectWebsiteClick(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/analytics/projects/${projectId}/click/website`, { method: 'POST' });
  }

  async recordProjectPhoneClick(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/analytics/projects/${projectId}/click/phone`, { method: 'POST' });
  }

  async getProject(id: number): Promise<Project> {
    return this.request(`/api/v1/projects/${id}`);
  }

  async createProject(projectData: any): Promise<Project> {
    return this.request('/api/v1/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Project images
  async uploadProjectImages(projectId: number, files: File[]): Promise<{ images: any[] }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.request(`/api/v1/projects/${projectId}/images`, {
      method: 'POST',
      body: formData,
      // Do not set Content-Type; request() will drop JSON header automatically for FormData
    });
  }

  async getProjectImages(projectId: number): Promise<any[]> {
    return this.request(`/api/v1/projects/${projectId}/images`);
  }

  async deleteProjectImage(projectId: number, imageId: string | number): Promise<{ message: string }> {
    return this.request(`/api/v1/projects/${projectId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  async updateProject(id: number, projectData: any): Promise<Project> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Developer registration
  async registerDeveloper(developerData: {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    office_address: string;
    password: string;
    accept_terms: boolean;
    website?: string;
  }): Promise<{ message: string; developer_id?: string; email?: string; status?: string }> {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('company_name', developerData.company_name);
    params.append('contact_person', developerData.contact_person);
    params.append('email', developerData.email);
    params.append('phone', developerData.phone);
    params.append('password', developerData.password);
    params.append('accept_terms', developerData.accept_terms.toString());
    
    // Add optional parameters if provided
    if (developerData.website) {
      params.append('website', developerData.website);
    }
    if (developerData.office_address) {
      params.append('office_address', developerData.office_address);
    }

    return this.request(`/api/v1/auth/developers/register?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string; status?: string }> {
    return this.request(`/api/v1/auth/developers/verify-email`, {
      method: 'POST',
      body: new URLSearchParams({ token }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // Resend verification email
  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request(`/api/v1/auth/developers/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Developer login with retry logic
  async loginDeveloper(email: string, password: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    user_type: string;
  }> {
    return withRetry(async () => {
      const response = await fetch(`${this.baseURL}/api/v1/auth/token`, {
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
        
        // Handle verification status as special case (still needs JSON)
        if (response.status === 422 && errorData.detail?.verification_status) {
          throw new Error(JSON.stringify(errorData));
        }
        
        // For all other errors, throw the appropriate message
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: Login failed`;
        const error = new Error(errorMessage);
        
        // Add status code for better error handling downstream
        (error as any).statusCode = response.status;
        (error as any).details = errorData;
        
        throw error;
      }

      return response.json();
    }, AUTH_RETRY_OPTIONS); // Use optimized auth retry options
  }

  // Auth health check
  async getAuthHealth(): Promise<{ status: string; auth_provider: string }> {
    return this.request('/api/v1/health');
  }

  // Simple connectivity test
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/docs`);
      if (response.ok) {
        return { status: 'connected', message: 'Backend is reachable' };
      } else {
        return { status: 'error', message: `Backend responded with status: ${response.status}` };
      }
    } catch (error) {
      return { status: 'error', message: `Connection failed: ${error}` };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience functions with proper context binding
export const getDevelopers = () => apiClient.getDevelopers();
export const getCurrentDeveloper = () => apiClient.getCurrentDeveloper();
export const getDeveloperStats = () => apiClient.getDeveloperStats();
export const getDeveloperAnalytics = (period?: string) => apiClient.getDeveloperAnalytics(period);
export const getDeveloperSubscription = () => apiClient.getDeveloperSubscription();
export const getDeveloperProjects = (params?: any) => apiClient.getDeveloperProjects(params);
export const getProjects = (params?: any) => apiClient.getProjects(params);
export const getProject = (id: number) => apiClient.getProject(id);
export const createProject = (projectData: any) => apiClient.createProject(projectData);
export const updateProject = (id: number, projectData: any) => apiClient.updateProject(id, projectData);
export const deleteProject = (id: number) => apiClient.deleteProject(id);
export const recordProjectView = (projectId: string) => apiClient.recordProjectView(projectId);
export const recordProjectWebsiteClick = (projectId: string) => apiClient.recordProjectWebsiteClick(projectId);
export const recordProjectPhoneClick = (projectId: string) => apiClient.recordProjectPhoneClick(projectId);
export const registerDeveloper = (developerData: any) => apiClient.registerDeveloper(developerData);
export const verifyEmail = (token: string) => apiClient.verifyEmail(token);
export const resendVerification = (email: string) => apiClient.resendVerification(email);
export const loginDeveloper = (email: string, password: string) => apiClient.loginDeveloper(email, password);
export const getAuthHealth = () => apiClient.getAuthHealth();
export const testConnection = () => apiClient.testConnection(); 

// Project images exports
export const uploadProjectImages = (projectId: number, files: File[]) => apiClient.uploadProjectImages(projectId, files);
export const getProjectImages = (projectId: number) => apiClient.getProjectImages(projectId);
export const deleteProjectImage = (projectId: number, imageId: string | number) => apiClient.deleteProjectImage(projectId, imageId);









