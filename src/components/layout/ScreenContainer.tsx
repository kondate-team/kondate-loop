import * as React from "react"

import { cn } from "@/lib/utils"

interface ScreenContainerProps {
  children: React.ReactNode
  className?: string
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return (
    <div className={cn("min-h-screen bg-background pb-28", className)}>
      <div className="mx-auto w-full max-w-[430px]">{children}</div>
    </div>
  )
}
