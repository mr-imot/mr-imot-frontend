// Authentication error types and handling

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ROLE_ACCESS_DENIED = 'ROLE_ACCESS_DENIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
  statusCode?: number;
  field?: string;
}

export class AuthenticationError extends Error {
  public readonly type: AuthErrorType;
  public readonly statusCode?: number;
  public readonly field?: string;
  public readonly details?: any;

  constructor(type: AuthErrorType, message: string, statusCode?: number, field?: string, details?: any) {
    super(message);
    this.name = 'AuthenticationError';
    this.type = type;
    this.statusCode = statusCode;
    this.field = field;
    this.details = details;
  }
}

export const createAuthError = (
  message: string, 
  statusCode?: number, 
  details?: any,
  translations?: any
): AuthenticationError => {
  // Determine error type based on message and status code
  const msg = message.toLowerCase();
  
  if (statusCode === 401 || msg.includes('invalid credentials') || msg.includes('invalid email or password')) {
    return new AuthenticationError(AuthErrorType.INVALID_CREDENTIALS, translations?.errors?.invalidCredentials || 'Invalid email or password. Please check your credentials and try again.', statusCode, undefined, details);
  }
  
  if (msg.includes('email not verified') || msg.includes('verification required')) {
    return new AuthenticationError(AuthErrorType.EMAIL_NOT_VERIFIED, translations?.errors?.emailNotVerified || 'Please verify your email address before signing in.', statusCode, undefined, details);
  }
  
  if (msg.includes('account disabled') || msg.includes('disabled')) {
    return new AuthenticationError(AuthErrorType.ACCOUNT_DISABLED, translations?.errors?.accountDisabled || 'This account has been disabled. Please contact support.', statusCode, undefined, details);
  }
  
  if (msg.includes('account locked') || msg.includes('locked')) {
    return new AuthenticationError(AuthErrorType.ACCOUNT_LOCKED, translations?.errors?.accountLocked || 'This account has been temporarily locked due to failed login attempts.', statusCode, undefined, details);
  }
  
  if (msg.includes('access denied') || msg.includes('admin account required') || msg.includes('developer') || msg.includes('role')) {
    return new AuthenticationError(AuthErrorType.ROLE_ACCESS_DENIED, message, statusCode, undefined, details);
  }
  
  if (msg.includes('token expired') || msg.includes('expired')) {
    return new AuthenticationError(AuthErrorType.TOKEN_EXPIRED, translations?.errors?.tokenExpired || 'Your session has expired. Please sign in again.', statusCode, undefined, details);
  }
  
  if (statusCode === 429 || msg.includes('too many requests') || msg.includes('rate limit')) {
    return new AuthenticationError(AuthErrorType.RATE_LIMITED, translations?.errors?.rateLimited || 'Too many requests. Please wait before trying again.', statusCode, undefined, details);
  }
  
  if (msg.includes('email already') || msg.includes('already exists')) {
    return new AuthenticationError(AuthErrorType.EMAIL_ALREADY_EXISTS, translations?.errors?.emailAlreadyExists || 'An account with this email already exists. Try signing in instead.', statusCode, 'email', details);
  }
  
  if (statusCode === 422 || msg.includes('validation') || msg.includes('invalid input')) {
    return new AuthenticationError(AuthErrorType.VALIDATION_ERROR, translations?.errors?.validationError || 'Please check your input and try again.', statusCode, undefined, details);
  }
  
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return new AuthenticationError(AuthErrorType.NETWORK_ERROR, translations?.errors?.networkError || 'Connection failed. Please check your internet and try again.', statusCode, undefined, details);
  }
  
  if (statusCode && statusCode >= 500 || msg.includes('server error') || msg.includes('server')) {
    return new AuthenticationError(AuthErrorType.SERVER_ERROR, translations?.errors?.serverError || 'Something went wrong on our end. Please try again later.', statusCode, undefined, details);
  }
  
  // Default to unknown error
  return new AuthenticationError(AuthErrorType.UNKNOWN_ERROR, translations?.errors?.unknownError || (message.length < 100 ? message : 'An unexpected error occurred. Please try again.'), statusCode, undefined, details);
};

export const getErrorDisplayMessage = (error: AuthenticationError, translations?: any): string => {
  switch (error.type) {
    case AuthErrorType.INVALID_CREDENTIALS:
      return translations?.errors?.invalidCredentials || 'Invalid email or password. Please check your credentials and try again.';
    case AuthErrorType.EMAIL_NOT_VERIFIED:
      return translations?.errors?.emailNotVerified || 'Please verify your email address before signing in.';
    case AuthErrorType.ACCOUNT_DISABLED:
      return translations?.errors?.accountDisabled || 'This account has been disabled. Please contact support.';
    case AuthErrorType.ACCOUNT_LOCKED:
      return translations?.errors?.accountLocked || 'This account has been temporarily locked. Please wait before trying again.';
    case AuthErrorType.ROLE_ACCESS_DENIED:
      return error.message; // Use the specific role access message
    case AuthErrorType.TOKEN_EXPIRED:
      return translations?.errors?.tokenExpired || 'Your session has expired. Please sign in again.';
    case AuthErrorType.NETWORK_ERROR:
      return translations?.errors?.networkError || 'Connection failed. Please check your internet and try again.';
    case AuthErrorType.SERVER_ERROR:
      return translations?.errors?.serverError || 'Something went wrong on our end. Please try again later.';
    case AuthErrorType.VALIDATION_ERROR:
      return translations?.errors?.validationError || 'Please check your input and try again.';
    case AuthErrorType.RATE_LIMITED:
      return translations?.errors?.rateLimited || 'Too many requests. Please wait before trying again.';
    case AuthErrorType.EMAIL_ALREADY_EXISTS:
      return translations?.errors?.emailAlreadyExists || 'An account with this email already exists. Try signing in instead.';
    default:
      return error.message;
  }
};

export const shouldRetryError = (error: AuthenticationError): boolean => {
  return [
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.SERVER_ERROR
  ].includes(error.type);
};

export const getRetryDelay = (error: AuthenticationError, attemptNumber: number): number => {
  if (error.type === AuthErrorType.RATE_LIMITED) {
    return 60000; // 1 minute for rate limited
  }
  
  if (error.type === AuthErrorType.NETWORK_ERROR) {
    return Math.min(1000 * Math.pow(2, attemptNumber), 10000); // Exponential backoff up to 10s
  }
  
  if (error.type === AuthErrorType.SERVER_ERROR) {
    return 3000; // 3 seconds for server errors
  }
  
  return 1000; // Default 1 second
};