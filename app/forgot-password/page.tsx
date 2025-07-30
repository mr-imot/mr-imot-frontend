"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { FloatingInput } from '@/components/ui/floating-input';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { AuthError } from '@/components/ui/auth-error';
import { RateLimitInfo } from '@/components/ui/rate-limit-info';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/auth-constants';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<Date | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canRequest = (): boolean => {
    if (!lastRequestTime) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastRequestTime <= fiveMinutesAgo;
  };

  const getRemainingTime = (): number => {
    if (!lastRequestTime) return 0;
    const elapsed = Date.now() - lastRequestTime.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return Math.max(0, Math.ceil((fiveMinutes - elapsed) / 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!canRequest()) {
      setError('Please wait before requesting another reset link');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setLastRequestTime(new Date());
      setEmailSent(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      const predefinedMessage = ERROR_MESSAGES[errorMessage as keyof typeof ERROR_MESSAGES];
      setError(predefinedMessage || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendReset = async () => {
    setEmailSent(false);
    setError(null);
    await handleSubmit(new Event('submit') as any);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent"></div>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl shadow-green-500/25 mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check your email
              </h1>
              <p className="text-gray-600 text-lg">
                Reset link sent successfully
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
              <div className="p-8">
                <div className="text-center space-y-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    We've sent a password reset link to{' '}
                    <span className="font-semibold text-gray-900">{email}</span>
                  </p>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-amber-600 text-sm font-bold">!</span>
                      </div>
                      <div className="text-left">
                        <p className="text-amber-800 font-semibold text-sm">Important</p>
                        <p className="text-amber-700 text-sm">The reset link expires in 15 minutes for security.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Check your spam folder if you don't see the email
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      The link will only work once for security
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      You can close this page after clicking the link
                    </p>
                  </div>

                  <RateLimitInfo 
                    type="password-reset" 
                    remainingTime={getRemainingTime()}
                  />

                  <div className="flex gap-3">
                    <EnhancedButton
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/login')}
                      className="flex-1"
                    >
                      Back to Sign In
                    </EnhancedButton>
                    <EnhancedButton
                      variant="secondary"
                      size="lg"
                      onClick={handleResendReset}
                      disabled={!canRequest() || isSubmitting}
                      loading={isSubmitting}
                      loadingText="Sending..."
                      className="flex-1"
                    >
                      Resend
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setEmailSent(false)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
              >
                ← Back to forgot password form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent"></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/25 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot password?
            </h1>
            <p className="text-gray-600 text-lg">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
            <div className="p-8">
              {error && (
                <div className="mb-6">
                  <AuthError
                    error={error}
                    onRetry={() => setError(null)}
                    retryLabel="Try Again"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />

                <RateLimitInfo 
                  type="password-reset" 
                  remainingTime={getRemainingTime()}
                />

                {/* Send Reset Button */}
                <EnhancedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  loadingText="Sending reset link..."
                  disabled={isSubmitting || !canRequest()}
                  icon={!isSubmitting ? <Mail size={20} /> : undefined}
                >
                  Send Reset Link
                </EnhancedButton>
              </form>

              {/* Back to Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Remember your password?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <EnhancedButton
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => router.push('/login')}
                    icon={<ArrowLeft size={20} />}
                  >
                    Back to Sign In
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register?type=developer')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}