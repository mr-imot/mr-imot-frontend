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
    "bg-gradient-to-r from-blue-600 to-blue-700",
    "hover:from-blue-700 hover:to-blue-800",
    "active:from-blue-800 active:to-blue-900",
    "text-white shadow-lg shadow-blue-500/25",
    "hover:shadow-xl hover:shadow-blue-500/30",
    "border-transparent",
    "focus:ring-4 focus:ring-blue-100"
  ],
  secondary: [
    "bg-gradient-to-r from-gray-100 to-gray-200",
    "hover:from-gray-200 hover:to-gray-300",
    "text-gray-900 shadow-md",
    "border-gray-200",
    "focus:ring-4 focus:ring-gray-100"
  ],
  outline: [
    "bg-white/80 backdrop-blur-sm",
    "hover:bg-gray-50",
    "text-gray-700 shadow-sm",
    "border-2 border-gray-300",
    "hover:border-gray-400",
    "focus:ring-4 focus:ring-gray-100"
  ],
  ghost: [
    "bg-transparent",
    "hover:bg-gray-100",
    "text-gray-700",
    "border-transparent",
    "shadow-none",
    "focus:ring-4 focus:ring-gray-100"
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