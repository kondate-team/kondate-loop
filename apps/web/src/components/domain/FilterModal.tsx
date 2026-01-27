import * as React from "react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FilterGroupKey } from "@/data/filterOptions"

export type FilterState = Record<FilterGroupKey, string[]>

interface FilterSection {
  key: FilterGroupKey
  title: string
  options: string[]
  hidden?: boolean
}

interface FilterModalProps {
  open: boolean
  onClose: () => void
  contextLabel: string
  sections: FilterSection[]
  state: FilterState
  onToggle: (group: FilterGroupKey, value: string) => void
  onReset: () => void
  onApply: () => void
}

export function FilterModal({
  open,
  onClose,
  contextLabel,
  sections,
  state,
  onToggle,
  onReset,
  onApply,
}: FilterModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40">
      <Surface
        tone="card"
        density="none"
        elevation="raised"
        className="w-full rounded-t-3xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <H2 className="text-lg">絞り込み</H2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            閉じる
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <Stack gap="md">
            <Muted className="text-xs">{contextLabel}</Muted>
            {sections
              .filter((section) => !section.hidden)
              .map((section) => (
                <Stack key={section.key} gap="xs">
                  <span className="text-sm font-semibold text-foreground">{section.title}</span>
                  <div className="flex flex-wrap gap-2">
                    {section.options.map((option) => {
                      const active = state[section.key]?.includes(option)
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onToggle(section.key, option)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            active
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                          )}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </Stack>
              ))}
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="between">
            <Button variant="ghost" size="sm" onClick={onReset}>
              リセット
            </Button>
            <Button variant="secondary" size="sm" onClick={onApply}>
              適用する
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
