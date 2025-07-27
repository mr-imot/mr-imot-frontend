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
  projects: any[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Transform API project data to dashboard format
const transformProjectForDashboard = (project: any) => {
  return {
    id: project.id,
    title: project.title,
    status: project.status === 'UNDER_CONSTRUCTION' ? 'Active' : 
           project.status === 'PLANNING' ? 'Planning' : 'Completed',
    views: Math.floor(Math.random() * 1000) + 100, // Mock data for now
    websiteClicks: Math.floor(Math.random() * 100) + 10,
    phoneClicks: Math.floor(Math.random() * 30) + 5,
    contactMessages: Math.floor(Math.random() * 20) + 2,
    savedCount: Math.floor(Math.random() * 50) + 10,
    dateCreated: project.created_at ? new Date(project.created_at).toISOString().split('T')[0] : '2024-01-01',
    price: project.price_per_m2 ? `${project.price_per_m2}/m²` : 'Price on request',
    type: project.project_type === 'APARTMENT' ? 'Residential' : 
          project.project_type === 'HOUSE' ? 'Residential' : 'Commercial',
    location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
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
        const transformedProjects = (projectsData.value.projects || []).map(transformProjectForDashboard);
        setProjects(transformedProjects);
      } else {
        console.error('Failed to fetch projects:', projectsData.reason);
        setProjects(null);
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