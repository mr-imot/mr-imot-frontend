/**
 * Brand Button Component
 * 
 * Pre-styled buttons using the Mr. Imot brand colors for consistency.
 * This component demonstrates how to use the brand color system.
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { brandColors } from '@/lib/brand-colors'

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'login'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  asChild?: boolean
}

const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = "rounded-full font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
    
    const variantClasses = {
      primary: `
        bg-[${brandColors.buttons.primary.background}] 
        text-[${brandColors.buttons.primary.text}]
        hover:bg-[${brandColors.buttons.primary.backgroundHover}]
        shadow-lg hover:shadow-xl
        focus:ring-gray-500
      `,
      secondary: `
        bg-transparent 
        border-2 border-[${brandColors.buttons.secondary.border}]
        text-[${brandColors.buttons.secondary.text}]
        hover:bg-[${brandColors.buttons.secondary.backgroundHover}]
        hover:text-[${brandColors.buttons.secondary.textHover}]
        shadow-lg hover:shadow-xl
        focus:ring-gray-500
      `,
      login: `
        bg-[${brandColors.buttons.login.background}]
        text-[${brandColors.buttons.login.text}]
        hover:bg-[${brandColors.buttons.login.backgroundHover}]
        shadow-sm hover:shadow-md
        focus:ring-gray-300
      `
    }
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-8 py-3 text-sm',
      lg: 'px-10 py-4 text-base'
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

BrandButton.displayName = "BrandButton"

export { BrandButton, type BrandButtonProps }
