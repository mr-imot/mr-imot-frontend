import useSWR from 'swr'
import { useMemo } from 'react'
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
  const { data: stats, error: statsErr, isLoading: statsLoading, mutate: refetchStats } = useSWR(
    ['developer/stats'],
    () => getDeveloperStats(),
    { dedupingInterval: 30000, revalidateOnFocus: false }
  )

  const { data: analytics, error: analyticsErr, isLoading: analyticsLoading, mutate: refetchAnalytics } = useSWR(
    ['developer/analytics', period],
    () => getDeveloperAnalytics(period),
    { dedupingInterval: 30000, revalidateOnFocus: false }
  )

  const { data: projectsResp, error: projectsErr, isLoading: projectsLoading, mutate: refetchProjects } = useSWR(
    ['developer/projects'],
    () => getDeveloperProjects({ per_page: 100 }),
    { dedupingInterval: 30000, revalidateOnFocus: false }
  )

  const projects = useMemo(() => {
    const list = projectsResp?.projects || []
    return list.map(transformProjectForDashboard)
  }, [projectsResp])

  const loading = statsLoading || analyticsLoading || projectsLoading
  const error = statsErr?.message || analyticsErr?.message || projectsErr?.message || null

  const refetch = () => {
    refetchStats()
    refetchAnalytics()
    refetchProjects()
  }

  return {
    stats: (stats as any) || null,
    analytics: (analytics as any) || null,
    projects,
    loading,
    error,
    refetch,
  }
}