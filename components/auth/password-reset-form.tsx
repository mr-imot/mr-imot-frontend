"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthError } from '@/components/ui/auth-error';
import { useCountdown } from '@/hooks/use-countdown';
import { getTimingMessage } from '@/lib/auth-constants';
import { useIsMobile } from '@/hooks/use-mobile';

export interface PasswordResetFormProps {
  onSubmit: (token: string, newPassword: string) => Promise<void>;
  className?: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSubmit,
  className
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 15 minute countdown
  const countdown = useCountdown({
    initialTime: 15 * 60, // 15 minutes in seconds
    onComplete: () => {
      setError('This reset link has expired. Please request a new one.');
    }
  });

  const timingMessage = getTimingMessage(isMobile);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(token, formData.password);
      
      // Success - redirect to login with success message
      setTimeout(() => {
        // Clear token from URL before redirecting
        window.history.replaceState({}, '', '/login?message=password-reset-success');
        router.push('/login?message=password-reset-success');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Reset Your Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Countdown Timer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Link expires in {countdown.formatTime}
                </p>
                <p className="text-xs text-amber-700">
                  {timingMessage.passwordReset}
                </p>
              </div>
            </div>
          </div>

          {countdown.isCompleted && (
            <AuthError
              error="This reset link has expired (valid for 15 minutes). Please request a new one."
              onRetry={() => router.push('/forgot-password')}
              retryLabel="Request New Link"
            />
          )}

          {error && !countdown.isCompleted && (
            <AuthError
              error={error}
              onRetry={() => setError(null)}
              retryLabel="Try Again"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter new password"
                  disabled={countdown.isCompleted || isSubmitting}
                  className={cn(
                    validationErrors.password && 'border-red-300 focus:border-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={countdown.isCompleted}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  disabled={countdown.isCompleted || isSubmitting}
                  className={cn(
                    validationErrors.confirmPassword && 'border-red-300 focus:border-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={countdown.isCompleted}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={countdown.isCompleted || isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Back to Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};