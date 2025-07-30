"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';
import { Loader2 } from 'lucide-react';

export interface AuthButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(
        'transition-all duration-200',
        loading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};