"use client"

import { formatDate, formatTime } from "@/lib/date-formatter"

// Admin Dashboard Main Page
// Provides overview of system statistics and pending developer applications

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/admin/protected-route';

import { SessionTimeoutWarning } from '@/components/admin/session-timeout-warning';
import { NotificationCenter } from '@/components/admin/notification-center';
import { AuditLogs } from '@/components/admin/audit-logs';
import { ActivityTimeline } from '@/components/admin/activity-timeline';
import { EnhancedSystemHealth } from '@/components/admin/enhanced-system-health';
import { QuickHealthStatus } from '@/components/admin/quick-health-status';
import { 
  getDeveloperStats, 
  getRecentActivity, 
  getSystemHealth,
  getPendingDevelopers,
  verifyDeveloper,
  rejectDeveloper,
  getAdminStats,
  AdminApiError,
  type PendingDeveloper,
  type DeveloperStats,
  type AdminStats,
  type SystemHealth
} from '@/lib/admin-api';
import { 
  notifyDeveloperVerified, 
  notifyDeveloperRejected 
} from '@/lib/admin-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Activity,
  Shield,
  Mail,
  Settings,
  Database,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

function AdminDashboardContent() {
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [pendingDevelopers, setPendingDevelopers] = useState<PendingDeveloper[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingDevelopers, setProcessingDevelopers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsData, adminStatsData, developersData, activityData, healthData] = await Promise.all([
        getDeveloperStats(),
        getAdminStats(),
        getPendingDevelopers(),
        getRecentActivity(),
        getSystemHealth(),
      ]);

      setStats(statsData);
      setAdminStats(adminStatsData);
      setPendingDevelopers(developersData);
      setRecentActivity(activityData);
      setSystemHealth(healthData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update last updated time after mount (SSR-safe)
  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, []);

  const handleDeveloperAction = async (developerId: string, action: 'verify' | 'reject') => {
    try {
      setProcessingDevelopers(prev => new Set(prev).add(developerId));
      
      // Find the developer for notification
      const developer = pendingDevelopers.find(dev => dev.id === developerId);
      
      if (action === 'verify') {
        await verifyDeveloper(developerId);
        
        // Send verification notification
        if (developer) {
          try {
            const result = await notifyDeveloperVerified(developer);
            if (result.success) {
              toast.success('Verification email sent successfully');
              setPendingDevelopers(prev => 
                prev.filter(d => d.email !== developer.email)
              );
            } else {
              console.warn('Failed to send verification notification:', result.message);
            }
          } catch (notificationError) {
            console.error('Error sending verification notification:', notificationError);
          }
        }
      } else {
        await rejectDeveloper(developerId);
        
        // Send rejection notification
        if (developer) {
          try {
            const result = await notifyDeveloperRejected(developer);
            if (result.success) {
              toast.success('Rejection email sent successfully');
              setPendingDevelopers(prev => 
                prev.filter(d => d.email !== developer.email)
              );
            } else {
              console.warn('Failed to send rejection notification:', result.message);
            }
          } catch (notificationError) {
            console.error('Error sending rejection notification:', notificationError);
          }
        }
      }

      // Remove from pending list
      setPendingDevelopers(prev => prev.filter(dev => dev.id !== developerId));
      
      // Immediately update stats optimistically for better UX
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_pending: Math.max(0, prev.total_pending - 1),
          total_verified: action === 'verify' ? prev.total_verified + 1 : prev.total_verified,
          total_rejected: action === 'reject' ? prev.total_rejected + 1 : prev.total_rejected,
        } : null);
      }
      
      // Fetch fresh stats from backend to ensure accuracy
      try {
        const [updatedStats, updatedAdminStats, updatedActivity] = await Promise.all([
          getDeveloperStats(),
          getAdminStats(),
          getRecentActivity()
        ]);
        setStats(updatedStats);
        setAdminStats(updatedAdminStats);
        setRecentActivity(updatedActivity);
      } catch (statsError) {
        console.error('Error fetching updated stats:', statsError);
        // Keep the optimistic update if backend fails
      }

    } catch (err) {
      console.error(`Error ${action}ing developer:`, err);
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError(`Failed to ${action} developer. Please try again.`);
      }
    } finally {
      setProcessingDevelopers(prev => {
        const newSet = new Set(prev);
        newSet.delete(developerId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of system activity and developer management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdatedTime || 'Loading...'}
          </Badge>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Developers"
          value={adminStats?.total_developers || stats?.total_verified || 0}
          icon={Users}
          color="blue"
          change={`${adminStats?.total_verified_developers || 0} verified`}
          hasError={!!stats?.error}
        />
        <StatCard
          title="Pending Verifications"
          value={stats?.total_pending || 0}
          icon={Clock}
          color="orange"
          change={`${stats?.recent_applications || 0} new today`}
          hasError={!!stats?.error}
        />
        <StatCard
          title="Total Projects"
          value={adminStats?.total_projects || 0}
          icon={Database}
          color="green"
          change="Active listings"
        />
        <StatCard
          title="System Health"
          value={systemHealth?.status === 'healthy' ? 'Healthy' : 'Issues'}
          icon={systemHealth?.status === 'healthy' ? CheckCircle : AlertTriangle}
          color={systemHealth?.status === 'healthy' ? 'green' : 'red'}
          change={systemHealth?.lastChecked ? 'Last checked: ' + formatTime(systemHealth.lastChecked) : 'Unknown'}
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="developers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Developers</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System Health</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Developers */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Pending Developer Applications</span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {pendingDevelopers.length} pending
                  </Badge>
                </CardHeader>
                <CardContent>
                  {pendingDevelopers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No pending developer applications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingDevelopers.slice(0, 5).map((developer) => (
                        <DeveloperApplicationCard
                          key={developer.id}
                          developer={developer}
                          onVerify={() => handleDeveloperAction(developer.id, 'verify')}
                          onReject={() => handleDeveloperAction(developer.id, 'reject')}
                          isProcessing={processingDevelopers.has(developer.id)}
                        />
                      ))}
                      {pendingDevelopers.length > 5 && (
                        <div className="text-center pt-4 border-t">
                          <Button variant="outline" asChild>
                            <Link href="/admin/developers">
                              View All {pendingDevelopers.length} Applications
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced System Health & Recent Activity */}
            <div className="space-y-6">
              {/* Quick System Health Status */}
              <QuickHealthStatus healthData={systemHealth} />

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verified Developers</span>
                    <Badge variant="outline">{adminStats?.total_verified_developers || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected Applications</span>
                    <Badge variant="outline">{adminStats?.total_rejected_developers || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <Badge variant="outline">{adminStats?.total_projects || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Activity</span>
                    <Badge variant="outline">{adminStats?.recent_activity_count || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Developers Tab */}
        <TabsContent value="developers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Developer Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDevelopers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending developer applications</p>
                  </div>
                ) : (
                  pendingDevelopers.map((developer) => (
                    <DeveloperApplicationCard
                      key={developer.id}
                      developer={developer}
                      onVerify={() => handleDeveloperAction(developer.id, 'verify')}
                      onReject={() => handleDeveloperAction(developer.id, 'reject')}
                      isProcessing={processingDevelopers.has(developer.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Health Dashboard</h2>
              <p className="text-gray-600">
                Real-time monitoring of system performance, database connectivity, and resource usage.
              </p>
            </div>
            <EnhancedSystemHealth refreshInterval={15000} />
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityTimeline />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <AuditLogs />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter pendingDevelopers={pendingDevelopers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Statistics Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change,
  hasError = false
}: { 
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'orange' | 'green' | 'red' | 'blue';
  change: string;
  hasError?: boolean;
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs mt-1 ${hasError ? 'text-red-500' : 'text-gray-500'}`}>
              {hasError && <AlertTriangle className="h-3 w-3 inline mr-1" />}
              {change}
            </p>
          </div>
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Developer Application Card Component
function DeveloperApplicationCard({
  developer,
  onVerify,
  onReject,
  isProcessing,
}: {
  developer: PendingDeveloper;
  onVerify: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {developer.company_name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{developer.company_name}</p>
            <p className="text-sm text-gray-500">{developer.contact_person}</p>
            <p className="text-xs text-gray-400">{developer.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <span>📞 {developer.phone}</span>
          {developer.website && (
            <a 
              href={developer.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              <span>🌐 Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <span className="text-xs text-gray-400">
            Applied: {formatDate(developer.created_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
          className="text-red-600 hover:text-red-700"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          onClick={onVerify}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Verify
        </Button>
      </div>
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 mb-3">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main component with providers
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <AdminDashboardContent />
        <SessionTimeoutWarning />
      </AdminLayout>
    </ProtectedRoute>
  );
} 