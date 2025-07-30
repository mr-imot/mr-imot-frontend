"use client"

// Secure Admin Login Page
// Provides secure authentication for admin users with validation and error handling

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminApiError } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const { login, isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Rate limiting - block after 5 failed attempts for 5 minutes
  const isBlocked = attempts >= 5;
  const resetTime = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (isBlocked) {
      const timer = setTimeout(() => {
        setAttempts(0);
        setError('');
      }, resetTime);
      return () => clearTimeout(timer);
    }
  }, [isBlocked, resetTime]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Too many failed attempts. Please wait 5 minutes before trying again.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      // Successful login - redirect will happen via useEffect
      router.push('/admin/dashboard');
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      if (err instanceof AdminApiError) {
        switch (err.errorCode) {
          case 'AUTH_INVALID_TOKEN':
          case 'AUTH_REQUIRED':
            setError('Invalid email or password');
            break;
          case 'ACCESS_DENIED':
            setError('Access denied. Admin account required.');
            break;
          case 'NETWORK_ERROR':
            setError('Network error. Please check your connection and try again.');
            break;
          default:
            setError(err.message || 'Login failed. Please try again.');
        }
      } else if (err instanceof Error) {
        if (err.message.includes('Admin account required')) {
          setError('This login is for administrators only.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Login
          </CardTitle>
          <p className="text-gray-600">
            Secure access to the administration panel
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isBlocked && (
              <Alert variant="destructive">
                <AlertDescription>
                  Account temporarily locked due to too many failed attempts. 
                  Please wait 5 minutes before trying again.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={isLoading || isBlocked}
                className={cn(
                  error && error.toLowerCase().includes('email') && 'border-red-500'
                )}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading || isBlocked}
                  className={cn(
                    error && error.toLowerCase().includes('password') && 'border-red-500'
                  )}
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isBlocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {attempts > 0 && attempts < 5 && (
              <p className="text-sm text-gray-500 text-center">
                {5 - attempts} attempts remaining
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                🔒 This is a secure admin area
              </p>
              <p className="text-xs text-gray-400">
                Only authorized administrators can access this system
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 