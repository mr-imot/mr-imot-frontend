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
    id: Number(project.id) || parseInt(project.id) || 0,
    slug: String(title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    title,
    priceRange: priceLabel ? `${priceLabel}` : 'Price on request',
    shortPrice: priceLabel || '€0k',
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
    'apartment': 'Apartment Complex',
    'apartment_building': 'Apartment Complex',
    'APARTMENT_BUILDING': 'Apartment Complex',
    'HOUSE': 'Residential Houses',
    'house': 'Residential Houses',
    'house_complex': 'Residential Houses',
    'HOUSE_COMPLEX': 'Residential Houses',
    'MIXED_USE': 'Mixed-Use Building',
    'mixed_use': 'Mixed-Use Building',
    'OFFICE': 'Mixed-Use Building',
    'office': 'Mixed-Use Building',
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
      console.log('🔍 Fetching projects with params:', params);
      
      const data: ProjectListResponse = await getProjects(params);
      console.log('📡 Raw API response:', data);
      console.log('📡 Raw API response projects count:', data.projects?.length || 0);
      console.log('📡 Raw API response total:', data.total);
      
      // Transform the API data to PropertyData format
      const transformedProjects = (data.projects || []).map(transformProjectToPropertyData);
      console.log('🔄 Transformed projects:', transformedProjects);
      console.log('🔄 Transformed projects count:', transformedProjects.length);
      
      // Always set projects, even if empty (this indicates successful API call)
      setProjects(transformedProjects);
      setTotal(data.total || 0);
      console.log('✅ Successfully set projects:', transformedProjects.length, 'total:', data.total);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      // Set projects to null only on actual API failure
      setProjects(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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