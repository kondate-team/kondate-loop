import * as React from "react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Body, Muted } from "@/components/primitives/Typography"
import { StatusBadge } from "@/components/domain/StatusBadge"
import { cn } from "@/lib/utils"

interface RecipeDetailModalProps {
  open: boolean
  onClose: () => void
  data: {
    title: string
    author?: string
    sourceUrl?: string
    tags?: string[]
    servings?: string
    imageUrl?: string
    ingredients: string[]
    materials?: string[]
    steps: string[]
    statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
  }
  cooked?: boolean
  onToggleCooked?: () => void
  footer?: React.ReactNode
  onBackToSet?: () => void
  onOpenAuthor?: () => void
  locked?: boolean
  lockedMessage?: string
  lockedActions?: React.ReactNode
}

export function RecipeDetailModal({
  open,
  onClose,
  data,
  cooked,
  onToggleCooked,
  footer,
  onBackToSet,
  onOpenAuthor,
  locked,
  lockedMessage,
  lockedActions,
}: RecipeDetailModalProps) {
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
                    🍽️
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
              {data.sourceUrl ? (
                <Muted className="break-all text-xs">{data.sourceUrl}</Muted>
              ) : null}
              {data.statusBadges?.length ? (
                <Cluster gap="xs" className="flex-wrap">
                  {data.statusBadges.map((badge) => (
                    <StatusBadge key={badge.label} variant={badge.variant} className="self-start">
                      {badge.label}
                    </StatusBadge>
                  ))}
                </Cluster>
              ) : null}
              {data.tags?.length ? (
                <Muted className="text-xs">{data.tags.join(" ")}</Muted>
              ) : null}
            </Stack>

            {locked ? (
              <Stack gap="sm">
                {lockedMessage ? (
                  <Body className="text-sm text-muted-foreground">{lockedMessage}</Body>
                ) : null}
                {lockedActions ? lockedActions : null}
              </Stack>
            ) : (
              <>
                {data.servings ? (
                  <Surface tone="inset" density="compact">
                    <Body className="text-sm">{data.servings}</Body>
                  </Surface>
                ) : null}

                <Stack gap="sm">
                  <H3 className="text-base">材料</H3>
                  <Stack gap="xs">
                    {data.ingredients.map((item) => (
                      <div key={item} className="border-b border-border/60 pb-2 text-sm">
                        {item}
                      </div>
                    ))}
                  </Stack>
                </Stack>

                {data.materials?.length ? (
                  <Stack gap="sm">
                    <H3 className="text-base">中間素材</H3>
                    <Stack gap="xs">
                      {data.materials.map((item) => (
                        <div key={item} className="border-b border-border/60 pb-2 text-sm">
                          {item}
                        </div>
                      ))}
                    </Stack>
                  </Stack>
                ) : null}

                <Stack gap="sm">
                  <H3 className="text-base">作り方</H3>
                  <Stack gap="xs">
                    {data.steps.map((item, idx) => (
                      <div key={`${idx}-${item}`} className="border-b border-border/60 pb-2 text-sm">
                        {idx + 1}. {item}
                      </div>
                    ))}
                  </Stack>
                </Stack>
              </>
            )}

            {onBackToSet ? (
              <button
                type="button"
                onClick={onBackToSet}
                className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
              >
                セット詳細に戻る
              </button>
            ) : null}
          </Stack>
        </div>
        <div className="shrink-0 border-t border-border px-5 py-4">
          {footer ? (
            footer
          ) : (
            <button
              type="button"
              onClick={onToggleCooked}
              className={cn(
                "w-full rounded-full px-4 py-3 text-sm font-semibold",
                cooked ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {cooked ? "未調理に戻す" : "作った!"}
            </button>
          )}
        </div>
      </Surface>
    </div>
  )
}
