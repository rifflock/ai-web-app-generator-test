
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nautical-blue text-white hover:bg-nautical-blue/80",
        secondary:
          "border-transparent bg-nautical-teal text-white hover:bg-nautical-teal/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        coral: "border-transparent bg-nautical-coral text-white hover:bg-nautical-coral/80",
        light: "border-transparent bg-nautical-light text-nautical-blue hover:bg-nautical-light/80",
        sand: "border-transparent bg-nautical-sand text-nautical-blue hover:bg-nautical-sand/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
