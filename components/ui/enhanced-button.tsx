"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: [
    "bg-primary text-primary-foreground",
    "hover:bg-primary/90 active:bg-primary/95",
    "shadow-lg shadow-primary/25 hover:shadow-xl",
    "border-transparent",
    "focus:ring-4 focus:ring-primary/20"
  ],
  secondary: [
    "bg-gradient-to-r from-gray-100 to-gray-200",
    "hover:from-gray-200 hover:to-gray-300",
    "text-gray-900 shadow-md",
    "border-gray-200",
    "focus:ring-4 focus:ring-gray-100"
  ],
  outline: [
    "bg-background/80 backdrop-blur-sm",
    "hover:bg-background",
    "text-foreground/80 shadow-sm",
    "border-2 border-border",
    "hover:border-foreground/30",
    "focus:ring-4 focus:ring-accent/20"
  ],
  ghost: [
    "bg-transparent",
    "hover:bg-accent/10",
    "text-foreground",
    "border-transparent",
    "shadow-none",
    "focus:ring-4 focus:ring-accent/20"
  ]
};

const buttonSizes = {
  sm: "h-10 px-4 text-sm font-medium",
  md: "h-12 px-6 text-base font-semibold",
  lg: "h-14 px-8 text-lg font-semibold"
};

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center gap-2",
        "border rounded-xl font-medium transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-offset-2",
        "transform active:scale-[0.98]",
        
        // Size
        buttonSizes[size],
        
        // Variant
        buttonVariants[variant],
        
        // Full width
        fullWidth && "w-full",
        
        // Disabled state
        isDisabled && [
          "opacity-60 cursor-not-allowed",
          "transform-none active:scale-100",
          "shadow-none hover:shadow-none"
        ],
        
        // Loading state
        loading && "cursor-wait",
        
        className
      )}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 
          size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} 
          className="animate-spin" 
        />
      )}
      
      {/* Icon (when not loading) */}
      {!loading && icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Button Text */}
      <span className={cn(
        "transition-opacity duration-200",
        loading && loadingText ? "opacity-100" : "opacity-100"
      )}>
        {loading && loadingText ? loadingText : children}
      </span>
      
      {/* Ripple effect overlay */}
      <span className={cn(
        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200",
        "bg-white/20",
        !isDisabled && "group-active:opacity-100"
      )} />
    </button>
  );
};