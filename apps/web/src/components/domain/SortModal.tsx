import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SortModalProps {
  open: boolean
  onClose: () => void
  contextLabel: string
  options: string[]
  value: string
  onSelect: (value: string) => void
}

export function SortModal({
  open,
  onClose,
  contextLabel,
  options,
  value,
  onSelect,
}: SortModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
      <Surface tone="card" density="none" elevation="raised" className="w-full max-w-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <H2 className="text-lg">並び替え</H2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            閉じる
          </button>
        </div>
        <div className="px-5 py-4">
          <Stack gap="sm">
            <Muted className="text-xs">{contextLabel}</Muted>
            <Stack gap="xs">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect(option)}
                  className={cn(
                    "w-full rounded-full border px-4 py-2 text-left text-sm",
                    value === option
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </Stack>
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="end">
            <Button variant="secondary" size="sm" onClick={onClose}>
              OK
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
