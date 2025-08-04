// API service layer for NovaDom Real Estate Platform
// Handles all backend communication with proper authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    // TODO: Get Supabase JWT token when auth is set up
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // If we have a Supabase session, add the JWT token
    if (typeof window !== 'undefined') {
      // This will be implemented when Supabase is set up
      // const { data: { session } } = await supabase.auth.getSession();
      // if (session?.access_token) {
      //   headers.Authorization = `Bearer ${session.access_token}`;
      // }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error Response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
    project_type?: string;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    // Use the real API endpoint for developer projects
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

  async getProject(id: number): Promise<Project> {
    return this.request(`/api/v1/projects/${id}`);
  }

  async createProject(projectData: any): Promise<Project> {
    return this.request('/api/v1/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
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
  }): Promise<{ message: string; developer_id?: number }> {
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
export const registerDeveloper = (developerData: any) => apiClient.registerDeveloper(developerData);
export const getAuthHealth = () => apiClient.getAuthHealth();
export const testConnection = () => apiClient.testConnection(); 