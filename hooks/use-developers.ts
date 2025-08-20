import { useState, useEffect } from 'react';
import { getDevelopers } from '@/lib/api';

interface UseDevelopersResult {
  developers: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDevelopers = (): UseDevelopersResult => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDevelopers();
      setDevelopers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch developers');
      console.error('Error fetching developers:', err);
      setDevelopers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const refetch = () => {
    fetchDevelopers();
  };

  return {
    developers,
    loading,
    error,
    refetch,
  };
}; 