import { Plus, BookPlus, NotebookPen } from "lucide-react"

import { cn } from "@/lib/utils"

interface FabProps {
  open: boolean
  onToggle: () => void
  onCreateSet?: () => void
  onCreateRecipe?: () => void
  className?: string
}

export function Fab({
  open,
  onToggle,
  onCreateSet,
  onCreateRecipe,
  className,
}: FabProps) {
  return (
    <div className={cn("fixed bottom-20 right-5 z-30", className)}>
      {open ? (
        <div className="mb-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onCreateSet}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
          >
            <BookPlus className="h-4 w-4" />
            セットを作成
          </button>
          <button
            type="button"
            onClick={onCreateRecipe}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
          >
            <NotebookPen className="h-4 w-4" />
            レシピを追加
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
        aria-label="追加"
      >
        <Plus className={cn("h-6 w-6 transition", open ? "rotate-45" : "")}
        />
      </button>
    </div>
  )
}
