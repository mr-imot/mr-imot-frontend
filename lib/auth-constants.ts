// Authentication constants and error messages
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  PASSWORD_RESET: 15 * 60 * 1000, // 15 minutes in milliseconds
  RESEND_COOLDOWN: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

export const ERROR_MESSAGES = {
  'Verification token has expired': 'This verification link has expired (valid for 2 hours). Please request a new one.',
  'Invalid or expired reset token': 'This reset link has expired (valid for 15 minutes). Please request a new one.',
  'Too many requests': 'Too many requests. Please wait 5 minutes before requesting a new link.',
  'Invalid credentials': 'Invalid email or password. Please try again.',
  'User not found': 'No account found with this email address.',
  'Email already verified': 'Your email is already verified. You can now sign in.',
  'Invalid token': 'This link is invalid or has been used already.',
  'Network error': 'Connection failed. Please check your internet and try again.',
  'Server error': 'Something went wrong on our end. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  EMAIL_SENT: 'Verification email sent successfully!',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email!',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  EMAIL_VERIFIED: 'Email verified successfully! You can now sign in.',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for a verification link. The link expires in 10 minutes.',
} as const;

export const getTimingMessage = (isMobile: boolean) => ({
  emailVerification: isMobile 
    ? "Check your email app - link expires in 10 minutes" 
    : "Check your email - verification link expires in 10 minutes",
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