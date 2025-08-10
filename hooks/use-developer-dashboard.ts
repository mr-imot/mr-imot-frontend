import { useState, useEffect } from 'react';
import { getDeveloperStats, getDeveloperAnalytics, getDeveloperProjects } from '@/lib/api';

interface DashboardStats {
  total_projects: number;
  total_views: number;
  total_inquiries: number;
  total_website_clicks?: number;
  total_phone_clicks?: number;
  projects_growth?: string;
  views_growth?: string;
  website_clicks_growth?: string;
  phone_clicks_growth?: string;
}

interface UseDeveloperDashboardResult {
  stats: DashboardStats | null;
  analytics: any;
  projects: any[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Transform API project data to dashboard format
const transformProjectForDashboard = (project: any) => {
  return {
    id: project.id,
    title: project.title || project.name,
    status: project.is_active ? 'active' : 'inactive',
    views: project.total_views || 0,
    websiteClicks: project.total_clicks_website || 0,
    phoneClicks: project.total_clicks_phone || 0,
    contactMessages: 0,
    savedCount: 0,
    dateCreated: project.created_at ? new Date(project.created_at).toISOString().split('T')[0] : undefined,
    price: project.price_label || 'Price on request',
    type: project.project_type,
    location: project.city,
  };
};

export const useDeveloperDashboard = (period: string = 'week'): UseDeveloperDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // OPTIMIZATION: Set loading to false early to show partial data
      // Use a timeout to prevent indefinite loading states
      const timeoutId = setTimeout(() => {
        setLoading(false);
        console.warn('Dashboard data loading timeout, showing partial results');
      }, 3000); // 3 second timeout for better UX

      // Fetch all dashboard data in parallel with individual timeouts
      const [statsData, analyticsData, projectsData] = await Promise.allSettled([
        Promise.race([
          getDeveloperStats(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Stats timeout')), 2000)
          )
        ]),
        Promise.race([
          getDeveloperAnalytics(period),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analytics timeout')), 2000)
          )
        ]),
        Promise.race([
          getDeveloperProjects({ per_page: 20 }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Projects timeout')), 2000)
          )
        ])
      ]);

      clearTimeout(timeoutId);

      // Handle stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        console.error('Failed to fetch stats:', statsData.reason);
        // Set default stats to prevent blank UI
        setStats({
          total_projects: 0,
          active_projects: 0,
          total_views: 0,
          total_inquiries: 0
        });
      }

      // Handle analytics
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        console.error('Failed to fetch analytics:', analyticsData.reason);
        // Keep analytics as null - component should handle this gracefully
      }

      // Handle projects
      if (projectsData.status === 'fulfilled') {
        const transformedProjects = (projectsData.value.projects || []).map(transformProjectForDashboard);
        setProjects(transformedProjects);
      } else {
        console.error('Failed to fetch projects:', projectsData.reason);
        setProjects([]); // Show empty array instead of null for better UX
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