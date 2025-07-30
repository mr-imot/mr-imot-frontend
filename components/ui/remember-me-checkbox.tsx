"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className
}) => {
  return (
    <label className={cn(
      "flex items-center gap-3 cursor-pointer group",
      disabled && "cursor-not-allowed opacity-60",
      className
    )}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        
        {/* Custom Checkbox */}
        <div className={cn(
          "w-5 h-5 rounded border-2 transition-all duration-200 ease-out",
          "flex items-center justify-center",
          checked 
            ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-500/25" 
            : "bg-white border-gray-300 hover:border-gray-400",
          
          // Focus styles
          "group-focus-within:ring-4 group-focus-within:ring-blue-100",
          
          // Disabled styles
          disabled && "bg-gray-100 border-gray-200",
          
          // Hover effects
          !disabled && !checked && "group-hover:border-blue-300 group-hover:bg-blue-50",
          !disabled && checked && "group-hover:bg-blue-700"
        )}>
          {/* Checkmark */}
          <Check 
            size={14} 
            className={cn(
              "text-white transition-all duration-200 ease-out",
              checked ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )} 
          />
        </div>
        
        {/* Ripple effect */}
        <div className={cn(
          "absolute inset-0 rounded border-2 border-blue-400 opacity-0",
          "transition-all duration-300 ease-out scale-150",
          checked && !disabled && "animate-pulse"
        )} />
      </div>
      
      <span className={cn(
        "text-sm font-medium transition-colors duration-200",
        checked ? "text-gray-900" : "text-gray-600",
        !disabled && "group-hover:text-gray-900"
      )}>
        Remember me for 30 days
      </span>
    </label>
  );
};