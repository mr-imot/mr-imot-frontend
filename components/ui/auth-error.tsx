"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface AuthErrorProps {
  error: string;
  onRetry?: () => void;
  showResend?: boolean;
  retryLabel?: string;
  loading?: boolean;
  className?: string;
}

export const AuthError: React.FC<AuthErrorProps> = ({
  error,
  onRetry,
  showResend = false,
  retryLabel,
  loading = false,
  className
}) => {
  const getRetryLabel = () => {
    if (retryLabel) return retryLabel;
    return showResend ? 'Request New Link' : 'Try Again';
  };

  return (
    <div
      className={cn(
        'p-4 bg-red-50 border border-red-200 rounded-lg',
        'flex flex-col gap-3',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800 leading-relaxed">{error}</p>
      </div>
      
      {(onRetry || showResend) && (
        <div className="flex justify-end">
          <Button
            onClick={onRetry}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {getRetryLabel()}
          </Button>
        </div>
      )}
    </div>
  );
};