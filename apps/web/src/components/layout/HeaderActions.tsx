import { Bell, Refrigerator } from "lucide-react"

import { Cluster } from "@/components/primitives/Stack"

interface HeaderActionsProps {
  onNotifications?: () => void
  onFridge?: () => void
}

export function HeaderActions({ onNotifications, onFridge }: HeaderActionsProps) {
  return (
    <Cluster gap="sm">
      <button
        type="button"
        onClick={onNotifications}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="通知"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
      </button>
      <button
        type="button"
        onClick={onFridge}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="冷蔵庫"
      >
        <Refrigerator className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
      </button>
    </Cluster>
  )
}
