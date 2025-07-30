"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthError } from '@/components/ui/auth-error';
import { RateLimitInfo } from '@/components/ui/rate-limit-info';
import { EmailVerificationSent } from '@/components/auth/email-verification-sent';
import { DSButton } from '@/components/ds/ds-button';
import { DSTypography } from '@/components/ds/ds-typography';
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
      <div className="min-h-screen bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setEmailSent(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to form
            </Button>
          </div>
          
          <Card className="bg-white/95 backdrop-blur-sm shadow-ds-lg border border-ds-neutral-200 rounded-ds">
            <CardContent className="p-ds-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                
                <DSTypography variant="h3" weight="semibold" color="neutral-900">
                  Reset Link Sent
                </DSTypography>
                
                <DSTypography variant="body" color="neutral-600" className="leading-relaxed">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-ds-neutral-900">{email}</span>
                </DSTypography>

                <div className="bg-amber-50 border border-amber-200 rounded-ds p-3">
                  <DSTypography variant="small" weight="medium" color="amber-800">
                    ⚠️ Important: The reset link expires in 15 minutes for security.
                  </DSTypography>
                </div>

                <div className="space-y-2 text-sm text-ds-neutral-600">
                  <p>• Check your spam folder if you don't see the email</p>
                  <p>• The link will only work once for security</p>
                  <p>• You can close this page after clicking the link</p>
                </div>

                <RateLimitInfo 
                  type="password-reset" 
                  remainingTime={getRemainingTime()}
                />

                <div className="flex gap-3">
                  <DSButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/login')}
                    className="flex-1"
                  >
                    Back to Sign In
                  </DSButton>
                  <DSButton
                    variant="secondary"
                    size="sm"
                    onClick={handleResendReset}
                    disabled={!canRequest() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Sending...' : 'Resend'}
                  </DSButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-ds-lg border border-ds-neutral-200 rounded-ds overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-ds-primary-50 to-ds-accent-50 py-ds-6 px-ds-4 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>
              <DSTypography variant="h2" weight="bold" color="neutral-900">
                Reset Password
              </DSTypography>
            </CardTitle>
            <DSTypography variant="body" color="neutral-600" className="mt-2">
              Enter your email to receive a password reset link
            </DSTypography>
          </CardHeader>

          <CardContent className="p-ds-6 bg-ds-neutral-50/30">
            <form onSubmit={handleSubmit} className="space-y-ds-4">
              {error && (
                <AuthError
                  error={error}
                  onRetry={() => setError(null)}
                  retryLabel="Try Again"
                />
              )}

              <div className="space-y-ds-2">
                <DSTypography variant="label" weight="medium" color="neutral-700">
                  Email Address
                </DSTypography>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                  className={cn(
                    "h-12 px-ds-3 border-2 rounded-ds bg-white shadow-ds-sm",
                    "border-ds-neutral-300 focus:border-ds-primary-500 focus:ring-2 focus:ring-ds-primary-200",
                    "transition-all duration-200"
                  )}
                  required
                />
              </div>

              <RateLimitInfo 
                type="password-reset" 
                remainingTime={getRemainingTime()}
              />

              <DSButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !canRequest()}
                className="w-full shadow-ds-md hover:shadow-ds-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </DSButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}