import * as React from "react"

import { Refrigerator } from "lucide-react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3 } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShoppingModalProps {
  open: boolean
  onClose: () => void
  items: {
    id: string
    name: string
    amount: number
    unit: string
    isExtra?: boolean
    checked?: boolean
  }[]
  /** 冷蔵庫にあるが単位が異なる食材（参考表示用） */
  fridgeItemsWithMismatchedUnit?: {
    id: string
    name: string
    amount: number
    unit: string
  }[]
  onToggle: (id: string) => void
  onConfirm: () => void
  onAddExtra: (name: string, amount: number, unit: string) => void
  onRemoveExtra: (id: string) => void
  unitOptions: string[]
  onAddUnitOption?: (unit: string) => void
}

const normalizeNumberInput = (value: string) =>
  value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")

export function ShoppingModal({
  open,
  onClose,
  items,
  fridgeItemsWithMismatchedUnit = [],
  onToggle,
  onConfirm,
  onAddExtra,
  onRemoveExtra,
  unitOptions,
  onAddUnitOption,
}: ShoppingModalProps) {
  const [extraName, setExtraName] = React.useState("")
  const [extraAmount, setExtraAmount] = React.useState("1")
  const [extraUnit, setExtraUnit] = React.useState("")
  const unitListId = React.useId()

  const sortedItems = [...items].sort((a, b) => {
    if (!!a.checked === !!b.checked) return 0
    return a.checked ? 1 : -1
  })
  const hasChecked = sortedItems.some((item) => item.checked)

  const handleAddExtra = () => {
    if (!extraName.trim()) return
    const amount = Number(extraAmount) || 1
    const unit = extraUnit.trim() || "個"
    onAddExtra(extraName.trim(), amount, unit)
    onAddUnitOption?.(unit)
    setExtraName("")
    setExtraAmount("1")
    setExtraUnit("")
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
          <H2 className="text-lg">🛒 買い物リスト</H2>
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
            {items.length ? (
              <>
                <H2 className="text-xl">買うもの</H2>
                <Stack gap="sm">
                  {sortedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggle(item.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left",
                        item.checked ? "opacity-60" : ""
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border border-border text-transparent",
                          item.checked ? "border-emerald-300 bg-emerald-500 text-white" : ""
                        )}
                      >
                        ✓
                      </span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold text-foreground truncate",
                            item.checked ? "line-through" : ""
                          )}
                        >
                          {item.name}
                        </span>
                        {item.isExtra ? (
                          <span className="rounded-full bg-accent/50 px-2 text-[10px] text-accent-foreground">
                            追加
                          </span>
                        ) : null}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.amount}
                          {item.unit}
                        </span>
                        {item.isExtra ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onRemoveExtra(item.id)
                            }}
                            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                            aria-label="削除"
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </Stack>
              </>
            ) : null}

            <Surface tone="section" density="comfy" className="border-transparent">
              <Stack gap="sm">
                <H3 className="text-base">他の食材を追加</H3>
                <div className="grid grid-cols-[minmax(0,1fr)_64px_64px_64px] gap-2">
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    placeholder="追加する食材"
                    value={extraName}
                    onChange={(event) => setExtraName(event.target.value)}
                  />
                  <input
                    className="rounded-md border border-border bg-card px-2 py-2 text-sm text-right"
                    value={extraAmount}
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    onChange={(event) => setExtraAmount(normalizeNumberInput(event.target.value))}
                  />
                  <input
                    className="rounded-md border border-border bg-card px-2 py-2 text-sm"
                    placeholder="単位"
                    value={extraUnit}
                    list={unitListId}
                    onChange={(event) => setExtraUnit(event.target.value)}
                  />
                  <datalist id={unitListId}>
                    {unitOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <Button size="sm" onClick={handleAddExtra}>
                    追加
                  </Button>
                </div>
              </Stack>
            </Surface>

            {fridgeItemsWithMismatchedUnit.length > 0 && (
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="sm">
                  <H3 className="flex items-center gap-1.5 text-base">
                    <Refrigerator className="h-4 w-4" />
                    冷蔵庫にある食材
                  </H3>
                  <Stack gap="xs">
                    {fridgeItemsWithMismatchedUnit.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border border-border/50 bg-card/50 px-3 py-2"
                      >
                        <span className="text-sm text-foreground/80">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.amount}
                          {item.unit}
                        </span>
                      </div>
                    ))}
                  </Stack>
                </Stack>
              </Surface>
            )}
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="end">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={onConfirm}
              disabled={!hasChecked}
            >
              買い物完了！
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
