import { useEffect, useMemo, useState } from "react"
import {
  LayoutGrid,
  Plus,
  RefreshCcw,
  ShoppingBasket,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type RecipeCard = {
  id: string
  title: string
  tags: string[]
  cooked?: boolean
}

type MealSet = {
  id: string
  name: string
  description: string
  total: number
  cards: RecipeCard[]
}

type AppState = {
  currentSet: MealSet | null
  nextSet: MealSet | null
  shoppingCount: number
  mySets: MealSet[]
  publicSets: MealSet[]
}

const STORAGE_KEY = "kondate-v2-state"

const defaultState: AppState = {
  currentSet: {
    id: "set-1",
    name: "平日シンプル",
    description: "",
    total: 5,
    cards: [
      { id: "r1", title: "鶏照り焼き定食", tags: ["和食", "定番"] },
      { id: "r2", title: "やさしい和食セット", tags: ["和食", "ヘルシー"] },
      {
        id: "r3",
        title: "彩り野菜丼",
        tags: ["丼", "野菜たっぷり"],
        cooked: true,
      },
    ],
  },
  nextSet: {
    id: "set-2",
    name: "週末のごちそうセット",
    description: "",
    total: 5,
    cards: [],
  },
  shoppingCount: 5,
  mySets: [
    {
      id: "set-1",
      name: "平日シンプル",
      description: "忙しい日のための定番",
      total: 5,
      cards: [],
    },
    {
      id: "set-2",
      name: "野菜たっぷり",
      description: "野菜をしっかり食べたい週",
      total: 6,
      cards: [],
    },
  ],
  publicSets: [
    {
      id: "set-3",
      name: "料理家の週末セット",
      description: "作り置きもしやすい構成",
      total: 5,
      cards: [],
    },
    {
      id: "set-4",
      name: "季節のごちそう",
      description: "旬を楽しむメニュー",
      total: 4,
      cards: [],
    },
  ],
}

const defaultCardTags = new Map(
  defaultState.currentSet?.cards.map((card) => [card.id, card.tags]) ?? []
)

const normalizeCards = (cards?: RecipeCard[] | null) =>
  Array.isArray(cards)
    ? cards.map((card) => ({
        id: card.id,
        title: card.title,
        tags: Array.isArray(card.tags)
          ? card.tags
          : defaultCardTags.get(card.id) ?? [],
        cooked: card.cooked,
      }))
    : []

const normalizeState = (raw: AppState | null): AppState => {
  if (!raw) return defaultState
  return {
    ...defaultState,
    ...raw,
    currentSet: raw.currentSet
      ? {
          ...raw.currentSet,
          cards: normalizeCards(raw.currentSet.cards),
        }
      : defaultState.currentSet,
    nextSet: raw.nextSet
      ? {
          ...raw.nextSet,
          description: raw.nextSet.description ?? "",
        }
      : defaultState.nextSet,
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<
    "kondate" | "book" | "catalog" | "mypage"
  >("kondate")
  const [screen, setScreen] = useState<"kondate" | "set-select">("kondate")
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return normalizeState(JSON.parse(saved) as AppState)
      } catch {
        return defaultState
      }
    }
    return defaultState
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const currentSet = state.currentSet
  const nextSet = state.nextSet
  const shoppingCount = state.shoppingCount
  const isEmpty = useMemo(() => !currentSet, [currentSet])

  const handleSelectSet = (set: MealSet) => {
    setState((prev) => ({
      ...prev,
      currentSet: {
        ...set,
        description: "",
        cards: prev.currentSet?.cards ?? defaultState.currentSet?.cards ?? [],
      },
    }))
    setScreen("kondate")
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh w-full flex-col bg-background">
        {screen === "kondate" ? (
          <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-2 pb-3 pt-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tracking-wide text-foreground">
                    こんだてLoop
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 border-border/60 px-2 text-[11px] text-muted-foreground"
                  >
                    使い方
                  </Button>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <span className="material-icons-round text-[24px] leading-none">
                    notifications
                  </span>
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <span className="material-icons-round text-[24px] leading-none">
                    kitchen
                  </span>
                </Button>
              </div>
            </div>
          </header>
        ) : (
          <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-2 pb-3 pt-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setScreen("kondate")}
              >
                <span className="material-icons-round text-[24px] leading-none">
                  arrow_back
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tracking-wide text-foreground">
                    こんだてLoop
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 border-border/60 px-2 text-[11px] text-muted-foreground"
                  >
                    使い方
                  </Button>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <span className="material-icons-round text-[24px] leading-none">
                    notifications
                  </span>
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <span className="material-icons-round text-[24px] leading-none">
                    kitchen
                  </span>
                </Button>
              </div>
            </div>
          </header>
        )}

        {screen === "kondate" ? (
          <main className="flex-1 space-y-5 px-4 pb-[calc(72px+env(safe-area-inset-bottom))] pt-3">
            <div className="space-y-3">
              <h1 className="text-xl font-semibold">献立表</h1>
              {currentSet && shoppingCount > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 font-semibold shadow-sm"
                >
                  <ShoppingBasket className="h-4 w-4" />
                  買い物リスト
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full bg-primary-foreground px-2 text-xs text-primary"
                  >
                    {shoppingCount}
                  </Badge>
                </Button>
              )}
            </div>
            {activeTab !== "kondate" && (
              <Card className="border-dashed bg-muted/50">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  この画面は準備中です。
                </CardContent>
              </Card>
            )}

            {activeTab === "kondate" && (
              <>
                {currentSet && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground/70">
                        {currentSet.name}
                      </p>
                      <span className="text-sm text-foreground/70">
                        全{currentSet.total}品
                      </span>
                    </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-sm text-primary/70 hover:text-primary"
                        onClick={() =>
                          setState((prev) => ({ ...prev, currentSet: null }))
                        }
                      >
                        リセット
                      </Button>
                    </div>

                  <div className="-mx-4">
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 px-4 pb-3">
                        {currentSet.cards.map((card) => (
                          <div
                            key={card.id}
                            className={cn(
                              "min-w-[140px] overflow-hidden rounded-sm bg-background ring-1 ring-border/50",
                              card.cooked && "text-muted-foreground opacity-80"
                            )}
                          >
                            <div
                              className={cn(
                                "h-24 w-full border-b border-border/40 bg-gradient-to-br from-[#f7e7da] to-[#f2d7c7]",
                                card.cooked && "grayscale opacity-60"
                              )}
                            />
                            <div className="space-y-1.5 p-3">
                              {card.cooked && (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                                >
                                  作った
                                </Badge>
                              )}
                              <p className="text-base font-semibold">
                                {card.title}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {card.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs text-foreground/65"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full border-2 border-primary text-primary hover:bg-accent"
                        onClick={() => setScreen("set-select")}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        セットを変える
                      </Button>
                    </div>
                  </section>
                )}

                {currentSet && nextSet && (
                  <div className="my-2 h-px bg-border/40" />
                )}

                {isEmpty && (
                  <div className="space-y-3 rounded-xl border border-dashed bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                    <LayoutGrid className="mx-auto h-6 w-6 text-muted-foreground/70" />
                    <p>献立がありません</p>
                    <p className="text-xs">セットを選択してください</p>
                    <Button
                      variant="outline"
                      onClick={() => setScreen("set-select")}
                    >
                      セットを選ぶ
                    </Button>
                  </div>
                )}

                {nextSet && (
                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground/70">
                        次の献立
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-sm text-primary/70 hover:text-primary"
                          onClick={() => setScreen("set-select")}
                        >
                          変更
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-sm text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setState((prev) => ({ ...prev, nextSet: null }))
                          }
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/70 px-3 py-2.5">
                      <p className="text-base font-semibold text-foreground">
                        {nextSet.name}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        全{nextSet.total}品
                      </span>
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        ) : (
          <main className="flex-1 space-y-4 px-4 pb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">セット選択</h1>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <Tabs defaultValue="my">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my">レシピ帳</TabsTrigger>
                <TabsTrigger value="public">レシピカタログ</TabsTrigger>
              </TabsList>
              <TabsContent value="my" className="space-y-3">
                {state.mySets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSelectSet(set)}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#f7e7da] to-[#f2d7c7]" />
                      <CardContent className="space-y-1 p-4">
                        <p className="text-sm font-semibold">{set.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {set.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          全{set.total}品
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}

                <Card className="border-dashed bg-muted/50">
                  <CardContent className="space-y-3 p-4 text-sm">
                    <p className="text-muted-foreground">
                      好きなレシピでセットを作る？
                    </p>
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      新しいセットを作る
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="public" className="space-y-3">
                {state.publicSets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSelectSet(set)}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#f7e7da] to-[#f2d7c7]" />
                      <CardContent className="space-y-1 p-4">
                        <p className="text-sm font-semibold">{set.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {set.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>全{set.total}品</span>
                          <Badge variant="outline" className="text-[10px]">
                            人気
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </main>
        )}

        {screen === "kondate" && (
          <nav className="fixed bottom-0 left-0 z-10 h-[calc(64px+env(safe-area-inset-bottom))] w-full border-t border-border bg-background shadow-[0_-2px_10px_hsl(var(--border)/0.6)]">
            <div className="flex h-full items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10")}
                onClick={() => setActiveTab("kondate")}
              >
                <span className="material-icons-round text-[24px] leading-none">
                  calendar_month
                </span>
                <span className="sr-only">献立表</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10")}
                onClick={() => setActiveTab("book")}
              >
                <span className="material-icons-round text-[24px] leading-none">
                  menu_book
                </span>
                <span className="sr-only">レシピ帳</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10")}
                onClick={() => setActiveTab("catalog")}
              >
                <span className="material-icons-round text-[24px] leading-none">
                  storefront
                </span>
                <span className="sr-only">レシピカタログ</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10")}
                onClick={() => setActiveTab("mypage")}
              >
                <span className="material-icons-round text-[24px] leading-none">
                  account_circle
                </span>
                <span className="sr-only">マイページ</span>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}

export default App
