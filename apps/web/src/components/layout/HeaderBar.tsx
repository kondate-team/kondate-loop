import * as React from "react"
import { ChevronLeft, Bell, Refrigerator } from "lucide-react"

import { Cluster } from "@/components/primitives/Stack"
import { H2 } from "@/components/primitives/Typography"
import { cn } from "@/lib/utils"

interface HeaderBarProps {
  variant?: "main" | "sub"
  title?: string
  onBack?: () => void
  onLogoClick?: () => void
  onHelpClick?: () => void
  actions?: React.ReactNode
  className?: string
}

export function HeaderBar({
  variant = "main",
  title,
  onBack,
  onLogoClick,
  onHelpClick,
  actions,
  className,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/60 bg-background/90 px-5 pb-3 pt-4 backdrop-blur",
        className
      )}
    >
      <Cluster justify="between" align="center">
        {variant === "sub" ? (
          <Cluster gap="sm">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="戻る"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {title ? <H2 className="text-lg">{title}</H2> : null}
          </Cluster>
        ) : (
          <Cluster gap="sm" align="center">
            <button
              type="button"
              onClick={onLogoClick}
              className="flex items-center text-left"
            >
              <img
                src="/brand/kondate-loop-logo.svg"
                alt="こんだてLoop"
                className="h-8 w-auto"
              />
            </button>
            <button
              type="button"
              onClick={onHelpClick}
              className="text-xs text-muted-foreground"
            >
              使い方
            </button>
          </Cluster>
        )}
        {actions ? (
          <Cluster gap="sm">{actions}</Cluster>
        ) : (
          <Cluster gap="sm">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="通知"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="冷蔵庫"
            >
              <Refrigerator className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            </button>
          </Cluster>
        )}
      </Cluster>
    </header>
  )
}
