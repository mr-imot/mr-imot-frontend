import { useState, useEffect, useCallback } from 'react'
import { config, logError } from '@/lib/config'

interface HealthCheckResult {
  isHealthy: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
  services: {
    api: boolean
    database: boolean
    cache: boolean
  }
}

interface UseHealthCheckOptions {
  /** Enable automatic health checking */
  enabled?: boolean
  /** Check interval in milliseconds */
  interval?: number
  /** Enable retries on failure */
  enableRetries?: boolean
}

export const useHealthCheck = (options: UseHealthCheckOptions = {}) => {
  const {
    enabled = config.features.healthChecking,
    interval = config.cache.healthCheckCache,
    enableRetries = true
  } = options

  const [healthStatus, setHealthStatus] = useState<HealthCheckResult>({
    isHealthy: true, // Assume healthy until proven otherwise
    isChecking: false,
    lastChecked: null,
    error: null,
    services: {
      api: true,
      database: true,
      cache: true
    }
  })

  const checkHealth = useCallback(async () => {
    if (!enabled) return

    setHealthStatus(prev => ({ ...prev, isChecking: true }))

    try {
      const response = await fetch(`${config.api.baseUrl}${config.api.healthCheckEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.api.timeout)
      })

      if (response.ok) {
        const healthData = await response.json()
        
        setHealthStatus({
          isHealthy: true,
          isChecking: false,
          lastChecked: new Date(),
          error: null,
          services: {
            api: healthData.api !== false,
            database: healthData.database !== false,
            cache: healthData.cache !== false
          }
        })
      } else {
        throw new Error(`Health check failed with status: ${response.status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed'
      
      setHealthStatus({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage,
        services: {
          api: false,
          database: false,
          cache: false
        }
      })

      // Log error for monitoring (only unexpected errors, not network failures)
      if (config.features.debugLogging) {
        console.info('🔌 Health check failed (expected when backend is off):', {
          message: errorMessage,
          endpoint: `${config.api.baseUrl}${config.api.healthCheckEndpoint}`
        });
      } else {
        // Only log non-network errors for monitoring
        const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch');
        if (!isNetworkError) {
          logError(error instanceof Error ? error : new Error(errorMessage), {
            context: 'health_check',
            endpoint: `${config.api.baseUrl}${config.api.healthCheckEndpoint}`
          });
        }
      }
    }
  }, [enabled])

  // Automatic health checking
  useEffect(() => {
    if (!enabled) return

    // Initial check
    checkHealth()

    // Set up interval checking
    const intervalId = setInterval(checkHealth, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, interval, checkHealth])

  // Manual health check function
  const manualCheck = useCallback(() => {
    checkHealth()
  }, [checkHealth])

  // Get overall system status
  const getSystemStatus = useCallback((): 'healthy' | 'degraded' | 'down' => {
    if (!enabled) return 'healthy' // Assume healthy if not monitoring

    const { isHealthy, services } = healthStatus
    
    if (!isHealthy) {
      // Check if any services are still working (partial outage)
      const workingServices = Object.values(services).filter(Boolean).length
      return workingServices > 0 ? 'degraded' : 'down'
    }
    
    return 'healthy'
  }, [enabled, healthStatus])

  // Check if a specific service is available
  const isServiceAvailable = useCallback((service: keyof HealthCheckResult['services']): boolean => {
    if (!enabled) return true // Assume available if not monitoring
    return healthStatus.services[service]
  }, [enabled, healthStatus.services])

  return {
    ...healthStatus,
    checkHealth: manualCheck,
    getSystemStatus,
    isServiceAvailable,
    isMonitoring: enabled
  }
}

export default useHealthCheck