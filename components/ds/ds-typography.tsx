import * as React from "react"
import { cn } from "@/lib/utils"

interface DSTypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
  variant?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
  color?: "primary" | "secondary" | "accent" | "neutral-600" | "neutral-700" | "neutral-800" | "neutral-900"
}

const DSTypography = React.forwardRef<HTMLElement, DSTypographyProps>(
  ({ className, as: Component = "p", variant = "base", weight = "normal", color = "neutral-800", ...props }, ref) => {
    const variantClasses = {
      xs: "text-ds-xs",
      sm: "text-ds-sm",
      base: "text-ds-base",
      lg: "text-ds-lg",
      xl: "text-ds-xl",
      "2xl": "text-ds-2xl",
    }

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    }

    const colorClasses = {
      primary: "text-ds-primary-600",
      secondary: "text-ds-primary-700",
      accent: "text-ds-accent-500",
      "neutral-600": "text-ds-neutral-600",
      "neutral-700": "text-ds-neutral-700",
      "neutral-800": "text-ds-neutral-800",
      "neutral-900": "text-ds-neutral-900",
    }

    return React.createElement(Component, {
      ref,
      className: cn(variantClasses[variant], weightClasses[weight], colorClasses[color], className),
      ...props,
    })
  },
)
DSTypography.displayName = "DSTypography"

export { DSTypography }
