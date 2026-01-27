import * as React from "react"

import { H3 } from "@/components/primitives/Typography"
import { Surface } from "@/components/primitives/Surface"
import { StatusBadge } from "@/components/domain/StatusBadge"
import { cn } from "@/lib/utils"

export type RecipeSetVariant = "current" | "next" | "saved" | "selectable"

export interface RecipeSetCardProps {
  title: string
  count: number
  author?: string
  imageUrl?: string
  tags?: string[]
  statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
  variant?: RecipeSetVariant
  statusLabel?: string
  onClick?: () => void
  onAuthorClick?: () => void
  stacked?: boolean
  size?: "compact" | "selectable" | "default"
  footerAction?: React.ReactNode
}

export function RecipeSetCard({
  title,
  count,
  author,
  imageUrl,
  tags = [],
  statusBadges = [],
  variant = "saved",
  statusLabel,
  onClick,
  onAuthorClick,
  stacked = true,
  size = "default",
  footerAction,
}: RecipeSetCardProps) {
  const showStack = stacked
  const visibleBadges = statusBadges.slice(0, 2)
  const tagLine = [count ? `${count}品` : null, ...tags].filter(Boolean).join(" ")
  const isNext = variant === "next"
  const showBadges = !isNext && visibleBadges.length > 0
  const sizeClass =
    size === "compact" ? "h-[230px]" : size === "selectable" ? "h-[230px]" : "h-[230px]"
  const imageHeightClass = isNext ? "h-[44%]" : size === "selectable" ? "h-[40%]" : "h-1/2"
  const bodyHeightClass = isNext ? "h-[56%]" : size === "selectable" ? "h-[60%]" : "h-1/2"
  const bodyPaddingClass = isNext ? "px-2 pb-1 pt-0.5" : "px-2 py-1"
  const titleClass = isNext ? "text-[12px]" : "text-[13px]"
  const tagLineClass = size === "selectable" ? "line-clamp-2" : "line-clamp-1"
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="w-full text-left"
    >
      <div className="relative">
        {showStack ? (
          <>
            <div className="pointer-events-none absolute inset-0 -translate-x-1 translate-y-1 rounded-sm border border-border/60 bg-card/50" />
            <div className="pointer-events-none absolute inset-0 -translate-x-2 translate-y-2 rounded-sm border border-border/40 bg-card/30" />
          </>
        ) : null}
        <Surface
          tone="card"
          density="none"
          elevation={variant === "current" ? "raised" : "flat"}
          className={cn(
            "relative rounded-sm overflow-hidden",
            variant === "current" ? "border-primary/40" : ""
          )}
        >
          <div className={cn("flex flex-col overflow-hidden", sizeClass)}>
            <div className={cn("relative border-b border-border bg-muted", imageHeightClass)}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  📚
                </div>
              )}
              {author ? (
                onAuthorClick ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onAuthorClick()
                    }}
                    className="absolute right-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {author}
                  </button>
                ) : (
                  <span className="absolute right-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {author}
                  </span>
                )
              ) : null}
              <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] text-background">
                {count}品
              </span>
            </div>

            <div className={cn("flex flex-col gap-0.5", bodyHeightClass, bodyPaddingClass)}>
              <H3 className={cn("leading-snug line-clamp-2", titleClass)}>{title}</H3>

              <div className="min-h-[16px]">
                {tagLine ? (
                  <span className={cn("block text-[11px] text-muted-foreground", tagLineClass)}>
                    {tagLine}
                  </span>
                ) : null}
              </div>
              <div className={cn("min-h-[32px]", isNext ? "hidden" : "")}>
                {showBadges ? (
                  <div className="flex flex-wrap items-start gap-1">
                    {visibleBadges.map((badge) => (
                      <StatusBadge key={badge.label} variant={badge.variant} className="self-start">
                        {badge.label}
                      </StatusBadge>
                    ))}
                  </div>
                ) : null}
              </div>
            {statusLabel ? (
              <StatusBadge variant="membership" className="self-start">
                {statusLabel}
              </StatusBadge>
            ) : null}
              {footerAction ? (
                <div className="mt-auto border-t border-border/40 pt-1">
                  {footerAction}
                </div>
              ) : null}
            </div>
          </div>
        </Surface>
      </div>
    </div>
  )
}
