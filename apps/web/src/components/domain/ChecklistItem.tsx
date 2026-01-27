import { Cluster } from "@/components/primitives/Stack"
import { Body, Muted } from "@/components/primitives/Typography"
import { cn } from "@/lib/utils"

interface ChecklistItemProps {
  label: string
  meta?: string
  checked?: boolean
  onToggle?: () => void
}

export function ChecklistItem({
  label,
  meta,
  checked,
  onToggle,
}: ChecklistItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition",
        checked ? "text-muted-foreground line-through" : "text-foreground"
      )}
    >
      <Cluster gap="sm" align="center" className="flex-1">
        <span
          className={cn(
            "h-4 w-4 rounded border",
            checked ? "border-primary bg-primary" : "border-border"
          )}
          aria-hidden
        />
        <Body className="text-sm font-medium">{label}</Body>
      </Cluster>
      {meta ? <Muted className="text-xs">{meta}</Muted> : null}
    </button>
  )
}
