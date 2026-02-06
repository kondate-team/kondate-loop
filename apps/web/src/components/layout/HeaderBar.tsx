import * as React from "react"
import { ChevronLeft, Bell, Refrigerator, Menu, User, LogOut } from "lucide-react"

import { Cluster } from "@/components/primitives/Stack"
import { H2 } from "@/components/primitives/Typography"
import { cn } from "@/lib/utils"
import { isMvpMode } from "@/lib/features"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface HeaderBarProps {
  variant?: "main" | "sub"
  title?: string
  onBack?: () => void
  onLogoClick?: () => void
  onHelpClick?: () => void
  onFridgeClick?: () => void
  onNotificationsClick?: () => void
  onAccountClick?: () => void
  onLogout?: () => void
  hasUnreadNotifications?: boolean
  actions?: React.ReactNode
  className?: string
}

export function HeaderBar({
  variant = "main",
  title,
  onBack,
  onLogoClick,
  onHelpClick,
  onFridgeClick,
  onNotificationsClick,
  onAccountClick,
  onLogout,
  hasUnreadNotifications = false,
  actions,
  className,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/60 bg-background/90 px-5 pb-3 pt-4 backdrop-blur",
        className
      )}
    >
      <Cluster justify="between" align="center">
        {variant === "sub" ? (
          <Cluster gap="sm">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
              aria-label="戻る"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {title ? <H2 className="text-lg">{title}</H2> : null}
          </Cluster>
        ) : (
          <Cluster gap="sm" align="center">
            <button
              type="button"
              onClick={onLogoClick}
              className="flex items-center text-left"
            >
              <img
                src={`${import.meta.env.BASE_URL}brand/kondate-loop-logo.svg`}
                alt="こんだてLoop"
                className="h-8 w-auto"
              />
            </button>
            <button
              type="button"
              onClick={onHelpClick}
              className="text-[11px] font-medium text-muted-foreground/65 transition-colors hover:text-muted-foreground"
            >
              使い方
            </button>
          </Cluster>
        )}
        {actions ? (
          <Cluster gap="sm">{actions}</Cluster>
        ) : (
          <Cluster gap="sm">
            <button
              type="button"
              onClick={onFridgeClick}
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
                  onClick={onNotificationsClick}
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
                  onClick={onAccountClick}
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
                onClick={onNotificationsClick}
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
        )}
      </Cluster>
    </header>
  )
}
