import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dsButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-ds text-ds-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ds-primary-600 text-white hover:bg-ds-primary-700 active:bg-ds-primary-800 shadow-ds hover:shadow-ds-md",
        secondary:
          "bg-ds-neutral-50 text-ds-neutral-800 border border-ds-neutral-200 hover:bg-ds-neutral-100 active:bg-ds-neutral-200 shadow-ds-sm hover:shadow-ds",
        accent:
          "bg-ds-accent-500 text-white hover:bg-ds-accent-600 active:bg-ds-accent-700 shadow-ds hover:shadow-ds-md",
        outline: "border border-ds-primary-600 text-ds-primary-600 hover:bg-ds-primary-50 active:bg-ds-primary-100",
        ghost: "text-ds-neutral-700 hover:bg-ds-neutral-100 active:bg-ds-neutral-200",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-ds hover:shadow-ds-md",
      },
      size: {
        sm: "h-8 px-ds-2 text-ds-xs",
        default: "h-10 px-ds-3 text-ds-sm",
        lg: "h-12 px-ds-4 text-ds-base",
        xl: "h-14 px-ds-6 text-ds-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface DSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dsButtonVariants> {
  asChild?: boolean
}

const DSButton = React.forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(dsButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
DSButton.displayName = "DSButton"

export { DSButton, dsButtonVariants }
