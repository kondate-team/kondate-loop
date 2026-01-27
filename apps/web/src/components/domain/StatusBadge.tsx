import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em]",
  {
    variants: {
      variant: {
        free: "bg-emerald-100 text-emerald-800",
        price: "bg-orange-100 text-orange-800",
        purchased: "bg-sky-100 text-sky-800",
        membership: "bg-amber-100 text-amber-900",
        status: "bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "status",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

export function StatusBadge({
  className,
  variant,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      <span className="min-w-0">{children}</span>
    </span>
  )
}
