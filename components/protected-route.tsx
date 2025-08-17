"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { VerificationRequired } from './verification-required';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: 'developer' | 'admin' | 'buyer';
  allowedRoles?: ('developer' | 'admin' | 'buyer')[];
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  requiredRole,
  allowedRoles 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, isVerificationRequired } = useAuth();
  const router = useRouter();
  


  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isVerificationRequired) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, isVerificationRequired]);

  // Check role authorization
  const isAuthorized = () => {
    if (!user) return false;
    
    if (requiredRole) {
      return user.user_type === requiredRole;
    }
    
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.user_type as any);
    }
    
    // If no role restrictions specified, just check authentication
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Check if user needs verification
    if (isVerificationRequired && user) {
      return <VerificationRequired email={user.email} />;
    }
    
    // Only redirect if not verification required
    if (!isVerificationRequired) {
      return null; // Will redirect in useEffect
    }
    
    // If verification required, show loading while we determine what to show
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking account status...</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (!isAuthorized()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Access Denied</p>
                <p>
                  You don't have permission to access this page. 
                  {requiredRole && ` This page requires ${requiredRole} access.`}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Switch Account
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};