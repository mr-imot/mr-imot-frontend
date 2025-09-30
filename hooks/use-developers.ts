import { useState, useEffect } from 'react';
import { getDevelopers, DevelopersListResponse } from '@/lib/api';

interface UseDevelopersResult {
  developers: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface UseDevelopersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const useDevelopers = (params: UseDevelopersParams = {}): UseDevelopersResult => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseDevelopersResult['pagination']>();

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: DevelopersListResponse = await getDevelopers(params);
      setDevelopers(data.developers);
      setPagination({
        total: data.total,
        page: data.page,
        per_page: data.per_page,
        total_pages: data.total_pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch developers');
      console.error('Error fetching developers:', err);
      setDevelopers([]);
      setPagination(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, [params.page, params.per_page, params.search]);

  const refetch = () => {
    fetchDevelopers();
  };

  return {
    developers,
    loading,
    error,
    refetch,
    pagination,
  };
}; 