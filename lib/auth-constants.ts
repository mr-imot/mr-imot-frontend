// Authentication constants and error messages
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  PASSWORD_RESET: 15 * 60 * 1000, // 15 minutes in milliseconds
  RESEND_COOLDOWN: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

export const ERROR_MESSAGES = {
  'Verification token has expired': 'This verification link has expired (valid for 1 hour). Please request a new one.',
  'Invalid or expired reset token': 'This reset link has expired (valid for 15 minutes). Please request a new one.',
  'Too many requests': 'Too many requests. Please wait 5 minutes before requesting a new link.',
  'Invalid credentials': 'Invalid email or password. Please check your credentials and try again.',
  'User not found': 'No account found with this email address.',
  'Email already verified': 'Your email is already verified. You can now sign in.',
  'Invalid token': 'This link is invalid or has been used already.',
  'Network error': 'Connection failed. Please check your internet and try again.',
  'Server error': 'Something went wrong on our end. Please try again later.',
  'Email verification required': 'Please verify your email address before signing in.',
  'Account pending approval': 'Your account is pending manual approval by our team.',
  'Account not verified': 'Your account is not yet verified. Please check your email for verification instructions.',
  'Email already registered as developer': 'An account with this email already exists. Try signing in instead.',
  'Email already registered': 'An account with this email already exists. Try signing in instead.',
  'Login failed': 'Login failed. Please check your credentials and try again.',
  'Validation error': 'Please check your input and try again.',
  'Invalid input data': 'Please check your input and try again.',
  'Access denied. This login is for developers only. Please use the admin login if you have an admin account.': 'Access denied. This login is for developers only. Please use the admin login if you have an admin account.',
  'Connection failed': 'Unable to connect to the server. Please check your internet connection.',
  'Request timeout': 'Request timed out. Please try again.',
  'Account disabled': 'This account has been disabled. Please contact support.',
  'Account locked': 'This account has been temporarily locked due to failed login attempts.',
} as const;

export const SUCCESS_MESSAGES = {
  EMAIL_SENT: 'Verification email sent successfully!',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email!',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  EMAIL_VERIFIED: 'Email verified successfully! You can now sign in.',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for a verification link. The link expires in 1 hour.',
} as const;

export const getTimingMessage = (isMobile: boolean) => ({
  emailVerification: isMobile 
    ? "Check your email app - link expires in 1 hour" 
    : "Check your email - verification link expires in 1 hour",
  passwordReset: isMobile
    ? "Reset your password quickly - expires in 15min"
    : "Reset your password - this link expires in 15 minutes for security",
  resendCooldown: isMobile
    ? "Wait 5min before requesting new link"
    : "For security, you can request a new link every 5 minutes"
});

export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};