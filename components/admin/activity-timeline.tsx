"use client"

import { formatDate } from "@/lib/date-formatter"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Shield, 
  Clock, 
  RefreshCw,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { getAdminActivity, AdminActivity } from '@/lib/admin-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ActivityTimeline() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const activityData = await getAdminActivity();
      setActivities(activityData);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activity data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    const actionLower = activity.action.toLowerCase();
    return actionLower.includes(filter.toLowerCase());
  });

  const getActivityIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('verify') || actionLower.includes('approve')) {
      return <UserCheck className="h-4 w-4 text-green-600" />;
    }
    if (actionLower.includes('reject') || actionLower.includes('delete')) {
      return <UserX className="h-4 w-4 text-red-600" />;
    }
    if (actionLower.includes('register') || actionLower.includes('create')) {
      return <Users className="h-4 w-4 text-blue-600" />;
    }
    if (actionLower.includes('notification') || actionLower.includes('email')) {
      return <Mail className="h-4 w-4 text-purple-600" />;
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <Shield className="h-4 w-4 text-orange-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActivityColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('verify') || actionLower.includes('approve')) {
      return 'border-green-200 bg-green-50';
    }
    if (actionLower.includes('reject') || actionLower.includes('delete')) {
      return 'border-red-200 bg-red-50';
    }
    if (actionLower.includes('register') || actionLower.includes('create')) {
      return 'border-blue-200 bg-blue-50';
    }
    if (actionLower.includes('notification') || actionLower.includes('email')) {
      return 'border-purple-200 bg-purple-50';
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return 'border-orange-200 bg-orange-50';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(activityTime);
  };

  const getActivitySummary = () => {
    const total = activities.length;
    const today = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    }).length;
    
    const verifications = activities.filter(activity => 
      activity.action.toLowerCase().includes('verify')
    ).length;
    
    const rejections = activities.filter(activity => 
      activity.action.toLowerCase().includes('reject')
    ).length;

    return { total, today, verifications, rejections };
  };

  const summary = getActivitySummary();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadActivities} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Timeline</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadActivities}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-blue-600">Total Activities</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.today}</div>
            <div className="text-sm text-green-600">Today</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary.verifications}</div>
            <div className="text-sm text-purple-600">Verifications</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.rejections}</div>
            <div className="text-sm text-red-600">Rejections</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="verify">Verifications</SelectItem>
              <SelectItem value="reject">Rejections</SelectItem>
              <SelectItem value="register">Registrations</SelectItem>
              <SelectItem value="notification">Notifications</SelectItem>
              <SelectItem value="login">Logins</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found</p>
              <p className="text-sm mt-1">Activities will appear here as admin actions are performed</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start space-x-4 mb-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  {/* Activity content */}
                  <div className={`flex-1 p-4 rounded-lg border ${getActivityColor(activity.action)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{activity.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.target}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          Admin: {activity.admin_email}
                        </p>
                        
                        {activity.details && (
                          <p className="text-sm text-gray-700 mt-2">
                            {activity.details}
                          </p>
                        )}
                        
                        {activity.ip_address && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {activity.ip_address}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 