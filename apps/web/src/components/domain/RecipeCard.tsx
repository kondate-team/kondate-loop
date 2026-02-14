import * as React from "react"

import { H3 } from "@/components/primitives/Typography"
import { Surface } from "@/components/primitives/Surface"
import { StatusBadge } from "@/components/domain/StatusBadge"
import { cn } from "@/lib/utils"

export type RecipeCardVariant = "default" | "compact" | "selectable" | "saved"

export interface RecipeCardProps {
  title: string
  author?: string
  imageUrl?: string
  tags?: string[]
  statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
  cooked?: boolean
  variant?: RecipeCardVariant
  onClick?: () => void
  onAuthorClick?: () => void
  footerAction?: React.ReactNode
}

export function RecipeCard({
  title,
  author,
  imageUrl,
  tags = [],
  statusBadges = [],
  cooked,
  variant = "default",
  onClick,
  onAuthorClick,
  footerAction,
}: RecipeCardProps) {
  const visibleBadges = statusBadges.slice(0, 2)
  const isSelectable = variant === "selectable"
  const hasFooter = Boolean(footerAction)

  const sizeClass = "h-[230px]"
  const imageClass = cn("h-full w-full object-cover", cooked ? "opacity-75" : "")
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
      <Surface
        tone="card"
        density="none"
        elevation="flat"
        className={cn(
          "transition rounded-sm overflow-hidden shadow-none",
          cooked
            ? "border-border/50 bg-card opacity-70"
            : cn(
                "border-border/50 bg-card shadow-[0_4px_10px_hsl(var(--kondate-shadow))]",
                isSelectable ? "hover:-translate-y-0.5" : ""
              )
        )}
      >
        <div className={cn("flex flex-col overflow-hidden", sizeClass)}>
          <div className="relative h-1/2 border-b border-border bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className={imageClass}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">
                🍳
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
            {cooked ? (
              <span className="absolute left-2 top-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                作った
              </span>
            ) : null}
          </div>

          <div className="flex h-1/2 flex-col gap-0.5 px-2 pb-1 pt-0.5">
            {hasFooter ? (
              <>
                <div className="min-h-[48px]">
                  <div className="text-[13px] leading-snug line-clamp-3">
                    <span className="font-semibold">{title}</span>
                    {tags.length ? (
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {tags.join("・")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-1">
                  {visibleBadges.length ? (
                    <div className="flex flex-wrap items-start gap-1">
                      {visibleBadges.map((badge) => (
                        <StatusBadge key={badge.label} variant={badge.variant} className="self-start">
                          {badge.label}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : null}
                  {footerAction ? (
                    <div className="border-t border-border/40 pt-1">
                      {footerAction}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <H3 className="text-[13px] leading-snug line-clamp-2">{title}</H3>
                <div className="min-h-[16px] overflow-hidden">
                  {tags.length ? (
                    <span className="block text-[11px] text-muted-foreground line-clamp-1">
                      {tags.join(", ")}
                    </span>
                  ) : null}
                </div>
                <div className="min-h-[32px]">
                  {visibleBadges.length ? (
                    <div className="flex flex-wrap items-start gap-1">
                      {visibleBadges.map((badge) => (
                        <StatusBadge key={badge.label} variant={badge.variant} className="self-start">
                          {badge.label}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </Surface>
    </div>
  )
}
