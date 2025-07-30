"use client"

// Admin Dashboard Main Page
// Provides overview of system statistics and pending developer applications

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { SessionTimeoutWarning } from '@/components/admin/session-timeout-warning';
import { 
  getDeveloperStats, 
  getRecentActivity, 
  getSystemHealth,
  getPendingDevelopers,
  verifyDeveloper,
  rejectDeveloper,
  AdminApiError,
  type PendingDeveloper,
  type DeveloperStats
} from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function AdminDashboardContent() {
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [pendingDevelopers, setPendingDevelopers] = useState<PendingDeveloper[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingDevelopers, setProcessingDevelopers] = useState<Set<string>>(new Set());

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsData, developersData, activityData, healthData] = await Promise.all([
        getDeveloperStats(),
        getPendingDevelopers(),
        getRecentActivity(),
        getSystemHealth(),
      ]);

      setStats(statsData);
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

  const handleDeveloperAction = async (developerId: string, action: 'verify' | 'reject') => {
    try {
      setProcessingDevelopers(prev => new Set(prev).add(developerId));

      if (action === 'verify') {
        await verifyDeveloper(developerId);
      } else {
        await rejectDeveloper(developerId);
      }

      // Remove from pending list
      setPendingDevelopers(prev => prev.filter(dev => dev.id !== developerId));
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_pending: prev.total_pending - 1,
          total_verified: action === 'verify' ? prev.total_verified + 1 : prev.total_verified,
          total_rejected: action === 'reject' ? prev.total_rejected + 1 : prev.total_rejected,
        } : null);
      }

    } catch (err) {
      console.error(`Error ${action}ing developer:`, err);
      // Could show a toast notification here
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Overview of system activity and pending developer applications
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Developers"
          value={stats?.total_pending || 0}
          icon={Clock}
          color="orange"
          change="+2 this week"
        />
        <StatCard
          title="Verified Developers"
          value={stats?.total_verified || 0}
          icon={UserCheck}
          color="green"
          change="+5 this month"
        />
        <StatCard
          title="Rejected Applications"
          value={stats?.total_rejected || 0}
          icon={UserX}
          color="red"
          change="2 this month"
        />
        <StatCard
          title="Recent Applications"
          value={stats?.recent_applications || 0}
          icon={TrendingUp}
          color="blue"
          change="Last 24 hours"
        />
      </div>

      {/* Main Content Grid */}
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

        {/* System Activity & Health */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemHealth?.services?.map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.name}</span>
                    <Badge 
                      variant={service.status === 'healthy' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {service.status}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p>Health data unavailable</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="text-sm">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-gray-500">{activity.target}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change 
}: { 
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'orange' | 'green' | 'red' | 'blue';
  change: string;
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{change}</p>
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
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
    <AdminAuthProvider>
      <ProtectedRoute>
        <AdminLayout>
          <AdminDashboardContent />
          <SessionTimeoutWarning />
        </AdminLayout>
      </ProtectedRoute>
    </AdminAuthProvider>
  );
} 