import { useState, useEffect, useCallback } from 'react';
import { getSystemHealth, type SystemHealth } from '@/lib/admin-api';

interface UseSystemHealthOptions {
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  onError?: (error: string) => void;
  onDataUpdate?: (data: SystemHealth) => void;
}

interface UseSystemHealthReturn {
  healthData: SystemHealth | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useSystemHealth({
  refreshInterval = 30000,
  autoRefresh = true,
  onError,
  onDataUpdate
}: UseSystemHealthOptions = {}): UseSystemHealthReturn {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealthData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const data = await getSystemHealth();
      setHealthData(data);
      setLastRefresh(new Date());
      
      // Call the onDataUpdate callback if provided
      if (onDataUpdate) {
        onDataUpdate(data);
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system health data';
      setError(errorMessage);
      
      // Call the onError callback if provided
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Error fetching system health:', err);
      throw err;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [onError, onDataUpdate]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchHealthData();
  }, [fetchHealthData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial fetch
    fetchHealthData();

    // Set up interval for auto-refresh
    const interval = setInterval(fetchHealthData, refreshInterval);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [fetchHealthData, refreshInterval, autoRefresh]);

  // Manual initial fetch if auto-refresh is disabled
  useEffect(() => {
    if (!autoRefresh && !healthData && !loading) {
      fetchHealthData();
    }
  }, [autoRefresh, healthData, loading, fetchHealthData]);

  return {
    healthData,
    loading,
    error,
    lastRefresh,
    refresh,
    isRefreshing
  };
}

// Hook for real-time health monitoring with WebSocket support (future enhancement)
export function useRealTimeSystemHealth(options: UseSystemHealthOptions = {}) {
  const baseHealth = useSystemHealth(options);
  
  // Future enhancement: Add WebSocket connection for real-time updates
  // This would provide instant updates when system health changes
  
  return {
    ...baseHealth,
    // Additional real-time specific features can be added here
    isRealTime: false, // Placeholder for future WebSocket implementation
  };
}

// Hook for health alerts and notifications
export function useHealthAlerts(healthData: SystemHealth | null) {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    dismissed: boolean;
  }>>([]);

  useEffect(() => {
    if (!healthData) return;

    const newAlerts: typeof alerts = [];

    // Check memory usage
    if (healthData.memory.usage_percentage > 90) {
      newAlerts.push({
        id: 'memory-critical',
        type: 'critical',
        message: `Critical memory usage: ${healthData.memory.usage_percentage.toFixed(1)}%`,
        timestamp: new Date(),
        dismissed: false
      });
    } else if (healthData.memory.usage_percentage > 75) {
      newAlerts.push({
        id: 'memory-warning',
        type: 'warning',
        message: `High memory usage: ${healthData.memory.usage_percentage.toFixed(1)}%`,
        timestamp: new Date(),
        dismissed: false
      });
    }

    // Check response time
    if (healthData.performance.average_response_time > 5000) {
      newAlerts.push({
        id: 'response-time-critical',
        type: 'critical',
        message: `Critical response time: ${healthData.performance.average_response_time.toFixed(0)}ms`,
        timestamp: new Date(),
        dismissed: false
      });
    } else if (healthData.performance.average_response_time > 1000) {
      newAlerts.push({
        id: 'response-time-warning',
        type: 'warning',
        message: `Slow response time: ${healthData.performance.average_response_time.toFixed(0)}ms`,
        timestamp: new Date(),
        dismissed: false
      });
    }

    // Check error rate
    if (healthData.performance.error_rate > 10) {
      newAlerts.push({
        id: 'error-rate-critical',
        type: 'critical',
        message: `Critical error rate: ${healthData.performance.error_rate.toFixed(2)}%`,
        timestamp: new Date(),
        dismissed: false
      });
    } else if (healthData.performance.error_rate > 5) {
      newAlerts.push({
        id: 'error-rate-warning',
        type: 'warning',
        message: `High error rate: ${healthData.performance.error_rate.toFixed(2)}%`,
        timestamp: new Date(),
        dismissed: false
      });
    }

    // Check database status
    if (healthData.database.status === 'error' || healthData.database.status === 'disconnected') {
      newAlerts.push({
        id: 'database-error',
        type: 'critical',
        message: `Database ${healthData.database.status}: ${healthData.database.response_time}ms response time`,
        timestamp: new Date(),
        dismissed: false
      });
    }

    // Check overall system status
    if (healthData.status === 'unhealthy') {
      newAlerts.push({
        id: 'system-unhealthy',
        type: 'critical',
        message: 'System is unhealthy - multiple services affected',
        timestamp: new Date(),
        dismissed: false
      });
    }

    // Update alerts, keeping existing dismissed alerts
    setAlerts(prevAlerts => {
      const existingAlerts = prevAlerts.filter(alert => alert.dismissed);
      return [...existingAlerts, ...newAlerts];
    });
  }, [healthData]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.type === 'warning');

  return {
    alerts: activeAlerts,
    criticalAlerts,
    warningAlerts,
    dismissAlert,
    clearAllAlerts,
    hasAlerts: activeAlerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0
  };
} 