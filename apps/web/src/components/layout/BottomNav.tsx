import * as React from "react"
import { BookOpen, CalendarDays, Store, UserCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type NavItemKey = "kondate" | "book" | "catalog" | "mypage"

const navItems: {
  id: NavItemKey
  label: string
  icon: React.ReactNode
}[] = [
  { id: "kondate", label: "献立表", icon: <CalendarDays className="h-6 w-6" /> },
  { id: "book", label: "レシピ帳", icon: <BookOpen className="h-6 w-6" /> },
  { id: "catalog", label: "レシピカタログ", icon: <Store className="h-6 w-6" /> },
  { id: "mypage", label: "マイページ", icon: <UserCircle className="h-6 w-6" /> },
]

interface BottomNavProps {
  active: NavItemKey
  onChange: (id: NavItemKey) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition",
                active === item.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
