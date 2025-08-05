"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  MemoryStick, 
  Clock, 
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  HardDrive,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSystemHealth, useHealthAlerts } from '@/hooks/use-system-health';
import { type SystemHealth } from '@/lib/admin-api';

interface SystemHealthData {
  status: string;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    response_time: number;
    last_check: string;
  };
  memory: {
    usage_percentage: number;
    total_mb: number;
    used_mb: number;
    available_mb: number;
  };
  performance: {
    average_response_time: number;
    requests_per_minute: number;
    error_rate: number;
  };
  uptime: {
    system_uptime_seconds: number;
    last_restart: string;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'unhealthy' | 'warning';
    response_time?: number;
    last_check?: string;
  }>;
  lastChecked: string;
  error?: string;
}

interface EnhancedSystemHealthProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

export function EnhancedSystemHealth({ 
  className, 
  refreshInterval = 30000 // 30 seconds default
}: EnhancedSystemHealthProps) {
  // Use the real system health hook
  const { 
    healthData: apiHealthData, 
    loading, 
    error, 
    lastRefresh, 
    refresh, 
    isRefreshing 
  } = useSystemHealth({ 
    refreshInterval, 
    autoRefresh: true 
  });

  // Use health alerts hook
  const { 
    alerts, 
    criticalAlerts, 
    warningAlerts, 
    dismissAlert, 
    hasAlerts, 
    hasCriticalAlerts 
  } = useHealthAlerts(apiHealthData);

  // Convert API data to component format if needed
  const healthData = apiHealthData ? {
    status: apiHealthData.status,
    database: apiHealthData.database,
    memory: apiHealthData.memory,
    performance: apiHealthData.performance,
    uptime: apiHealthData.uptime,
    services: apiHealthData.services || [],
    lastChecked: apiHealthData.lastChecked || new Date().toISOString(),
    error: apiHealthData.error
  } : null;

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMemoryColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getResponseTimeColor = (time: number): string => {
    if (time > 5000) return 'text-red-600';
    if (time > 1000) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading && !healthData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !healthData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refresh} className="mt-4" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">System Health</h3>
          {getStatusIcon(healthData.status)}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={refresh} 
            size="sm" 
            variant="outline"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Health Status */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Database Status */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Database</span>
                {getStatusIcon(healthData.database.status)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Response Time</span>
                  <span className={getResponseTimeColor(healthData.database.response_time)}>
                    {healthData.database.response_time.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Status</span>
                  <span className="capitalize">{healthData.database.status}</span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{healthData.memory.usage_percentage.toFixed(1)}%</span>
                  <span className={getMemoryColor(healthData.memory.usage_percentage)}>
                    {healthData.memory.used_mb}MB / {healthData.memory.total_mb}MB
                  </span>
                </div>
                <Progress 
                  value={healthData.memory.usage_percentage} 
                  className="h-2"
                />
                {healthData.memory.usage_percentage > 90 && (
                  <div className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>High memory usage</span>
                  </div>
                )}
              </div>
            </div>

            {/* Response Time */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Response</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>API Response</span>
                  <span className={getResponseTimeColor(healthData.performance.average_response_time)}>
                    {healthData.performance.average_response_time.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Requests/min</span>
                  <span>{healthData.performance.requests_per_minute}</span>
                </div>
                {healthData.performance.average_response_time > 5000 && (
                  <div className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Slow response time</span>
                  </div>
                )}
              </div>
            </div>

            {/* System Uptime */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4" />
                <span className="text-sm font-medium">System Uptime</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Uptime</span>
                  <span className="text-green-600">
                    {formatUptime(healthData.uptime.system_uptime_seconds)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last Restart</span>
                  <span>{new Date(healthData.uptime.last_restart).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthData.services.map((service, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    {service.response_time && (
                      <p className="text-xs text-gray-500">
                        {service.response_time.toFixed(0)}ms
                      </p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={service.status === 'healthy' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {healthData.performance.requests_per_minute}
              </div>
              <div className="text-sm text-gray-600">Requests/min</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={cn(
                "text-2xl font-bold",
                getResponseTimeColor(healthData.performance.average_response_time)
              )}>
                {healthData.performance.average_response_time.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={cn(
                "text-2xl font-bold",
                healthData.performance.error_rate > 5 ? "text-red-600" : "text-green-600"
              )}>
                {healthData.performance.error_rate.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Alerts */}
      {hasAlerts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>System Alerts</span>
              {hasCriticalAlerts && (
                <Badge variant="destructive" className="text-xs">
                  {criticalAlerts.length} Critical
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  variant={alert.type === 'critical' ? 'destructive' : 'default'}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {alert.type === 'critical' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {alert.message}
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 