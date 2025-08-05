# System Health Monitoring Features

## Overview

The admin dashboard now includes comprehensive real-time system health monitoring capabilities that provide administrators with detailed insights into system performance, database connectivity, and resource usage.

## Features Implemented

### 1. Real-time Database Status
- **Connection Status**: Real-time monitoring of database connectivity (connected/disconnected/error)
- **Response Time**: Live tracking of database query response times
- **Visual Indicators**: Color-coded status indicators (green/yellow/red) based on performance
- **Last Check Timestamp**: Shows when the last health check was performed

### 2. Memory Usage Monitoring
- **Usage Percentage**: Real-time memory usage with visual progress bars
- **Alert Thresholds**: 
  - Warning: >75% usage (yellow indicator)
  - Critical: >90% usage (red indicator + alert)
- **Detailed Metrics**: Shows total, used, and available memory in MB
- **Visual Progress Bar**: Color-coded progress indicator

### 3. Response Time Metrics
- **Average Response Time**: Real-time API response time monitoring
- **Performance Thresholds**:
  - Good: <1000ms (green)
  - Warning: 1000-5000ms (yellow)
  - Critical: >5000ms (red + alert)
- **Requests per Minute**: Live traffic monitoring
- **Error Rate Tracking**: Percentage of failed requests

### 4. System Uptime Tracking
- **Uptime Display**: Shows system uptime in days, hours, and minutes
- **Last Restart Information**: Tracks when the system was last restarted
- **Continuous Monitoring**: Real-time uptime calculation

### 5. Service Status Monitoring
- **Individual Service Health**: Monitors each service component separately
- **Service Response Times**: Individual response time tracking per service
- **Status Indicators**: Visual status for each service (healthy/warning/unhealthy)

## Components

### 1. EnhancedSystemHealth Component
**Location**: `components/admin/enhanced-system-health.tsx`

**Features**:
- Comprehensive system health dashboard
- Real-time data refresh (configurable interval)
- Visual alerts and notifications
- Performance metrics display
- Service status grid

**Usage**:
```tsx
<EnhancedSystemHealth refreshInterval={15000} />
```

### 2. QuickHealthStatus Component
**Location**: `components/admin/quick-health-status.tsx`

**Features**:
- Condensed health overview for dashboard
- Key metrics at a glance
- Quick status indicators
- Minimal resource usage

**Usage**:
```tsx
<QuickHealthStatus healthData={systemHealth} />
```

### 3. System Health Hooks
**Location**: `hooks/use-system-health.ts`

**Available Hooks**:
- `useSystemHealth()`: Main health monitoring hook
- `useHealthAlerts()`: Alert management hook
- `useRealTimeSystemHealth()`: Future WebSocket implementation

**Usage**:
```tsx
const { healthData, loading, error, refresh } = useSystemHealth({
  refreshInterval: 30000,
  autoRefresh: true
});
```

## API Integration

### SystemHealth Interface
```typescript
interface SystemHealth {
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
  services?: Array<{
    name: string;
    status: 'healthy' | 'unhealthy' | 'warning';
    response_time?: number;
    last_check?: string;
  }>;
  error?: string;
  lastChecked?: string;
}
```

### Health Endpoints
The system tries multiple health endpoints in order:
1. `/api/v1/admin/health`
2. `/api/v1/health`
3. `/api/v1/system/health`
4. `/health`

## Alert System

### Automatic Alerts
The system automatically generates alerts for:

1. **Memory Usage**:
   - Warning: >75% usage
   - Critical: >90% usage

2. **Response Time**:
   - Warning: >1000ms
   - Critical: >5000ms

3. **Error Rate**:
   - Warning: >5%
   - Critical: >10%

4. **Database Status**:
   - Critical: Disconnected or error state

5. **System Status**:
   - Critical: Overall unhealthy status

### Alert Management
- **Dismissible Alerts**: Users can dismiss individual alerts
- **Alert Categories**: Warning and Critical levels
- **Real-time Updates**: Alerts update automatically with health data
- **Visual Indicators**: Color-coded alert severity

## Dashboard Integration

### Overview Tab
- Quick health status widget
- Condensed view of key metrics
- Real-time status indicators

### System Health Tab
- Comprehensive health dashboard
- Detailed metrics and charts
- Service status grid
- Performance analytics
- Alert management

## Configuration Options

### Refresh Intervals
- **Overview**: 30 seconds (default)
- **Health Dashboard**: 15 seconds (more frequent updates)
- **Configurable**: Can be adjusted per component

### Alert Thresholds
- **Memory**: 75% (warning), 90% (critical)
- **Response Time**: 1000ms (warning), 5000ms (critical)
- **Error Rate**: 5% (warning), 10% (critical)

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Real-time updates without polling
2. **Historical Data**: Performance trends and charts
3. **Custom Alerts**: User-configurable alert thresholds
4. **Email Notifications**: Alert notifications via email
5. **Mobile Notifications**: Push notifications for critical alerts
6. **Health Reports**: Automated health reports and analytics

### WebSocket Implementation
```typescript
// Future implementation
const { healthData, isRealTime } = useRealTimeSystemHealth({
  websocketUrl: 'ws://localhost:8000/health/ws'
});
```

## Usage Examples

### Basic Health Monitoring
```tsx
import { useSystemHealth } from '@/hooks/use-system-health';

function HealthMonitor() {
  const { healthData, loading, error } = useSystemHealth();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Status: {healthData?.status}</p>
      <p>Memory: {healthData?.memory.usage_percentage}%</p>
      <p>Response Time: {healthData?.performance.average_response_time}ms</p>
    </div>
  );
}
```

### Alert Management
```tsx
import { useHealthAlerts } from '@/hooks/use-system-health';

function AlertManager({ healthData }) {
  const { alerts, dismissAlert, hasCriticalAlerts } = useHealthAlerts(healthData);
  
  return (
    <div>
      {hasCriticalAlerts && <div className="critical-alert">Critical issues detected!</div>}
      {alerts.map(alert => (
        <div key={alert.id}>
          {alert.message}
          <button onClick={() => dismissAlert(alert.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Health Data Not Loading**:
   - Check API endpoints are accessible
   - Verify authentication is working
   - Check network connectivity

2. **High Memory Usage Alerts**:
   - Monitor application memory leaks
   - Check for memory-intensive operations
   - Consider scaling resources

3. **Slow Response Times**:
   - Check database performance
   - Monitor API endpoint performance
   - Review server resources

4. **Database Connection Issues**:
   - Verify database server is running
   - Check connection pool settings
   - Review database configuration

### Debug Information
- All health checks are logged to console
- Failed health endpoints are logged with warnings
- Alert generation is logged for debugging
- Performance metrics are tracked over time

## Security Considerations

1. **Authentication**: All health endpoints require admin authentication
2. **Data Privacy**: Health data is only accessible to authorized administrators
3. **Rate Limiting**: Health checks are rate-limited to prevent abuse
4. **Error Handling**: Sensitive information is not exposed in error messages

## Performance Impact

- **Minimal Overhead**: Health checks are lightweight and efficient
- **Configurable Frequency**: Refresh intervals can be adjusted based on needs
- **Caching**: Health data is cached to reduce API calls
- **Background Updates**: Health checks run in background without blocking UI

## Monitoring Best Practices

1. **Set Appropriate Thresholds**: Configure alert thresholds based on your system's normal performance
2. **Regular Review**: Periodically review health metrics and adjust configurations
3. **Documentation**: Keep track of normal performance ranges for your system
4. **Escalation Procedures**: Establish procedures for handling critical alerts
5. **Historical Analysis**: Use historical data to identify trends and patterns 