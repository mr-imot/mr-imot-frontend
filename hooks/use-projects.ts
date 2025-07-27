import { useState, useEffect } from 'react';
import { getProjects, ProjectListResponse } from '@/lib/api';

interface UseProjectsParams {
  search?: string;
  city?: string;
  project_type?: string;
  status?: string;
  page?: number;
  per_page?: number;
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
  return {
    id: project.id,
    slug: project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    title: project.title,
    priceRange: project.price_per_m2 ? `${project.price_per_m2}/m²` : 'Price on request',
    shortPrice: project.price_per_m2 ? project.price_per_m2 : '€0k',
    location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
    image: project.cover_image_url || '/placeholder.svg?height=300&width=400',
    description: project.description,
    lat: project.latitude || 42.6977, // Default to Sofia center if no coordinates
    lng: project.longitude || 23.3219,
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
    features: project.amenities_list || ['Modern Design', 'Quality Construction'],
    originalPrice: undefined,
  };
};

// Helper functions for data transformation
const getColorForProject = (id: number) => {
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
  return colors[id % colors.length];
};

const mapProjectType = (apiType: string) => {
  const typeMap: { [key: string]: string } = {
    'APARTMENT': 'Apartment Complex',
    'HOUSE': 'Residential Houses',
    'MIXED_USE': 'Mixed-Use Building',
    'OFFICE': 'Mixed-Use Building',
  };
  return typeMap[apiType] || 'Apartment Complex';
};

const mapProjectStatus = (apiStatus: string) => {
  const statusMap: { [key: string]: string } = {
    'UNDER_CONSTRUCTION': 'Under Construction',
    'PLANNING': 'Foundation Laid',
    'COMPLETED': 'Pre-Sales Open',
    'PRE_SALES': 'Pre-Sales Open',
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
      console.log('🔍 Fetching projects with params:', params);
      
      const data: ProjectListResponse = await getProjects(params);
      console.log('📡 Raw API response:', data);
      
      // Transform the API data to PropertyData format
      const transformedProjects = (data.projects || []).map(transformProjectToPropertyData);
      console.log('🔄 Transformed projects:', transformedProjects);
      
      setProjects(transformedProjects);
      setTotal(data.total || 0);
      console.log('✅ Successfully set projects:', transformedProjects.length, 'total:', data.total);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      // Return null when API fails so fallback logic works correctly
      setProjects(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [JSON.stringify(params)]); // Re-fetch when params change

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