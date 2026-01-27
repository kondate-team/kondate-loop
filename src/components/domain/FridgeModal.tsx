import * as React from "react"
import { Apple, Refrigerator } from "lucide-react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3 } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"

interface FridgeModalProps {
  open: boolean
  onClose: () => void
  items: { id: string; name: string; amount: number; unit: string }[]
  deletedItems: { id: string; name: string; amount: number; unit: string; deletedAt: string }[]
  onAddItem: (name: string, amount: number, unit: string) => void
  onDeleteItem: (id: string) => void
  unitOptions: string[]
  onAddUnitOption?: (unit: string) => void
}

const normalizeNumberInput = (value: string) =>
  value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")

export function FridgeModal({
  open,
  onClose,
  items,
  deletedItems,
  onAddItem,
  onDeleteItem,
  unitOptions,
  onAddUnitOption,
}: FridgeModalProps) {
  const [name, setName] = React.useState("")
  const [amount, setAmount] = React.useState("1")
  const [unit, setUnit] = React.useState("個")
  const [showAdd, setShowAdd] = React.useState(false)
  const [showDeleted, setShowDeleted] = React.useState(false)
  const unitListId = React.useId()

  const handleAdd = () => {
    if (!name.trim()) return
    const parsedAmount = Number(amount) || 1
    const trimmedUnit = unit.trim() || "個"
    onAddItem(name.trim(), parsedAmount, trimmedUnit)
    onAddUnitOption?.(trimmedUnit)
    setName("")
    setAmount("1")
    setUnit("個")
    setShowAdd(false)
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
          <H2 className="text-lg">
            <span className="inline-flex items-center gap-2">
              <Refrigerator className="h-5 w-5 text-muted-foreground" />
              冷蔵庫
            </span>
          </H2>
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
            {showDeleted ? (
              <Stack gap="sm">
                <H3 className="text-base">削除した食材</H3>
                {deletedItems.length ? (
                  deletedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs"
                    >
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.amount}
                        {item.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground">
                    履歴はありません
                  </div>
                )}
              </Stack>
            ) : items.length ? (
              <div className="grid grid-cols-3 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (window.confirm(`${item.name}を削除しますか？`)) {
                        onDeleteItem(item.id)
                      }
                    }}
                    className="rounded-md border border-border bg-card px-2 py-3 text-center transition hover:bg-muted/40"
                  >
                    <Apple className="h-6 w-6 text-muted-foreground" />
                    <div className="truncate text-xs font-semibold">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {item.amount}
                      {item.unit}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <Apple className="h-10 w-10 text-muted-foreground" />
                <div className="mt-2">冷蔵庫は空です</div>
                <div className="text-xs">買い物リストから追加できます</div>
              </div>
            )}

            {showAdd ? (
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="sm">
                  <H3 className="text-base">食材を追加</H3>
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    placeholder="例: 豚バラ肉"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={amount}
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    onChange={(event) => setAmount(normalizeNumberInput(event.target.value))}
                  />
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={unit}
                    list={unitListId}
                    onChange={(event) => setUnit(event.target.value)}
                  />
                  <datalist id={unitListId}>
                    {unitOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                  <Cluster gap="sm" justify="end">
                    <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                      キャンセル
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleAdd}>
                      追加する
                    </Button>
                  </Cluster>
                </Stack>
              </Surface>
            ) : (
              <Cluster justify="between">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleted((prev) => !prev)}>
                  履歴
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
                  食材を追加
                </Button>
              </Cluster>
            )}
          </Stack>
        </div>
      </Surface>
    </div>
  )
}
