"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

      // Call the backend API directly
      const response = await fetch('/api/v1/auth/developers/forgot-password', {
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
      <div className="min-h-screen bg-background">
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card/70 backdrop-blur border shadow mb-6">
                <CheckCircle className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-muted-foreground text-lg">
                Reset link sent successfully
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-8">
                <div className="text-center space-y-6">
                  <p className="text-foreground text-lg leading-relaxed">
                    We've sent a password reset link to{' '}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>

                  <div className="bg-muted rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold">!</span>
                      <div className="text-left">
                        <p className="text-foreground font-semibold text-sm">Important</p>
                        <p className="text-muted-foreground text-sm">The reset link expires in 15 minutes for security.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground bg-muted rounded-2xl p-4">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      Check your spam folder if you don't see the email
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      The link will only work once for security
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      You can close this page after clicking the link
                    </p>
                  </div>

                  <RateLimitInfo 
                    type="password-reset" 
                    remainingTime={getRemainingTime()}
                  />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/login')} className="flex-1">Back to Sign In</Button>
                    <Button onClick={handleResendReset} disabled={!canRequest() || isSubmitting} className="flex-1">{isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : 'Resend'}</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <button onClick={() => setEmailSent(false)} className="text-primary hover:underline font-medium text-sm">← Back to forgot password form</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card/70 backdrop-blur border shadow mb-6">
              <Shield className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Forgot password?
            </h1>
            <p className="text-muted-foreground text-lg">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-xl border overflow-hidden">
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={isSubmitting} required />
                </div>

                <RateLimitInfo 
                  type="password-reset" 
                  remainingTime={getRemainingTime()}
                />

                {/* Send Reset Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting || !canRequest()}>
                  {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending reset link...</>) : 'Send Reset Link'}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">
                      Remember your password?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                    Back to Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button onClick={() => router.push('/register?type=developer')} className="text-primary hover:underline font-medium">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}