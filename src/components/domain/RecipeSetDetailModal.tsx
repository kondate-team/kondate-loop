import * as React from "react"

import { Surface } from "@/components/primitives/Surface"
import { Stack } from "@/components/primitives/Stack"
import { H2, H3, Body, Muted } from "@/components/primitives/Typography"
import { StatusBadge } from "@/components/domain/StatusBadge"

interface RecipeSetDetailModalProps {
  open: boolean
  onClose: () => void
  data: {
    title: string
    author?: string
    description?: string
    tags?: string[]
    count?: number
    imageUrl?: string
    statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
    recipes?: {
      id: string
      title: string
      author?: string
      tags?: string[]
      imageUrl?: string
    }[]
  }
  footer?: React.ReactNode
  onOpenRecipe?: (id: string) => void
  onOpenAuthor?: () => void
  locked?: boolean
  lockedMessage?: string
  lockedActions?: React.ReactNode
}

export function RecipeSetDetailModal({
  open,
  onClose,
  data,
  footer,
  onOpenRecipe,
  onOpenAuthor,
  locked,
  lockedMessage,
  lockedActions,
}: RecipeSetDetailModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <Surface
        tone="card"
        density="none"
        elevation="raised"
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <H2 className="text-lg">{data.title}</H2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            閉じる
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          <Stack gap="md">
            <div className="overflow-hidden rounded-md border border-border bg-muted">
              <div className="aspect-[16/9] w-full">
                {data.imageUrl ? (
                  <img
                    src={data.imageUrl}
                    alt={data.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    📚
                  </div>
                )}
              </div>
            </div>

            <Stack gap="xs">
              {data.author ? (
                onOpenAuthor ? (
                  <button
                    type="button"
                    onClick={onOpenAuthor}
                    className="text-left text-xs text-muted-foreground underline decoration-border"
                  >
                    作成者: {data.author}
                  </button>
                ) : (
                  <Muted className="text-xs">作成者: {data.author}</Muted>
                )
              ) : null}
              {data.description ? (
                <Body className="text-sm text-muted-foreground">{data.description}</Body>
              ) : (
                <Body className="text-sm text-muted-foreground">概要はまだありません</Body>
              )}
              {data.tags?.length ? (
                <Muted className="text-xs">{data.tags.join(" ")}</Muted>
              ) : null}
              {data.count ? (
                <Body className="text-sm">{data.count}品のレシピ</Body>
              ) : null}
              {data.statusBadges?.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.statusBadges.map((badge) => (
                    <StatusBadge key={badge.label} variant={badge.variant} className="self-start">
                      {badge.label}
                    </StatusBadge>
                  ))}
                </div>
              ) : null}
            </Stack>

            {locked ? (
              <Stack gap="sm">
                {lockedMessage ? (
                  <Body className="text-sm text-muted-foreground">{lockedMessage}</Body>
                ) : null}
                {lockedActions ? lockedActions : null}
              </Stack>
            ) : data.recipes?.length ? (
              <div>
                <H3 className="text-base">セットのレシピ</H3>
                <div className="mt-2 overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {data.recipes.map((recipe, index) => (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => onOpenRecipe?.(recipe.id)}
                        className="w-[140px] text-left"
                      >
                        <Surface tone="card" density="none" className="rounded-sm overflow-hidden">
                          <div className="relative h-[90px] border-b border-border bg-muted">
                            {recipe.imageUrl ? (
                              <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                🍽️
                              </div>
                            )}
                            <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] text-background">
                              {index + 1}日目
                            </span>
                          </div>
                          <div className="px-2 py-1">
                            <Body className="text-xs line-clamp-2">{recipe.title}</Body>
                            {recipe.tags?.length ? (
                              <Muted className="text-[10px]">{recipe.tags.slice(0, 2).join(" ")}</Muted>
                            ) : null}
                          </div>
                        </Surface>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Stack>
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-border px-5 py-4">{footer}</div>
        ) : null}
      </Surface>
    </div>
  )
}
