"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Info, X, Shield } from 'lucide-react';

export interface SecurityToastProps {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

const toastIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: X,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export const SecurityToast: React.FC<SecurityToastProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  className
}) => {
  const Icon = toastIcons[type];

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg shadow-lg max-w-md',
        'animate-in slide-in-from-top-2 duration-300',
        toastStyles[type],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Shield className="h-5 w-5 flex-shrink-0" />
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Toast manager hook
export const useSecurityToast = () => {
  const [toasts, setToasts] = React.useState<Array<SecurityToastProps & { id: string }>>([]);

  const showToast = React.useCallback((type: SecurityToastProps['type'], message: string, options?: Partial<SecurityToastProps>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, type, message, ...options };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    const duration = options?.duration ?? 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
};