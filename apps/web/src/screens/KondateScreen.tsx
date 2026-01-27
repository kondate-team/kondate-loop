import * as React from "react"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"

import { ScreenContainer } from "@/components/layout/ScreenContainer"
import { HeaderBar } from "@/components/layout/HeaderBar"
import { HeaderActions } from "@/components/layout/HeaderActions"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Muted } from "@/components/primitives/Typography"
import { SectionHeader } from "@/components/primitives/SectionHeader"
import { EmptyState } from "@/components/domain/EmptyState"
import { RecipeCard } from "@/components/domain/RecipeCard"
import { RecipeSetCard } from "@/components/domain/RecipeSetCard"
import { Button } from "@/components/ui/button"

interface KondateScreenProps {
  currentSet?: {
    title: string
    count: number
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
  }
  nextSet?: {
    title: string
    count: number
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
  }
  recipes: {
    id: string
    title: string
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    cooked?: boolean
  }[]
  onOpenRecipe: (id: string) => void
  onSelectSet?: () => void
  onResetCurrent?: () => void
  onChangeSet?: () => void
  onSelectNext?: () => void
  onResetNext?: () => void
  showShopping?: boolean
  shoppingCount?: number
  onOpenShopping?: () => void
  onOpenNotifications?: () => void
  onOpenFridge?: () => void
  onOpenHelp?: () => void
  onOpenHome?: () => void
  onOpenCurrentSet?: () => void
  onOpenNextSet?: () => void
}

export function KondateScreen({
  currentSet,
  nextSet,
  recipes,
  onOpenRecipe,
  onSelectSet,
  onResetCurrent,
  onChangeSet,
  onSelectNext,
  onResetNext,
  showShopping,
  shoppingCount,
  onOpenShopping,
  onOpenNotifications,
  onOpenFridge,
  onOpenHelp,
  onOpenHome,
  onOpenCurrentSet,
  onOpenNextSet,
}: KondateScreenProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const scrollByCards = (direction: "left" | "right") => {
    const node = scrollRef.current
    if (!node) return
    const amount = direction === "left" ? -170 : 170
    node.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <ScreenContainer>
      <HeaderBar
        actions={<HeaderActions onNotifications={onOpenNotifications} onFridge={onOpenFridge} />}
        onHelpClick={onOpenHelp}
        onLogoClick={onOpenHome}
      />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <div className="flex items-center">
            <H2 className="relative text-[22px] tracking-tight">
              <span className="relative z-10">献立表</span>
              <span className="absolute -bottom-1 left-0 h-3 w-full origin-left skew-x-[-12deg] rounded-[1px] bg-orange-200/75" />
            </H2>
          </div>
          {showShopping && shoppingCount && shoppingCount > 0 ? (
            <button
              type="button"
              onClick={onOpenShopping}
              className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
            >
              <Cluster gap="sm">
                <ShoppingCart className="h-4 w-4" />
                買い物リスト
              </Cluster>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">
                {shoppingCount}
              </span>
            </button>
          ) : null}

          {currentSet ? (
            <Stack gap="md">
                <Cluster justify="between" align="center">
                  <button type="button" onClick={onOpenCurrentSet} className="text-left">
                    <H3 className="text-base">{currentSet.title}</H3>
                  </button>
                  <Button variant="ghost" size="sm" onClick={onResetCurrent}>
                    リセット
                  </Button>
                </Cluster>
                <div className="relative">
                  <div
                    ref={scrollRef}
                    className="no-scrollbar overflow-x-auto"
                  >
                    <div className="flex gap-4 pb-2">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="min-w-[140px] max-w-[140px]">
                        <RecipeCard
                          title={recipe.title}
                          author={recipe.author}
                          tags={recipe.tags}
                          imageUrl={recipe.imageUrl}
                          cooked={recipe.cooked}
                          variant="selectable"
                          onClick={() => onOpenRecipe(recipe.id)}
                        />
                      </div>
                    ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollByCards("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1 text-muted-foreground shadow-sm"
                    aria-label="左へ"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByCards("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1 text-muted-foreground shadow-sm"
                    aria-label="右へ"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <Cluster justify="end">
                  <Button onClick={onChangeSet}>
                    セットを変える
                  </Button>
                </Cluster>
              </Stack>
          ) : (
            <EmptyState
              icon={<span className="text-xl">🎴</span>}
              title="献立がありません"
              description="セットを選ぶ"
              className="border-none bg-transparent px-0 py-2"
              action={
                <Button onClick={onSelectSet} className="rounded-full">
                  セットを選ぶ
                </Button>
              }
            />
          )}

          <Stack gap="md">
              <SectionHeader title="次の献立" />
              {nextSet ? (
                <Stack gap="sm">
                  <div className="w-[140px]">
                    <RecipeSetCard
                      title={nextSet.title}
                      count={nextSet.count}
                      author={nextSet.author}
                      tags={nextSet.tags}
                      imageUrl={nextSet.imageUrl}
                      variant="next"
                      size="selectable"
                      footerAction={
                        <Cluster gap="xs" onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={(event) => {
                              event.stopPropagation()
                              onResetNext?.()
                            }}
                          >
                            取り消し
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={(event) => {
                              event.stopPropagation()
                              onSelectNext?.()
                            }}
                          >
                            変更
                          </Button>
                        </Cluster>
                      }
                      onClick={onOpenNextSet}
                    />
                  </div>
                </Stack>
              ) : (
                <Stack gap="sm" align="center" className="text-center">
                  <Muted>未設定</Muted>
                  <Button variant="secondary" size="sm" onClick={onSelectNext}>
                    次の献立を選ぶ
                  </Button>
                </Stack>
              )}
          </Stack>
        </Stack>
      </main>
    </ScreenContainer>
  )
}
