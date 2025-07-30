"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { SecurityToast, useSecurityToast } from './security-toast';

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className
}) => {
  const { toasts, removeToast } = useSecurityToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 max-w-sm w-full',
        positionClasses[position],
        className
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <SecurityToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          autoClose={toast.autoClose}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// Global toast provider context
const ToastContext = React.createContext<ReturnType<typeof useSecurityToast> | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastUtils = useSecurityToast();

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};