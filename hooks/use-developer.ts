import { useState, useEffect } from 'react';
import { getDeveloper, DeveloperProfile } from '@/lib/api';

interface UseDeveloperResult {
  developer: DeveloperProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseDeveloperParams {
  page?: number;
  per_page?: number;
}

export const useDeveloper = (developerId: string, params: UseDeveloperParams = {}): UseDeveloperResult => {
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeveloper = async () => {
    if (!developerId) {
      setError('Developer ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: DeveloperProfile = await getDeveloper(developerId, params);
      setDeveloper(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch developer');
      console.error('Error fetching developer:', err);
      setDeveloper(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeveloper();
  }, [developerId, params.page, params.per_page]);

  const refetch = () => {
    fetchDeveloper();
  };

  return {
    developer,
    loading,
    error,
    refetch,
  };
};
