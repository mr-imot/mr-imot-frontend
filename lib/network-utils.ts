// Network utility functions for error handling and retry logic

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2, // Reduced from 3 for faster failures
  baseDelay: 500, // Reduced from 1000ms for faster retries
  maxDelay: 5000, // Reduced from 10 seconds
  backoffFactor: 1.5 // Reduced from 2 for less aggressive backoff
};

// Optimized retry options for authentication calls
export const AUTH_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 1, // Only 1 retry for auth calls
  baseDelay: 300, // Very fast retry for better UX
  maxDelay: 1000, // Max 1 second delay
  backoffFactor: 1.2
};

export const shouldRetryRequest = (error: any): boolean => {
  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return true;
  }
  
  // Retry on specific HTTP status codes
  if (error.statusCode) {
    const statusCode = error.statusCode;
    return statusCode >= 500 || statusCode === 408 || statusCode === 429;
  }
  
  return false;
};

export const calculateRetryDelay = (
  attemptNumber: number, 
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): number => {
  const delay = Math.min(
    options.baseDelay * Math.pow(options.backoffFactor, attemptNumber),
    options.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return Math.floor(delay + jitter);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or if we shouldn't retry this error
      if (attempt === options.maxRetries || !shouldRetryRequest(error)) {
        throw error;
      }
      
      // Wait before retrying
      const delay = calculateRetryDelay(attempt, options);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

export const isNetworkError = (error: any): boolean => {
  return (
    error.name === 'TypeError' ||
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('connection') ||
    !window.navigator.onLine
  );
};

export const isTimeoutError = (error: any): boolean => {
  return error.message?.toLowerCase().includes('timeout');
};

export const getConnectionErrorMessage = (): string => {
  if (!window.navigator.onLine) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }
  
  return 'Connection failed. Please check your internet connection and try again.';
};