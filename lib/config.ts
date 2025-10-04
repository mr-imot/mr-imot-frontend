// Configuration for the application
export const config = {
  baseUrl: "", // Use relative URLs - Next.js proxy handles routing
  // API Configuration
  api: {
    timeout: 5000, // Reduced from 10s to 5s for faster failures
    authTimeout: 3000, // Special timeout for auth calls
    retryAttempts: 2, // Reduced from 3 for faster failures
    healthCheckEndpoint: '/health',
  },

  // Environment settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Feature flags
  features: {
    // Show development indicators
    showDevIndicators: process.env.NODE_ENV === 'development',

    // Enable debug logging
    debugLogging: process.env.NODE_ENV === 'development',

    // Enable maintenance mode (can be controlled via env var)
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',



    // Enable backend health monitoring
    healthChecking: true, // Re-enabled with improved timeout handling

    // Enable global maintenance wrapper (protects entire app)
    globalMaintenanceMode: true, // Re-enabled with better error handling
  },

  // UI Configuration
  ui: {
    // Show loading states
    showLoadingStates: true,

    // Show error states with retry options
    showErrorStates: true,

    // Show empty states
    showEmptyStates: true,

    // Show maintenance page for complete outages
    showMaintenancePage: true,
  },

  // Cache Configuration
  cache: {
    // API response cache duration (in milliseconds)
    apiResponseCache: 5 * 60 * 1000, // 5 minutes

    // Enable API response caching
    enableApiCaching: process.env.NODE_ENV === 'production',

    // Cache health check results
    healthCheckCache: 30 * 1000, // 30 seconds
  },

  // Error handling configuration
  errorHandling: {
    // Maximum retry attempts for failed requests
    maxRetries: 3,

    // Retry delay in milliseconds
    retryDelay: 1000,

    // Enable error reporting in production
    enableErrorReporting: process.env.NODE_ENV === 'production',

    // Error reporting endpoint
    errorReportingEndpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_URL,
  },

  // Maintenance configuration
  maintenance: {
    // Default maintenance message
    defaultMessage: "We're currently performing scheduled maintenance to improve our services.",
    
    // Support contact information
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@mrimot.com',
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+359 899 520 856',
    
    // Expected maintenance duration
    estimatedDuration: process.env.NEXT_PUBLIC_MAINTENANCE_DURATION || '2 hours',
    
    // Maintenance start time
    maintenanceStart: process.env.NEXT_PUBLIC_MAINTENANCE_START,
    
    // Maintenance end time
    maintenanceEnd: process.env.NEXT_PUBLIC_MAINTENANCE_END,
  }
};


// Helper function to check if we should show dev indicators
export const shouldShowDevIndicators = (): boolean => {
  return config.features.showDevIndicators;
};

// Helper function to check if we're in maintenance mode
export const isMaintenanceMode = (): boolean => {
  return config.features.maintenanceMode;
};

// Helper function to check if we should show maintenance page
export const shouldShowMaintenancePage = (hasError: boolean): boolean => {
  // Show maintenance page if:
  // 1. Maintenance mode is explicitly enabled, OR
  // 2. In production and we have a complete backend failure
  return config.features.maintenanceMode || 
         (config.environment.isProduction && hasError);
};

// Helper function to get error handling strategy
export const getErrorHandlingStrategy = (hasError: boolean): 'maintenance' | 'normal' => {
  // If maintenance mode is explicitly enabled
  if (config.features.maintenanceMode) {
    return 'maintenance';
  }

  // For any environment (development or production)
  if (hasError) {
    // Backend failure -> maintenance page
    return 'maintenance';
  }

  // No error, normal operation
  return 'normal';
};

// Helper function to log errors (production-ready)
export const logError = (error: Error | string, context?: any): void => {
  // Don't log if it's just a network error when backend is expected to be down
  const errorMessage = error instanceof Error ? error.message : error;
  const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch');
  
  // In development, show a clean message for expected network errors
  if (config.features.debugLogging && isNetworkError) {
    // console.info('🔌 Backend connection failed (expected when backend is off):', {
    //   message: errorMessage,
    //   context: context?.context || 'unknown'
    // });
    return;
  }

  const errorData = {
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Console log in development (only for non-network errors)
  if (config.features.debugLogging && !isNetworkError) {
    console.error('🚨 Error logged:', errorData);
  }

  // Send to error reporting service in production (skip expected network errors)
  if (config.errorHandling.enableErrorReporting && 
      config.errorHandling.errorReportingEndpoint && 
      !isNetworkError) {
    // This would typically send to a service like Sentry, LogRocket, etc.
    fetch(config.errorHandling.errorReportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silently fail if error reporting fails
    });
  }
}; 
