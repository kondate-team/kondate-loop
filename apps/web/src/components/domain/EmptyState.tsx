import * as React from "react"

import { Stack } from "@/components/primitives/Stack"
import { H3, Muted } from "@/components/primitives/Typography"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Stack
      gap="sm"
      align="center"
      className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center",
        className
      )}
    >
      {icon ? <div className="text-2xl">{icon}</div> : null}
      <H3 className="text-base">{title}</H3>
      {description ? <Muted>{description}</Muted> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </Stack>
  )
}
