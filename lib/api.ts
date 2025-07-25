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
  location: string;
  city: string;
  project_type: string;
  status: string;
  price_from?: number;
  price_to?: number;
  completion_date?: string;
  developer_id: number;
  created_at: string;
  updated_at: string;
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
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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

  // Auth health check
  async getAuthHealth(): Promise<{ status: string; auth_provider: string }> {
    return this.request('/api/v1/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience functions
export const {
  getDevelopers,
  getCurrentDeveloper,
  getDeveloperStats,
  getDeveloperAnalytics,
  getDeveloperSubscription,
  getDeveloperProjects,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getAuthHealth,
} = apiClient; 