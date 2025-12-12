// API service layer for Mr. Imot Real Estate Platform
// Now uses HttpOnly cookies for secure authentication

import { withRetry, isNetworkError, getConnectionErrorMessage, AUTH_RETRY_OPTIONS } from './network-utils'

// Types for API responses
export interface Developer {
  id: string;
  slug?: string;
  email?: string;
  company_name: string;
  contact_person: string;
  phone: string;
  office_address: string;
  office_latitude?: number;
  office_longitude?: number;
  website?: string;
  profile_image_url?: string;
  verification_status: string;
  created_at: string;
  project_count?: number;
  active_projects?: number;
  is_verified?: boolean;
}

export interface DeveloperProfile extends Developer {
  total_projects: number;
  projects: Project[];
  projects_pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface DevelopersListResponse {
  developers: Developer[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Waitlist types
export interface WaitlistJoinRequest {
  willingness_to_pay: number;
}

export interface WaitlistJoinResponse {
  success: boolean;
  message: string;
}

export interface WaitlistStatusResponse {
  on_waitlist: boolean;
}

export interface Feature {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: 'building_infrastructure' | 'security_access' | 'amenities' | 'modern_features';
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeaturesByCategory {
  building_infrastructure: Feature[];
  security_access: Feature[];
  amenities: Feature[];
  modern_features: Feature[];
}

export type ProjectStatus = 'active' | 'paused' | 'deleted'

// Minimal response for paused/deleted projects (NO sensitive data)
export interface PausedProject {
  id: string
  status: 'paused'
}

export interface DeletedProject {
  id: string
  status: 'deleted'
}

export interface Project {
  id: number;
  slug?: string; // SEO-friendly URL slug
  title?: string; // May not be present in status responses
  name?: string; // Backend sometimes returns 'name' instead of 'title'
  description?: string; // May not be present in status responses
  location?: string;
  formatted_address?: string;
  city: string;
  neighborhood?: string;
  project_type: string;
  status?: ProjectStatus; // Added status field
  price_from?: number;
  price_to?: number;
  price_per_m2?: string;
  price_label?: string;
  completion_date?: string;
  completion_note?: string;
  expected_completion_date?: string;
  developer_id: number;
  created_at: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
  cover_image_url?: string;
  gallery_urls?: string[];
  amenities_list?: string[];
  features?: Feature[];
  images?: {
    id: string;
    image_url: string;
    is_cover?: boolean;
    created_at?: string;
  }[];
  developer?: {
    id: number;
    slug?: string;
    company_name: string;
    email: string;
    contact_person: string;
    phone: string;
    office_address: string;
    office_latitude?: number;
    office_longitude?: number;
    website: string;
    profile_image_url?: string;
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

// API client class with HttpOnly cookie support
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Build headers - no manual token handling needed
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const mergedHeaders: HeadersInit = {
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
      credentials: 'include', // Always include cookies for authentication
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 401 Unauthorized - user not authenticated
        if (response.status === 401) {
          // Don't redirect automatically - let the auth context or component handle it
          // This prevents unexpected logouts during uploads or long operations
          const authError = new Error('Authentication required');
          (authError as any).statusCode = 401;
          (authError as any).isAuthError = true;
          console.warn('401 Unauthorized response - session may have expired');
          throw authError;
        }
        
        // Handle 403 Forbidden - user authenticated but not authorized
        if (response.status === 403) {
          let errorMessage = 'Access denied';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.detail && errorData.detail.includes('verification required')) {
              errorMessage = 'Account verification required';
              const verificationError = new Error(errorMessage);
              (verificationError as any).isVerificationRequired = true;
              (verificationError as any).statusCode = 403;
              throw verificationError;
            }
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (parseError) {
            // If parsing fails, use default message
          }
          throw new Error(errorMessage);
        }
        
        // Handle 500 errors gracefully
        if (response.status === 500) {
          console.error(`Server Error (${response.status}): ${errorText}`);
          console.error(`Registration error details:`, { url, status: response.status, errorText });
          const serverError = new Error('Server error occurred. Please try again later.');
          (serverError as any).statusCode = 500;
          (serverError as any).isServerError = true;
          throw serverError;
        }
        
        // Try to parse error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle responses with no content (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Public request method without authentication (for public endpoints)
  private async requestWithoutAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      // Don't include credentials for public endpoints
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Public API Error (${response.status}): ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Public API request failed: ${url}`, error);
      throw error;
    }
  }

  // Public request method that doesn't redirect on 401 (for public endpoints)
  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Build headers - no manual token handling needed
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const mergedHeaders: HeadersInit = {
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
      credentials: 'include', // Include cookies but don't redirect on 401
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 404 Not Found
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        
        // Handle 500 errors gracefully
        if (response.status === 500) {
          console.error(`Server Error (${response.status}): ${errorText}`);
          console.error(`Registration error details:`, { url, status: response.status, errorText });
          const serverError = new Error('Server error occurred. Please try again later.');
          (serverError as any).statusCode = 500;
          (serverError as any).isServerError = true;
          throw serverError;
        }
        
        // Try to parse error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle responses with no content (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error(getConnectionErrorMessage());
      }
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{
    message: string;
    user_type: string;
    expires_in: number;
  }> {
    return withRetry(async () => {
      return this.request(`/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
    }, AUTH_RETRY_OPTIONS);
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<any> {
    return withRetry(async () => {
      return this.request('/api/v1/auth/me');
    }, AUTH_RETRY_OPTIONS);
  }

  // Developer endpoints
  async getDevelopers(params: {
    page?: number;
    per_page?: number;
    search?: string;
  } = {}): Promise<DevelopersListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/developers/${queryString ? `?${queryString}` : ''}`;
    
    return this.publicRequest(endpoint);
  }

  async getDeveloper(developerIdentifier: string, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<DeveloperProfile> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const encodedIdentifier = encodeURIComponent(developerIdentifier);
    const endpoint = `/api/v1/developers/${encodedIdentifier}${queryString ? `?${queryString}` : ''}`;
    
    return this.publicRequest(endpoint);
  }

  async getCurrentDeveloper(): Promise<Developer> {
    // Use the dedicated developer profile endpoint
    return this.request('/api/v1/developers/me');
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
    project_status?: string; // Support both 'status' and 'project_status' for backward compatibility
    project_type?: string;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map 'status' to 'project_status' for backend API
        const paramKey = key === 'status' ? 'project_status' : key
        searchParams.append(paramKey, value.toString());
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
    sort_by?: string;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/projects/${queryString ? `?${queryString}` : ''}`;
    
    // Public endpoint - no auth needed
    return this.requestWithoutAuth(endpoint);
  }

  // Analytics endpoints - these are public endpoints that don't require authentication
  async recordProjectView(projectId: string): Promise<{ message: string }> {

    return this.request(`/api/v1/analytics/projects/${projectId}/view`, { method: 'POST' });
  }

  async recordProjectWebsiteClick(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/analytics/projects/${projectId}/click/website`, { method: 'POST' });
  }

  async recordProjectPhoneClick(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/analytics/projects/${projectId}/click/phone`, { method: 'POST' });
  }

  async getProject(id: string): Promise<Project | PausedProject | DeletedProject> {
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
  async uploadProjectImages(projectId: string, files: File[]): Promise<{ images: any[] }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.request(`/api/v1/projects/${projectId}/images`, {
      method: 'POST',
      body: formData,
    });
  }

  async attachProjectImages(
    projectId: string | number,
    images: Array<{ url: string; fileId: string; isCover?: boolean }>
  ): Promise<{ images: any[] }> {
    return this.request(`/api/v1/projects/${projectId}/images/attach`, {
      method: 'POST',
      body: JSON.stringify({ images }),
    });
  }

  async getProjectImages(projectId: string): Promise<any[]> {
    return this.request(`/api/v1/projects/${projectId}/images`);
  }

  async deleteProjectImage(projectId: string, imageId: string | number): Promise<{ message: string }> {
    return this.request(`/api/v1/projects/${projectId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  async updateProject(id: string, projectData: any): Promise<Project> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription-based listing management
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
    office_latitude?: number;
    office_longitude?: number;
  }): Promise<{ message: string; developer_id?: string; email?: string; status?: string }> {
    // Temporary workaround: truncate password to 72 characters to avoid bcrypt error
    // This should be removed once the backend bcrypt configuration is deployed
    const truncatedPassword = developerData.password.length > 72 
      ? developerData.password.substring(0, 72) 
      : developerData.password;
    
    const dataToSend = {
      ...developerData,
      password: truncatedPassword
    };
    
    return this.request(`/api/v1/auth/developers/register`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
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

  // Developer profile management
  async updateDeveloperProfile(profileData: {
    company_name: string;
    contact_person: string;
    phone: string;
    office_address: string;
    website?: string;
    office_latitude?: number;
    office_longitude?: number;
  }): Promise<{ message: string; developer: any }> {
    return this.request('/api/v1/developers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async changeDeveloperPassword(passwordData: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return this.request('/api/v1/developers/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Features endpoints
  async getFeatures(category?: string): Promise<{ features: Feature[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (category) {
      searchParams.append('category', category);
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/features/${queryString ? `?${queryString}` : ''}`;
    
    return this.requestWithoutAuth(endpoint);
  }

  async getFeaturesByCategory(lang?: string): Promise<FeaturesByCategory> {
    const headers: HeadersInit = {};
    if (lang) {
      headers['Accept-Language'] = lang;
    }
    return this.requestWithoutAuth('/api/v1/features/by-category', { headers });
  }

  async getFeature(id: string): Promise<Feature> {
    return this.requestWithoutAuth(`/api/v1/features/${id}`);
  }

  // Health check endpoints
  async getAuthHealth(): Promise<{ status: string; auth_provider: string }> {
    return this.request('/api/v1/auth/health');
  }

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

  // Waitlist endpoints
  async joinWaitlist(willingnessToPay: number): Promise<WaitlistJoinResponse> {
    return this.request('/api/v1/developers/waitlist', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ willingness_to_pay: willingnessToPay }),
    });
  }

  async getWaitlistStatus(): Promise<WaitlistStatusResponse> {
    return this.request('/api/v1/developers/waitlist-status');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

// Export convenience functions with proper context binding
export const login = (email: string, password: string) => apiClient.login(email, password);
export const logout = () => apiClient.logout();
export const getCurrentUser = () => apiClient.getCurrentUser();
export const getDevelopers = (params?: { page?: number; per_page?: number; search?: string }) => apiClient.getDevelopers(params);
export const getDeveloper = (developerId: string, params?: { page?: number; per_page?: number }) => apiClient.getDeveloper(developerId, params);
export const joinWaitlist = (willingnessToPay: number) => apiClient.joinWaitlist(willingnessToPay);
export const getWaitlistStatus = () => apiClient.getWaitlistStatus();
export const getCurrentDeveloper = () => apiClient.getCurrentDeveloper();
export const getDeveloperStats = () => apiClient.getDeveloperStats();
export const getDeveloperAnalytics = (period?: string) => apiClient.getDeveloperAnalytics(period);
export const getDeveloperSubscription = () => apiClient.getDeveloperSubscription();
export const getDeveloperProjects = (params?: any) => apiClient.getDeveloperProjects(params);
export const getProjects = (params?: any) => apiClient.getProjects(params);
export const getProject = (id: string): Promise<Project | PausedProject | DeletedProject> => apiClient.getProject(id);
export const getProjectFormData = () => apiClient.getProjectFormData();
export const createProject = (projectData: any) => apiClient.createProject(projectData);
export const updateProject = (id: string, projectData: any) => apiClient.updateProject(id, projectData);
export const deleteProject = (id: string) => apiClient.deleteProject(id);
export const recordProjectView = (projectId: string) => apiClient.recordProjectView(projectId);
export const recordProjectWebsiteClick = (projectId: string) => apiClient.recordProjectWebsiteClick(projectId);
export const recordProjectPhoneClick = (projectId: string) => apiClient.recordProjectPhoneClick(projectId);
export const registerDeveloper = (developerData: any) => apiClient.registerDeveloper(developerData);
export const verifyEmail = (token: string) => apiClient.verifyEmail(token);
export const resendVerification = (email: string) => apiClient.resendVerification(email);
export const updateDeveloperProfile = (profileData: any) => apiClient.updateDeveloperProfile(profileData);
export const changeDeveloperPassword = (passwordData: any) => apiClient.changeDeveloperPassword(passwordData);
export const getFeatures = (category?: string) => apiClient.getFeatures(category);
export const getFeaturesByCategory = (lang?: string) => apiClient.getFeaturesByCategory(lang);
export const getFeature = (id: string) => apiClient.getFeature(id);
export const getAuthHealth = () => apiClient.getAuthHealth();
export const testConnection = () => apiClient.testConnection(); 

// Project images exports
export const uploadProjectImages = (projectId: string, files: File[]) => apiClient.uploadProjectImages(projectId, files);
export const getProjectImages = (projectId: string) => apiClient.getProjectImages(projectId);
export const deleteProjectImage = (projectId: string, imageId: string | number) => apiClient.deleteProjectImage(projectId, imageId);
export const attachProjectImages = (
  projectId: string | number,
  images: Array<{ url: string; fileId: string; isCover?: boolean }>
) => apiClient.attachProjectImages(projectId, images);

// Subscription-based listing management exports
export const toggleProjectActive = (projectId: number) => apiClient.toggleProjectActive(projectId);
export const getDeveloperListingStats = () => apiClient.getDeveloperListingStats();

// Keep legacy function names for compatibility during migration
export const loginDeveloper = login; // Deprecated: use login instead
