import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva("rounded-2xl border", {
  variants: {
    tone: {
      page: "border-transparent bg-background",
      section: "border-transparent bg-accent/50",
      card: "bg-card text-card-foreground shadow-sm",
      inset: "bg-secondary/70 text-secondary-foreground",
    },
    density: {
      comfy: "p-5",
      compact: "p-3",
      none: "p-0",
    },
    elevation: {
      flat: "shadow-none",
      raised: "shadow-soft",
    },
  },
  defaultVariants: {
    tone: "card",
    density: "comfy",
    elevation: "flat",
  },
})

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export function Surface({
  className,
  tone,
  density,
  elevation,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(surfaceVariants({ tone, density, elevation }), className)}
      {...props}
    />
  )
}
