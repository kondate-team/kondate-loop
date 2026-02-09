import * as React from "react"
import { BookOpen, CalendarDays, Store, UserCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { FEATURES } from "@/lib/features"

export type NavItemKey = "kondate" | "book" | "catalog" | "mypage"

const allNavItems: {
  id: NavItemKey
  label: string
  icon: React.ReactNode
  enabled: boolean
}[] = [
  { id: "kondate", label: "献立表", icon: <CalendarDays className="h-6 w-6" />, enabled: true },
  { id: "book", label: "レシピ帳", icon: <BookOpen className="h-6 w-6" />, enabled: true },
  { id: "catalog", label: "レシピカタログ", icon: <Store className="h-6 w-6" />, enabled: FEATURES.CATALOG_ENABLED },
  { id: "mypage", label: "マイページ", icon: <UserCircle className="h-6 w-6" />, enabled: FEATURES.MYPAGE_ENABLED },
]

const navItems = allNavItems.filter(item => item.enabled)

interface BottomNavProps {
  active: NavItemKey
  onChange: (id: NavItemKey) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const isTwoTabs = navItems.length === 2

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className={cn(
        "mx-auto w-full",
        isTwoTabs ? "max-w-xs" : "max-w-sm"
      )}>
        <div className={cn(
          "flex items-center",
          isTwoTabs ? "justify-around" : "justify-evenly"
        )}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition",
                active === item.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
