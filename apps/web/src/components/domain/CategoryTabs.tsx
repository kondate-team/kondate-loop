import { cn } from "@/lib/utils"

export interface CategoryItem {
  id: string
  label: string
  isDefault?: boolean
  isHidden?: boolean
  colorClass?: string
  activeColorClass?: string
  textClass?: string
  panelClass?: string
  panelRecipeClass?: string
  panelSetClass?: string
}

interface CategoryTabsProps {
  items: CategoryItem[]
  activeId: string
  onSelect: (id: string) => void
  onAdd?: () => void
  className?: string
}

export function CategoryTabs({
  items,
  activeId,
  onSelect,
  onAdd,
  className,
}: CategoryTabsProps) {
  const baseTab =
    "group relative flex h-12 w-11 items-center justify-center rounded-none text-[11px] transition"
  return (
    <div
      className={cn(
        "relative flex flex-col items-start gap-0 divide-y divide-border/40 overflow-visible",
        className
      )}
    >
      {items.map((item) => {
        const baseColor = item.colorClass ?? ""
        const activeColor = item.activeColorClass ?? item.colorClass ?? ""
        const isActive = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              baseTab,
              "[writing-mode:vertical-rl]",
              isActive ? activeColor : baseColor,
              item.textClass ?? "",
              isActive ? "z-10 -translate-x-0.5" : "hover:brightness-95"
            )}
          >
            <span className="tracking-widest">{item.label}</span>
          </button>
        )
      })}
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            baseTab,
            "bg-muted/40 text-lg text-muted-foreground hover:bg-muted/60"
          )}
          aria-label="カテゴリを追加"
        >
          ＋
        </button>
      ) : null}
    </div>
  )
}
