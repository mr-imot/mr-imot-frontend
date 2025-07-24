import * as React from "react"
import { cn } from "@/lib/utils"

const DSCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    elevation?: "sm" | "default" | "md" | "lg" | "xl"
    padding?: "sm" | "default" | "lg" | "xl"
  }
>(({ className, elevation = "default", padding = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-ds border border-ds-neutral-200 bg-white text-ds-neutral-900",
      {
        "shadow-ds-sm": elevation === "sm",
        "shadow-ds": elevation === "default",
        "shadow-ds-md": elevation === "md",
        "shadow-ds-lg": elevation === "lg",
        "shadow-ds-xl": elevation === "xl",
      },
      {
        "p-ds-2": padding === "sm",
        "p-ds-3": padding === "default",
        "p-ds-4": padding === "lg",
        "p-ds-6": padding === "xl",
      },
      className,
    )}
    {...props}
  />
))
DSCard.displayName = "DSCard"

const DSCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-ds-1 pb-ds-3", className)} {...props} />
  ),
)
DSCardHeader.displayName = "DSCardHeader"

const DSCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("ds-text-lg leading-none tracking-tight", className)} {...props} />
  ),
)
DSCardTitle.displayName = "DSCardTitle"

const DSCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("ds-text-sm text-ds-neutral-600", className)} {...props} />
  ),
)
DSCardDescription.displayName = "DSCardDescription"

const DSCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("pt-0", className)} {...props} />,
)
DSCardContent.displayName = "DSCardContent"

const DSCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center pt-ds-3", className)} {...props} />,
)
DSCardFooter.displayName = "DSCardFooter"

export { DSCard, DSCardHeader, DSCardFooter, DSCardTitle, DSCardDescription, DSCardContent }
