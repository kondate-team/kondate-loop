import * as React from "react"

import { Cluster, Stack } from "@/components/primitives/Stack"
import { H3, Muted } from "@/components/primitives/Typography"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <Cluster className={cn("w-full", className)} justify="between" align="start">
      <Stack gap="xs">
        <H3>{title}</H3>
        {description ? <Muted>{description}</Muted> : null}
      </Stack>
      {action ? <div>{action}</div> : null}
    </Cluster>
  )
}
