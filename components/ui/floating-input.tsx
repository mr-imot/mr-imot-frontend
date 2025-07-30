"use client";

import React, { useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  };
  onValidationChange?: (isValid: boolean, error: string | null) => void;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error: externalError,
  showPasswordToggle = false,
  validation,
  onValidationChange,
  className,
  type: initialType = 'text',
  value: controlledValue,
  onChange,
  onBlur,
  ...props
}) => {
  const id = useId();
  const [value, setValue] = useState(controlledValue || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const actualValue = controlledValue !== undefined ? controlledValue : value;
  const hasValue = actualValue && actualValue.toString().length > 0;
  const type = showPasswordToggle && showPassword ? 'text' : initialType;
  
  const validateValue = (val: string): string | null => {
    if (!validation) return null;

    if (validation.required && !val.trim()) {
      return `${label} is required`;
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `${label} must be at least ${validation.minLength} characters`;
    }

    if (validation.pattern && val.trim() && !validation.pattern.test(val)) {
      if (initialType === 'email') {
        return 'Please enter a valid email address';
      }
      return `${label} format is invalid`;
    }

    if (validation.customValidator) {
      return validation.customValidator(val);
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (controlledValue === undefined) {
      setValue(newValue);
    }
    
    // Real-time validation (only after first blur)
    if (hasBlurred) {
      const error = validateValue(newValue);
      setValidationError(error);
      onValidationChange?.(error === null, error);
    }
    
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasBlurred(true);
    
    // Validate on blur
    const error = validateValue(actualValue.toString());
    setValidationError(error);
    onValidationChange?.(error === null, error);
    
    onBlur?.(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const displayError = externalError || validationError;
  const hasError = Boolean(displayError) && hasBlurred;

  return (
    <div className="relative">
      <div className="relative">
        <input
          {...props}
          id={id}
          type={type}
          value={actualValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=" " // Required for CSS-only floating label
          className={cn(
            // Base styles
            "peer w-full h-14 px-4 pt-6 pb-2 border-2 rounded-xl bg-white/80 backdrop-blur-sm",
            "text-gray-900 text-base font-medium",
            "transition-all duration-200 ease-out",
            "placeholder-transparent",
            
            // Focus styles
            "focus:outline-none focus:ring-4 focus:ring-blue-100",
            
            // Border colors
            hasError 
              ? "border-red-300 focus:border-red-500" 
              : "border-gray-200 focus:border-blue-500",
            
            // Hover styles
            "hover:border-gray-300 hover:shadow-sm",
            
            // Error styles
            hasError && "bg-red-50/50",
            
            // Disabled styles
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            
            className
          )}
          aria-invalid={hasError}
          aria-describedby={displayError ? `${id}-error` : undefined}
        />
        
        {/* Floating Label */}
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 transition-all duration-200 ease-out cursor-text pointer-events-none",
            "text-gray-500 font-medium",
            
            // Floating state (when focused or has value)
            (isFocused || hasValue) ? [
              "top-2 text-xs",
              hasError ? "text-red-600" : isFocused ? "text-blue-600" : "text-gray-400"
            ] : [
              "top-1/2 -translate-y-1/2 text-base text-gray-400"
            ]
          )}
        >
          {label}
          {validation?.required && (
            <span className={cn(
              "ml-1",
              hasError ? "text-red-500" : "text-gray-400"
            )}>
              *
            </span>
          )}
        </label>

        {/* Password Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "text-gray-400 hover:text-gray-600 transition-colors",
              "focus:outline-none focus:text-blue-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={props.disabled}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {displayError && hasBlurred && (
        <div
          id={`${id}-error`}
          className="mt-2 px-1 text-sm text-red-600 font-medium animate-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          {displayError}
        </div>
      )}
      
      {/* Success indicator for valid fields */}
      {hasBlurred && !hasError && actualValue && validation && (
        <div className="mt-2 px-1 text-sm text-green-600 font-medium animate-in slide-in-from-top-1 duration-200">
          ✓ Looks good
        </div>
      )}
    </div>
  );
};