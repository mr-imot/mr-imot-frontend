import { useState, useEffect } from 'react';
import { getDeveloperStats, getDeveloperAnalytics, getDeveloperProjects } from '@/lib/api';

interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_views: number;
  total_inquiries: number;
}

interface UseDeveloperDashboardResult {
  stats: DashboardStats | null;
  analytics: any;
  projects: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDeveloperDashboard = (period: string = 'week'): UseDeveloperDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsData, analyticsData, projectsData] = await Promise.allSettled([
        getDeveloperStats(),
        getDeveloperAnalytics(period),
        getDeveloperProjects({ per_page: 20 })
      ]);

      // Handle stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        console.error('Failed to fetch stats:', statsData.reason);
      }

      // Handle analytics
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        console.error('Failed to fetch analytics:', analyticsData.reason);
      }

      // Handle projects
      if (projectsData.status === 'fulfilled') {
        setProjects(projectsData.value.projects || []);
      } else {
        console.error('Failed to fetch projects:', projectsData.reason);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    stats,
    analytics,
    projects,
    loading,
    error,
    refetch,
  };
}; 