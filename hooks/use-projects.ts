import { useState, useEffect } from 'react';
import { getProjects, ProjectListResponse } from '@/lib/api';

interface UseProjectsParams {
  search?: string;
  city?: string;
  project_type?: string;
  status?: string;
  page?: number;
  per_page?: number;
  // Optional viewport bounds for map queries
  sw_lat?: number;
  sw_lng?: number;
  ne_lat?: number;
  ne_lng?: number;
}

interface UseProjectsResult {
  projects: any[] | null;
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Transform API project data to PropertyData format
const transformProjectToPropertyData = (project: any) => {
  const title: string = project.title || project.name || 'Project';
  const city: string = project.city || project.location || '';
  const priceLabel: string | undefined = project.price_label || project.price_per_m2;
  const images: string[] = Array.isArray(project.images)
    ? project.images.map((img: any) => img?.urls?.card || img?.image_url).filter(Boolean)
    : [];
  const cover = project.cover_image_url || images[0] || '/placeholder.svg?height=300&width=400';
  return {
    id: String(project.id),
    slug: project.slug || String(project.id), // Use actual slug from API, fallback to ID
    title,
    priceRange: priceLabel ? `${priceLabel}` : 'Price on request',
    shortPrice: priceLabel || 'Request price',
    location: project.neighborhood ? `${project.neighborhood}, ${city}` : city,
    image: cover,
    images: images.length > 0 ? images : [cover],
    description: project.description || '',
    lat: typeof project.latitude === 'number' ? project.latitude : 42.6977,
    lng: typeof project.longitude === 'number' ? project.longitude : 23.3219,
    color: getColorForProject(project.id),
    type: mapProjectType(project.project_type),
    status: mapProjectStatus(project.status),
    developer: project.developer?.company_name || 'Unknown Developer',
    completionDate: project.expected_completion_date ? 
      new Date(project.expected_completion_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }) : 'TBD',
    rating: 4.5 + Math.random() * 0.4, // Random rating for now
    reviews: Math.floor(Math.random() * 30) + 5, // Random reviews for now
    features: project.amenities_list && project.amenities_list.length > 0 ? project.amenities_list : ['Modern Design', 'Quality Construction'],
    originalPrice: undefined,
  };
};

// Helper functions for data transformation
const getColorForProject = (id: string) => {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-orange-500 to-orange-700',
    'from-red-500 to-red-700',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
    'from-pink-500 to-pink-700',
  ];
  // Use hash of UUID string to get consistent color
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

const mapProjectType = (apiType: string) => {
  const typeMap: { [key: string]: string } = {
    'APARTMENT': 'Apartment Complex',
    'apartment': 'Apartment Complex',
    'apartment_building': 'Apartment Complex',
    'APARTMENT_BUILDING': 'Apartment Complex',
    'HOUSE': 'Residential Houses',
    'house': 'Residential Houses',
    'house_complex': 'Residential Houses',
    'HOUSE_COMPLEX': 'Residential Houses',

  };
  return typeMap[apiType] || 'Apartment Complex';
};

const mapProjectStatus = (apiStatus: string) => {
  const statusMap: { [key: string]: string } = {
    'UNDER_CONSTRUCTION': 'Under Construction',
    'under_construction': 'Under Construction',
    'PLANNING': 'Foundation Laid',
    'planning': 'Foundation Laid',
    'COMPLETED': 'Pre-Sales Open',
    'completed': 'Pre-Sales Open',
    'PRE_SALES': 'Pre-Sales Open',
    'pre_sales': 'Pre-Sales Open',
  };
  return statusMap[apiStatus] || 'Under Construction';
};

export const useProjects = (params: UseProjectsParams = {}): UseProjectsResult => {
  const [projects, setProjects] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data: ProjectListResponse = await getProjects(params);
      
      const transformedProjects = (data.projects || []).map(transformProjectToPropertyData);
      
      setProjects(transformedProjects);
      setTotal(data.total || transformedProjects.length);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load properties';
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. The server is taking too long to respond.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Properties service is currently unavailable.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      // Set projects to null only on actual API failure
      setProjects(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't fetch if per_page is 0 (indicates no bounds available yet)
    if (params.per_page === 0) {
      setLoading(false);
      setProjects([]);
      setTotal(0);
      return;
    }
    
    fetchProjects();
  }, [
    params.search,
    params.city,
    params.project_type,
    params.status,
    params.page,
    params.per_page,
    params.sw_lat,
    params.sw_lng,
    params.ne_lat,
    params.ne_lng
  ]); // Re-fetch when individual params change

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    total,
    loading,
    error,
    refetch,
  };
}; 