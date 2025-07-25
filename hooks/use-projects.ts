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
  projects: any[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProjects = (params: UseProjectsParams = {}): UseProjectsResult => {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: ProjectListResponse = await getProjects(params);
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
      // For now, keep using empty array if API fails
      setProjects([]);
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