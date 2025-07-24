import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dsLabelVariants = cva(
  "text-ds-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-ds-neutral-800",
        required: "text-ds-neutral-800 after:content-['*'] after:text-red-500 after:ml-1",
        optional: "text-ds-neutral-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const DSLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof dsLabelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(dsLabelVariants({ variant }), className)} {...props} />
))
DSLabel.displayName = LabelPrimitive.Root.displayName

export { DSLabel }
