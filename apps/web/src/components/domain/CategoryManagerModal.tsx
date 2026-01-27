import * as React from "react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import type { CategoryItem } from "@/components/domain/CategoryTabs"
import { cn } from "@/lib/utils"

const MAX_VISIBLE_CATEGORIES = 8

interface CategoryManagerModalProps {
  open: boolean
  categories: CategoryItem[]
  onClose: () => void
  onSave: (next: CategoryItem[]) => void
  onCreate: (label: string) => CategoryItem
}

export function CategoryManagerModal({
  open,
  categories,
  onClose,
  onSave,
  onCreate,
}: CategoryManagerModalProps) {
  const [drafts, setDrafts] = React.useState<CategoryItem[]>(categories)
  const [newLabel, setNewLabel] = React.useState("")
  const visibleCount = drafts.filter((item) => !item.isHidden || item.id === "all").length
  const overLimit = visibleCount > MAX_VISIBLE_CATEGORIES

  React.useEffect(() => {
    if (!open) return
    setDrafts(categories)
    setNewLabel("")
  }, [open, categories])

  const updateLabel = (id: string, value: string) => {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: value } : item))
    )
  }

  const toggleHidden = (id: string) => {
    setDrafts((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.id === "all") return item
        return { ...item, isHidden: !item.isHidden }
      })
    )
  }

  const removeCategory = (id: string) => {
    setDrafts((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAdd = () => {
    if (!newLabel.trim()) return
    setDrafts((prev) => [...prev, onCreate(newLabel.trim())])
    setNewLabel("")
  }

  const handleSave = () => {
    if (overLimit) return
    onSave(drafts)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <Surface
        tone="card"
        density="none"
        elevation="raised"
        className="max-h-[85vh] w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <H2 className="text-lg">カテゴリ管理</H2>
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
            <Stack gap="sm">
              <H3 className="text-base">カテゴリ一覧</H3>
              <Stack gap="xs">
                {drafts.map((item) => {
                  const isAll = item.id === "all"
                  const canEdit = !item.isDefault && !isAll
                  const canHide = !isAll
                  const isHidden = !!item.isHidden && !isAll
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm"
                        value={item.label}
                        disabled={!canEdit}
                        onChange={(event) => updateLabel(item.id, event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => toggleHidden(item.id)}
                        disabled={!canHide}
                        className={cn(
                          "rounded-full border px-2 py-1 text-[10px]",
                          isHidden
                            ? "border-border/60 bg-muted/30 text-muted-foreground"
                            : "border-border bg-background text-foreground",
                          !canHide && "cursor-not-allowed opacity-60"
                        )}
                      >
                        {isAll ? "固定" : isHidden ? "非表示" : "表示中"}
                      </button>
                      {!canEdit ? (
                        <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground">
                          既定
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeCategory(item.id)}
                          className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  )
                })}
              </Stack>
              <Muted className="text-xs">
                既定カテゴリは編集・削除できません。非表示は可能です。
              </Muted>
              <Muted className="text-xs">
                表示中: {visibleCount}/{MAX_VISIBLE_CATEGORIES}件
              </Muted>
              {overLimit ? (
                <Muted className={cn("text-xs", "text-destructive")}>
                  表示できるカテゴリは最大{MAX_VISIBLE_CATEGORIES}件までです。非表示にして調整してください。
                </Muted>
              ) : null}
            </Stack>

            <div className="h-px bg-border/60" />

            <Stack gap="sm">
              <H3 className="text-base">カテゴリを追加</H3>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-full border border-border bg-card px-3 py-2 text-sm"
                  placeholder="例: ヘルシー"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                />
                <Button size="sm" onClick={handleAdd}>
                  追加
                </Button>
              </div>
            </Stack>
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="end">
            <Button className="rounded-full" onClick={handleSave} disabled={overLimit}>
              保存する
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
