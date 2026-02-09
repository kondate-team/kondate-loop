import { Bell, Refrigerator, Menu, User, LogOut } from "lucide-react"

import { Cluster } from "@/components/primitives/Stack"
import { isMvpMode } from "@/lib/features"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface HeaderActionsProps {
  onNotifications?: () => void
  onFridge?: () => void
  onAccount?: () => void
  onLogout?: () => void
  hasUnreadNotifications?: boolean
}

export function HeaderActions({
  onNotifications,
  onFridge,
  onAccount,
  onLogout,
  hasUnreadNotifications = true,
}: HeaderActionsProps) {
  return (
    <Cluster gap="sm">
      <button
        type="button"
        onClick={onFridge}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="冷蔵庫"
      >
        <Refrigerator className="h-4 w-4" />
      </button>
      {isMvpMode() ? (
        /* MVP: ハンバーガーメニュー（通知・アカウント・ログアウト） */
        <DropdownMenu
          trigger={
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="メニュー"
            >
              <Menu className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          }
        >
          <DropdownMenuItem
            icon={<Bell className="h-4 w-4" />}
            onClick={onNotifications}
            badge={
              hasUnreadNotifications ? (
                <span className="h-2 w-2 rounded-full bg-primary" />
              ) : undefined
            }
          >
            通知
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<User className="h-4 w-4" />}
            onClick={onAccount}
          >
            アカウント情報
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<LogOut className="h-4 w-4" />}
            onClick={onLogout}
            destructive
          >
            ログアウト
          </DropdownMenuItem>
        </DropdownMenu>
      ) : (
        /* 2ndリリース: 通知ベル（アカウント系はマイページへ） */
        <button
          type="button"
          onClick={onNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          aria-label="通知"
        >
          <Bell className="h-4 w-4" />
          {hasUnreadNotifications && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      )}
    </Cluster>
  )
}
