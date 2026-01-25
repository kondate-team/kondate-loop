import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  BookOpen,
  CalendarDays,
  Refrigerator,
  ShoppingBasket,
  Store,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type RecipeCard = {
  id: string
  title: string
  category: string
  time: string
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
}

const STORAGE_KEY = "kondate-v2-state"

const defaultState: AppState = {
  currentSet: {
    id: "set-1",
    name: "平日シンプル",
    description: "今日の手札",
    total: 5,
    cards: [
      { id: "r1", title: "鶏の照り焼き", category: "主菜", time: "20分" },
      { id: "r2", title: "豆腐の味噌汁", category: "汁物", time: "10分" },
      {
        id: "r3",
        title: "温野菜サラダ",
        category: "副菜",
        time: "15分",
        cooked: true,
      },
    ],
  },
  nextSet: {
    id: "set-2",
    name: "週末のごちそうセット",
    description: "次に回すセット",
    total: 5,
    cards: [],
  },
  shoppingCount: 5,
}

function App() {
  const [activeTab, setActiveTab] = useState<
    "kondate" | "book" | "catalog" | "mypage"
  >("kondate")
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as AppState
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

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_20%_0%,_#fff2e4_0%,_transparent_60%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[375px] flex-col bg-background">
        <header className="flex items-center justify-between px-4 pb-2 pt-5">
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">
              kondate loop
            </p>
            <p className="text-xs text-muted-foreground">献立表</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              使い方
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Refrigerator className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-4 px-4 pb-[calc(72px+env(safe-area-inset-bottom))]">
          <h1 className="text-lg font-semibold">献立表</h1>

          {activeTab !== "kondate" && (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="p-6 text-sm text-muted-foreground">
                この画面は準備中です。
              </CardContent>
            </Card>
          )}

          {activeTab === "kondate" && (
            <>
              <Card className="overflow-hidden">
                <CardHeader className="space-y-1 p-4">
                  <CardTitle className="text-base">現在のセット</CardTitle>
                  <CardDescription>
                    {currentSet?.description ?? "今日の手札"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-0">
                  {currentSet && (
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {currentSet.name}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        リセット
                      </Button>
                    </div>
                  )}

                  {currentSet && (
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 pb-3">
                        {currentSet.cards.map((card) => (
                          <div
                            key={card.id}
                            className={cn(
                              "min-w-[148px] space-y-2 rounded-xl border bg-secondary/60 p-3",
                              card.cooked &&
                                "border-dashed text-muted-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "aspect-[4/5] w-full rounded-lg border border-border bg-gradient-to-br from-[#f7e7da] to-[#f2d7c7]",
                                card.cooked && "grayscale opacity-60"
                              )}
                            />
                            <div className="space-y-1">
                              {card.cooked && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  作った
                                </Badge>
                              )}
                              <p className="text-sm font-semibold">
                                {card.title}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{card.category}</span>
                                <span>{card.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  )}

                  {isEmpty && (
                    <div className="rounded-xl border border-dashed bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                      献立がありません。セットを選択してください。
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap items-center gap-2 p-4 pt-4">
                  <Button className="gap-2">
                    <ShoppingBasket className="h-4 w-4" />
                    買い物リスト
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {shoppingCount}品
                  </Badge>
                  <Button variant="outline">セットを変える</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="space-y-1 p-4">
                  <CardTitle className="text-base">次の献立</CardTitle>
                  <CardDescription>次に回すセット</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {nextSet && (
                    <div className="space-y-3 rounded-xl border bg-secondary/60 p-3">
                      <div className="aspect-[16/9] w-full rounded-lg border border-border bg-gradient-to-br from-[#f7e7da] to-[#f2d7c7]" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{nextSet.name}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>全{nextSet.total}品</span>
                          <span>目安: 2〜3日</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-[375px] -translate-x-1/2 border-t border-border bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", activeTab === "kondate" && "text-primary")}
              onClick={() => setActiveTab("kondate")}
            >
              <CalendarDays className="h-5 w-5" />
              <span className="sr-only">献立表</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", activeTab === "book" && "text-primary")}
              onClick={() => setActiveTab("book")}
            >
              <BookOpen className="h-5 w-5" />
              <span className="sr-only">レシピ帳</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10",
                activeTab === "catalog" && "text-primary"
              )}
              onClick={() => setActiveTab("catalog")}
            >
              <Store className="h-5 w-5" />
              <span className="sr-only">レシピカタログ</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10", activeTab === "mypage" && "text-primary")}
              onClick={() => setActiveTab("mypage")}
            >
              <UserRound className="h-5 w-5" />
              <span className="sr-only">マイページ</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default App
