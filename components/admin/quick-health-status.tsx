"use client"

import { formatTime } from "@/lib/date-formatter"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  MemoryStick, 
  Clock, 
  Activity,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type SystemHealth } from '@/lib/admin-api';

interface QuickHealthStatusProps {
  healthData: SystemHealth | null;
  className?: string;
}

export function QuickHealthStatus({ healthData, className }: QuickHealthStatusProps) {
  if (!healthData || !healthData.database || !healthData.memory || !healthData.performance || !healthData.uptime) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Loading health data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${Math.floor((seconds % 3600) / 60)}m`;
    }
  };

  const hasIssues = 
    (healthData.memory.usage_percentage || 0) > 90 ||
    (healthData.performance.average_response_time || 0) > 5000 ||
    (healthData.performance.error_rate || 0) > 5 ||
    healthData.database.status === 'error' ||
    healthData.database.status === 'disconnected';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon(healthData.status)}
          <span>System Health</span>
        </CardTitle>
        <Badge 
          variant={hasIssues ? 'destructive' : 'default'}
          className="text-xs"
        >
          {hasIssues ? 'Issues Detected' : 'All Systems Operational'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Database Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Database</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthData.database.status)}
              <span className={cn(
                "text-xs",
                getResponseTimeColor(healthData.database.response_time || 0)
              )}>
                {(healthData.database.response_time || 0).toFixed(0)}ms
              </span>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4" />
                <span className="text-sm">Memory</span>
              </div>
              <span className={cn(
                "text-xs font-medium",
                getMemoryColor(healthData.memory.usage_percentage || 0)
              )}>
                {(healthData.memory.usage_percentage || 0).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={healthData.memory.usage_percentage || 0} 
              className="h-2"
            />
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Response Time</span>
            </div>
            <span className={cn(
              "text-xs font-medium",
              getResponseTimeColor(healthData.performance.average_response_time || 0)
            )}>
              {(healthData.performance.average_response_time || 0).toFixed(0)}ms
            </span>
          </div>

          {/* System Uptime */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span className="text-sm">Uptime</span>
            </div>
            <span className="text-xs text-green-600 font-medium">
              {formatUptime(healthData.uptime.system_uptime_seconds || 0)}
            </span>
          </div>

          {/* Last Check */}
          {healthData.lastChecked && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Last updated: {formatTime(healthData.lastChecked)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 