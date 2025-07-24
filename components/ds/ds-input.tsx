import * as React from "react"
import { cn } from "@/lib/utils"

export interface DSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

const DSInput = React.forwardRef<HTMLInputElement, DSInputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-ds-1">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-ds border border-ds-neutral-300 bg-white px-ds-2 py-ds-1 text-ds-sm placeholder:text-ds-neutral-500 focus:border-ds-primary-600 focus:outline-none focus:ring-2 focus:ring-ds-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText && <p className={cn("ds-text-xs", error ? "text-red-600" : "text-ds-neutral-600")}>{helperText}</p>}
      </div>
    )
  },
)
DSInput.displayName = "DSInput"

export { DSInput }
