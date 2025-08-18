// API service layer for NovaDom Real Estate Platform
// Handles all backend communication with proper authentication

import { withRetry, isNetworkError, getConnectionErrorMessage, AUTH_RETRY_OPTIONS } from './network-utils'

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
    const headers: HeadersInit = {};

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
    
    // Set default Content-Type to application/json if not specified and not FormData
    if (!isFormData && !('Content-Type' in mergedHeaders)) {
      (mergedHeaders as Record<string, string>)['Content-Type'] = 'application/json';
    }
    
    if (isFormData && 'Content-Type' in (mergedHeaders as Record<string, any>)) {
      // Let the browser set the correct multipart boundary
      delete (mergedHeaders as Record<string, any>)["Content-Type"];
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, config);

      // DEBUG: Log the request details
      console.log('🔍 API Request Debug:', {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body,
        hasAuthHeader: 'Authorization' in (config.headers as Record<string, any>)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 401 Unauthorized - token expired/invalid
        if (response.status === 401) {
          console.log('🔒 Token expired/invalid - clearing auth and redirecting to login');
          console.log('🔍 DEBUG: Token that failed:', await this.getAuthHeaders());
          console.log('🔍 DEBUG: Response details:', response.status, response.statusText);
          
          // TEMPORARILY DISABLED FOR DEBUGGING
          // localStorage.removeItem('auth_token');
          // localStorage.removeItem('auth_expires');
          // localStorage.removeItem('user_email');
          
          // TEMPORARILY DISABLED FOR DEBUGGING
          // if (typeof window !== 'undefined') {
          //   window.location.href = '/login';
          // }
          
          const authError = new Error('Authentication failed - DEBUG MODE');
          (authError as any).isAuthExpired = true;
          (authError as any).statusCode = 401;
          throw authError;
        }
        
        // Handle 500 errors more gracefully - don't log out user for server errors
        if (response.status === 500) {
          console.error(`❌ Server Error (${response.status}): ${errorText}`);
          const serverError = new Error('Server error occurred. Please try again later.');
          (serverError as any).statusCode = 500;
          (serverError as any).isServerError = true;
          throw serverError;
        }
        
        // Try to parse the error as JSON to get a better error message
        let errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        let isVerificationError = false;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Handle specific error cases
          if (response.status === 403 && errorData.message && 
              (errorData.message.includes('verification required') || 
               errorData.message.includes("don't have permission") ||
               errorData.message.includes("access this resource"))) {
            isVerificationError = true;
            // Create a special error for verification required
            const verificationError = new Error('Account verification required');
            (verificationError as any).isVerificationRequired = true;
            (verificationError as any).statusCode = 403;
            (verificationError as any).originalMessage = errorData.message;
            throw verificationError;
          }
        } catch (parseError) {
          // If parsing fails, check if it might be a verification error based on status code
          if (response.status === 403) {
            isVerificationError = true;
          }
          // Don't log parsing failures for verification errors
          if (!isVerificationError) {
            console.log('Failed to parse error as JSON, using generic error');
          }
        }
        
        // Only log errors that are not verification-related
        if (!isVerificationError) {
          console.error(`❌ API Error Response (${response.status}): ${errorText}`);
        } else {
          console.log(`🔒 Verification required (${response.status}): User needs manual approval`);
        }
        
        // For verification errors, create a special error even if JSON parsing failed
        if (isVerificationError && response.status === 403) {
          const verificationError = new Error('Account verification required');
          (verificationError as any).isVerificationRequired = true;
          (verificationError as any).statusCode = 403;
          throw verificationError;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Don't log verification errors or auth expired errors as failures - they're expected
      if (!(error as any).isVerificationRequired && !(error as any).isAuthExpired) {
        console.error(`❌ API request failed: ${url}`, error);
      }
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
    const endpoint = `/api/v1/projects${queryString ? `?${queryString}` : ''}`;
    
    // For public projects endpoint, don't send auth headers that might cause issues
    return this.requestWithoutAuth(endpoint);
  }

  // Public request method without authentication headers
  private async requestWithoutAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log('🔍 Public API Request:', { url, status: response.status });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Public API Error (${response.status}): ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Public API request failed: ${url}`, error);
      throw error;
    }
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

  async getProjectFormData(): Promise<any> {
    return this.request('/api/v1/projects/form-data');
  }

  async createProject(projectData: any): Promise<Project> {
    return this.request('/api/v1/projects', {
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

  // Preferred: attach already-uploaded ImageKit files by URL + fileId
  async attachProjectImages(
    projectId: string | number,
    images: Array<{ url: string; fileId: string; isCover?: boolean }>
  ): Promise<{ images: any[] }> {
    return this.request(`/api/v1/projects/${projectId}/images/attach`, {
      method: 'POST',
      body: JSON.stringify({ images }),
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

  // New subscription-based listing management
  async toggleProjectActive(projectId: number): Promise<{ message: string }> {
    return this.request(`/api/v1/projects/${projectId}/toggle-active`, {
      method: 'PATCH',
    });
  }

  async getDeveloperListingStats(): Promise<{
    total_projects: number;
    active_projects: number;
    subscription_plan: string;
    max_active_listings: string;
    can_activate_more: boolean;
    remaining_activations: string;
  }> {
    return this.request('/api/v1/projects/developer/listing-stats');
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
    return this.request(`/api/v1/auth/developers/register`, {
      method: 'POST',
      body: JSON.stringify(developerData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string; status?: string }> {
    return this.request(`/api/v1/auth/developers/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST',
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
      // Use the request method to get proper authentication headers
      return this.request(`/api/v1/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
    }, AUTH_RETRY_OPTIONS); // Use optimized auth retry options
  }

  // Auth health check
  async getAuthHealth(): Promise<{ status: string; auth_provider: string }> {
    return this.request('/api/v1/health');
  }

  // Simple connectivity test
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`/docs`);
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
export const apiClient = new ApiClient("");

// Export convenience functions with proper context binding
export const getDevelopers = () => apiClient.getDevelopers();
export const getCurrentDeveloper = () => apiClient.getCurrentDeveloper();
export const getDeveloperStats = () => apiClient.getDeveloperStats();
export const getDeveloperAnalytics = (period?: string) => apiClient.getDeveloperAnalytics(period);
export const getDeveloperSubscription = () => apiClient.getDeveloperSubscription();
export const getDeveloperProjects = (params?: any) => apiClient.getDeveloperProjects(params);
export const getProjects = (params?: any) => apiClient.getProjects(params);
export const getProject = (id: number) => apiClient.getProject(id);
export const getProjectFormData = () => apiClient.getProjectFormData();
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
export const attachProjectImages = (
  projectId: string | number,
  images: Array<{ url: string; fileId: string; isCover?: boolean }>
) => apiClient.attachProjectImages(projectId, images);

// New subscription-based listing management exports
export const toggleProjectActive = (projectId: number) => apiClient.toggleProjectActive(projectId);
export const getDeveloperListingStats = () => apiClient.getDeveloperListingStats(); 









