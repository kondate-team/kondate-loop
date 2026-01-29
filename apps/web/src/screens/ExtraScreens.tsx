import * as React from "react"
import { ChevronRight, CheckCircle2, Calendar, CreditCard, UserRound, Crown, ChevronLeft, Search, Apple } from "lucide-react"

import { ScreenContainer } from "@/components/layout/ScreenContainer"
import { HeaderBar } from "@/components/layout/HeaderBar"
import { HeaderActions } from "@/components/layout/HeaderActions"
import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Body, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import { RecipeSetCard } from "@/components/domain/RecipeSetCard"
import { RecipeCard } from "@/components/domain/RecipeCard"
import { EmptyState } from "@/components/domain/EmptyState"
import { cn } from "@/lib/utils"
import { defaultUnitOptions } from "@/data/unitOptions"

interface SubScreenProps {
  onBack?: () => void
}

const normalizeNumberInput = (value: string) =>
  value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")

export function OnboardingScreen({ onStart }: { onStart?: () => void }) {
  return (
    <ScreenContainer className="flex items-center justify-center">
      <Surface tone="card" density="comfy" elevation="raised" className="mx-5 max-w-sm">
        <Stack gap="md" align="center" className="text-center">
          <span className="text-3xl">🍽️</span>
          <H2>こんだてLoop</H2>
          <Body>
            レシピをセットにして、<br />リストから選んで作る。<br />それだけ。
          </Body>
          <Stack gap="sm">
            <Cluster gap="sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">1</span>
              <Body>セットを選ぶ</Body>
            </Cluster>
            <Cluster gap="sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">2</span>
              <Body>買い物する</Body>
            </Cluster>
            <Cluster gap="sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">3</span>
              <Body>リストから選んで作る</Body>
            </Cluster>
          </Stack>
          <Button className="rounded-full" onClick={onStart}>
            はじめる
          </Button>
        </Stack>
      </Surface>
    </ScreenContainer>
  )
}

export function AuthLandingScreen({
  onLogin,
  onSignup,
}: {
  onLogin?: () => void
  onSignup?: () => void
}) {
  return (
    <ScreenContainer className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-accent/30 to-background">
      <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-muted/40 blur-3xl" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Stack gap="lg" align="center" className="text-center">
            <Stack gap="sm" align="center">
              <span className="text-3xl">🍽️</span>
              <H2>こんだてループ</H2>
              <Body className="text-sm text-muted-foreground">
                レシピを集めて、献立を回す。<br />
                今日のごはんが迷わない。
              </Body>
            </Stack>
            <Stack gap="sm" className="w-full">
              <Button className="w-full rounded-full" onClick={onSignup}>
                新規登録
              </Button>
              <Button variant="outline" className="w-full rounded-full" onClick={onLogin}>
                ログイン
              </Button>
            </Stack>
          </Stack>
        </div>
      </div>
    </ScreenContainer>
  )
}

export function LoginScreen({
  onSubmit,
  onBack,
  onOpenSignup,
}: {
  onSubmit?: (email: string, password: string) => void
  onBack?: () => void
  onOpenSignup?: () => void
}) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  return (
    <ScreenContainer className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background">
      <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-20 right-0 h-52 w-52 rounded-full bg-muted/40 blur-3xl" />
      <div className="relative z-10 px-6 pb-8 pt-6">
        <Cluster justify="between" align="center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
            aria-label="戻る"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">ログイン</span>
          <span className="h-9 w-9" />
        </Cluster>
        <Stack gap="sm" className="mt-6 items-center text-center">
          <span className="text-3xl">🍽️</span>
          <H2>こんだてループ</H2>
          <Body className="text-sm text-muted-foreground">
            おかえりなさい。<br />
            いつもの献立から始めましょう。
          </Body>
        </Stack>
        <Surface tone="card" density="comfy" className="mt-6 rounded-3xl bg-card/90">
          <Stack gap="sm">
            <input
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-base"
              placeholder="メールアドレス"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              inputMode="email"
            />
            <input
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-base"
              placeholder="パスワード"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button className="w-full rounded-full" onClick={() => onSubmit?.(email, password)}>
              ログイン
            </Button>
          </Stack>
        </Surface>
        <Cluster justify="center" className="mt-4">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onOpenSignup}>
            初めての方はこちら
          </Button>
        </Cluster>
      </div>
    </ScreenContainer>
  )
}

export function SignupScreen({
  onSubmit,
  onBack,
  onOpenLogin,
}: {
  onSubmit?: (name: string, email: string, password: string) => void
  onBack?: () => void
  onOpenLogin?: () => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  return (
    <ScreenContainer className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background">
      <div className="absolute -right-12 top-10 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-52 w-52 rounded-full bg-muted/40 blur-3xl" />
      <div className="relative z-10 px-6 pb-8 pt-6">
        <Cluster justify="between" align="center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
            aria-label="戻る"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">新規登録</span>
          <span className="h-9 w-9" />
        </Cluster>
        <Stack gap="sm" className="mt-6 items-center text-center">
          <span className="text-3xl">🍽️</span>
          <H2>こんだてループ</H2>
          <Body className="text-sm text-muted-foreground">
            今日から、献立の迷いをなくしましょう。
          </Body>
        </Stack>
        <Surface tone="card" density="comfy" className="mt-6 rounded-3xl bg-card/90">
          <Stack gap="sm">
            <input
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-base"
              placeholder="表示名"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-base"
              placeholder="メールアドレス"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              inputMode="email"
            />
            <input
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-base"
              placeholder="パスワード"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button className="w-full rounded-full" onClick={() => onSubmit?.(name, email, password)}>
              登録してはじめる
            </Button>
            <Muted className="text-xs text-muted-foreground">
              登録すると利用規約とプライバシーポリシーに同意したものとみなします。
            </Muted>
          </Stack>
        </Surface>
        <Cluster justify="center" className="mt-4">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onOpenLogin}>
            すでにアカウントをお持ちの方
          </Button>
        </Cluster>
      </div>
    </ScreenContainer>
  )
}

export function AuthErrorScreen({
  title,
  message,
  onBack,
}: {
  title?: string
  message?: string
  onBack?: () => void
}) {
  return (
    <ScreenContainer className="flex items-center justify-center">
      <Surface tone="card" density="comfy" elevation="raised" className="mx-6 w-full max-w-sm rounded-3xl">
        <Stack gap="sm" align="center" className="text-center">
          <span className="text-2xl">⚠️</span>
          <H2 className="text-lg">{title ?? "エラーが発生しました"}</H2>
          <Body className="text-sm text-muted-foreground">
            {message ?? "入力内容を確認して、もう一度お試しください。"}
          </Body>
          <Button className="w-full rounded-full" onClick={onBack}>
            戻る
          </Button>
        </Stack>
      </Surface>
    </ScreenContainer>
  )
}

export function SetSelectScreen({
  sets,
  publicSets,
  recipes,
  fridgeItems,
  selectingFor,
  membershipAvailable,
  onSelect,
  onSelectLocked,
  onCreateSet,
  onOpenRecipeBook,
  onOpenRecipeCatalog,
  onBack,
}: {
  sets: {
    id: string
    title: string
    count: number
    recipeIds?: string[]
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
  }[]
  publicSets: {
    id: string
    title: string
    count: number
    recipeIds?: string[]
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
  }[]
  recipes: {
    id: string
    ingredients?: { name: string }[]
  }[]
  fridgeItems: { id: string; name: string; amount: number; unit: string }[]
  selectingFor?: "current" | "next"
  membershipAvailable?: boolean
  onSelect?: (setItem: {
    id: string
    title: string
    count: number
    recipeIds?: string[]
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
  }, source: "book" | "catalog") => void
  onSelectLocked?: (message: string) => void
  onCreateSet?: () => void
  onOpenRecipeBook?: () => void
  onOpenRecipeCatalog?: () => void
  onBack?: () => void
}) {
  const [tab, setTab] = React.useState<"book" | "catalog">("book")
  const membershipEnabled = membershipAvailable ?? false

  const getAccessInfo = (
    badges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
  ) => {
    const labels = badges?.map((badge) => badge.label) ?? []
    const hasPrice = labels.some((label) => label.includes("¥"))
    const hasMembership = labels.includes("限定")
    const isPurchased = labels.includes("購入済み")
    const isFree = labels.includes("フリー")
    const accessible = isFree || isPurchased || (hasMembership && membershipEnabled)
    return {
      hasPrice,
      hasMembership,
      accessible,
    }
  }

  const handleSelect = (setItem: typeof sets[number], source: "book" | "catalog") => {
    if (source === "catalog") {
      const access = getAccessInfo(setItem.statusBadges)
      if (!access.accessible) {
        const message =
          access.hasMembership && !membershipEnabled
            ? "メンバー限定は準備中です"
            : "購入すると使えます"
        onSelectLocked?.(message)
        return
      }
    }
    onSelect?.(setItem, source)
  }

  const recipeMap = React.useMemo(
    () => new Map(recipes.map((recipe) => [recipe.id, recipe])),
    [recipes]
  )
  const fridgeNameSet = React.useMemo(
    () => new Set(fridgeItems.map((item) => item.name)),
    [fridgeItems]
  )

  const recommendations = React.useMemo(() => {
    if (!fridgeItems.length) return []
    const sources: { set: typeof sets[number]; source: "book" | "catalog" }[] = [
      ...sets.map((set) => ({ set, source: "book" as const })),
      ...publicSets.map((set) => ({ set, source: "catalog" as const })),
    ]
    return sources
      .map(({ set, source }) => {
        const ingredients = new Set<string>()
        ;(set.recipeIds ?? []).forEach((id) => {
          const recipe = recipeMap.get(id)
          recipe?.ingredients?.forEach((ing) => ingredients.add(ing.name))
        })
        const matched = Array.from(ingredients).filter((name) => fridgeNameSet.has(name))
        return {
          set,
          source,
          matchCount: matched.length,
          totalCount: ingredients.size,
        }
      })
      .filter((item) => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 3)
  }, [sets, publicSets, recipeMap, fridgeNameSet, fridgeItems.length])
  const bookHighlights = React.useMemo(() => sets.slice(0, 4), [sets])
  const catalogHighlights = React.useMemo(() => publicSets.slice(0, 3), [publicSets])

  const fridgeSummary = React.useMemo(() => {
    if (!fridgeItems.length) return ""
    const names = fridgeItems.map((item) => item.name)
    const head = names.slice(0, 3).join("・")
    return names.length > 3 ? `冷蔵庫: ${head} ほか` : `冷蔵庫: ${head}`
  }, [fridgeItems])

  const title = "レシピセットを選ぶ"
  const recommendationTitle =
    selectingFor === "next" ? "次の献立におすすめ" : "冷蔵庫の食材で作れるセット"

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title={title} onBack={onBack} />
      <main className="flex h-[calc(100vh-120px)] flex-col overflow-y-auto pb-6 pt-4">
        <Stack gap="md" className="flex-1 min-h-0">
          <div className="px-5">
            <Button variant="secondary" className="w-full rounded-full" onClick={onCreateSet}>
              セットを新規で作る
            </Button>
          </div>

          {recommendations.length ? (
            <div className="px-5">
              <Stack gap="sm">
                <Stack gap="xs">
                  <H3 className="text-base">{recommendationTitle}</H3>
                  {fridgeSummary ? <Muted className="text-xs">{fridgeSummary}</Muted> : null}
                </Stack>
                <div className="no-scrollbar overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {recommendations.map((item) => (
                      <div key={`${item.source}-${item.set.id}`} className="w-[140px]">
                        <RecipeSetCard
                          title={item.set.title}
                          count={item.set.count}
                          author={item.set.author}
                          tags={item.set.tags}
                          statusBadges={item.set.statusBadges}
                          imageUrl={item.set.imageUrl}
                          size="selectable"
                          onClick={() => handleSelect(item.set, item.source)}
                        />
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          使える食材 {item.matchCount}/{item.totalCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Stack>
            </div>
          ) : null}

          <div className="px-5">
            <div className="mx-auto w-full max-w-sm">
              <div className="grid w-full grid-cols-2 rounded-full bg-muted/40 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full rounded-full",
                    tab === "book" ? "bg-accent text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setTab("book")}
                >
                  レシピ帳
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full rounded-full",
                    tab === "catalog" ? "bg-accent text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setTab("catalog")}
                >
                  カタログ
                </Button>
              </div>
            </div>
          </div>

          {tab === "book" ? (
            <div className="flex-1 pb-6">
              <Stack gap="md" className="px-5">
                <Stack gap="sm">
                  <H3 className="text-base">レシピ帳のおすすめ</H3>
                  {bookHighlights.length ? (
                    <div className="no-scrollbar overflow-x-auto">
                      <div className="flex gap-3 pb-2">
                        {bookHighlights.map((set) => (
                          <div key={set.id} className="w-[140px]">
                            <RecipeSetCard
                              title={set.title}
                              count={set.count}
                              author={set.author}
                              tags={set.tags}
                              statusBadges={set.statusBadges}
                              imageUrl={set.imageUrl}
                              size="selectable"
                              onClick={() => handleSelect(set, "book")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState title="おすすめがありません" description="セットを作成してみてください" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-full text-muted-foreground hover:text-foreground"
                    onClick={onOpenRecipeBook}
                  >
                    レシピ帳をもっと見る
                  </Button>
                </Stack>
              </Stack>
            </div>
          ) : (
            <div className="flex-1 pb-6">
              <Stack gap="md" className="px-5">
                <Stack gap="sm">
                  <H3 className="text-base">カタログのおすすめ</H3>
                  {catalogHighlights.length ? (
                    <div className="no-scrollbar overflow-x-auto">
                      <div className="flex gap-3 pb-2">
                        {catalogHighlights.map((set) => (
                          <div key={set.id} className="w-[140px]">
                            <RecipeSetCard
                              title={set.title}
                              count={set.count}
                              author={set.author}
                              tags={set.tags}
                              statusBadges={set.statusBadges}
                              imageUrl={set.imageUrl}
                              size="selectable"
                              onClick={() => handleSelect(set, "catalog")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState title="おすすめがありません" description="新着をお待ちください" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-full text-muted-foreground hover:text-foreground"
                    onClick={onOpenRecipeCatalog}
                  >
                    レシピカタログをもっと見る
                  </Button>
                </Stack>
              </Stack>
            </div>
          )}
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function SetCreateScreen({
  recipes,
  templates,
  initialSet,
  onBack,
  onSave,
}: {
  recipes: {
    id: string
    title: string
    author?: string
    tags?: string[]
    imageUrl?: string
    cookTimeMinutes?: number
  }[]
  templates?: {
    id: string
    title: string
    count: number
    recipeIds?: string[]
    author?: string
    description?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    source?: "catalog"
  }[]
  initialSet?: {
    title?: string
    author?: string
    description?: string
    recipeIds?: string[]
    imageUrl?: string
  }
  onBack?: () => void
  onSave?: (setItem: {
    id: string
    title: string
    count: number
    recipeIds: string[]
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    savedCount?: number
    createdAt?: string
  }) => void
}) {
  const [coverType, setCoverType] = React.useState<"image" | "icon">("icon")
  const [setName, setSetName] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [selectorOpen, setSelectorOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [coverImageUrl, setCoverImageUrl] = React.useState("")
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const availableRecipeIds = React.useMemo(
    () => new Set(recipes.map((recipe) => recipe.id)),
    [recipes]
  )
  const availableTemplates = templates ?? []

  React.useEffect(() => {
    if (!initialSet) {
      setCoverType("icon")
      setSetName("")
      setAuthor("")
      setDescription("")
      setSelectedIds([])
      setCoverImageUrl("")
      setQuery("")
      setSelectorOpen(false)
      return
    }
    setSetName(initialSet.title ?? "")
    setAuthor(initialSet.author ?? "")
    setDescription(initialSet.description ?? "")
    setSelectedIds((initialSet.recipeIds ?? []).filter((id) => availableRecipeIds.has(id)))
    setCoverImageUrl(initialSet.imageUrl ?? "")
    setCoverType(initialSet.imageUrl ? "image" : "icon")
    setQuery("")
    setSelectorOpen(false)
  }, [initialSet, availableRecipeIds])

  const applyTemplate = (template: (typeof availableTemplates)[number]) => {
    const isCatalog = template.source === "catalog"
    const trimmedTitle = template.title ?? ""
    const nextName = trimmedTitle
      ? isCatalog
        ? `${trimmedTitle}のコピー`
        : trimmedTitle
      : ""
    setSetName(nextName)
    setAuthor(isCatalog ? "" : template.author ?? "")
    setDescription(isCatalog ? "" : template.description ?? "")
    setSelectedIds((template.recipeIds ?? []).filter((id) => availableRecipeIds.has(id)))
    setCoverImageUrl(template.imageUrl ?? "")
    setCoverType(template.imageUrl ? "image" : "icon")
    setTemplateOpen(false)
  }

  const filteredRecipes = recipes.filter((recipe) => {
    if (!query.trim()) return true
    const haystack = [recipe.title, recipe.author, ...(recipe.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const selectedRecipes = recipes.filter((recipe) => selectedIds.includes(recipe.id))
  const canSave = setName.trim().length > 0 && selectedIds.length > 0 && selectedIds.length <= 7

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= 7) return prev
      return [...prev, id]
    })
  }

  const handleSaveSet = () => {
    if (!canSave) return
    const trimmedName = setName.trim()
    const timeTags = new Set(["15分以内", "30分以内", "45分以内"])
    const derivedTags = Array.from(
      new Set(
        selectedRecipes
          .flatMap((recipe) => recipe.tags ?? [])
          .filter((tag) => !timeTags.has(tag))
      )
    ).slice(0, 4)
    onSave?.({
      id: `s-${Date.now()}`,
      title: trimmedName,
      count: selectedIds.length,
      recipeIds: selectedIds,
      author: author.trim() || "あなた",
      tags: derivedTags,
      statusBadges: [{ label: "フリー", variant: "free" }],
      imageUrl: coverType === "image" ? coverImageUrl.trim() || undefined : undefined,
      savedCount: 0,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="セットを作る" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <Surface tone="section" density="comfy" className="border-transparent">
            <Button
              variant="secondary"
              size="sm"
              className="w-full rounded-full"
              disabled={!availableTemplates.length}
              onClick={() => setTemplateOpen(true)}
            >
              既存のセットから編集
            </Button>
          </Surface>
          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <H3 className="text-base">セットの名前</H3>
              <input
                className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                placeholder="例: 定番おうちごはん"
                value={setName}
                onChange={(event) => setSetName(event.target.value)}
              />
              <H3 className="text-base">作成者（任意）</H3>
              <input
                className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                placeholder="例: あなた / 田中シェフ / @someone"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
              <Muted className="text-xs">
                外部共有時の出典に使います。自分・料理家・フリーワードから選べます。
              </Muted>
              <H3 className="text-base">セットの概要（任意）</H3>
              <textarea
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                rows={3}
                placeholder="例: 平日向けの時短5日セット"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Stack>
          </Surface>
          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <H3 className="text-base">カバー</H3>
              <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
                <Cluster gap="sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      coverType === "image"
                        ? "rounded-full bg-accent text-foreground"
                        : "rounded-full text-muted-foreground"
                    }
                    onClick={() => setCoverType("image")}
                  >
                    画像
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      coverType === "icon"
                        ? "rounded-full bg-accent text-foreground"
                        : "rounded-full text-muted-foreground"
                    }
                    onClick={() => setCoverType("icon")}
                  >
                    アイコン
                  </Button>
                </Cluster>
              </div>
              {coverType === "image" ? (
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  placeholder="画像URLを入力"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                />
              ) : (
                <Cluster gap="sm">
                  {["🍽️", "🍳", "🥘", "🫕"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg"
                    >
                      {icon}
                    </button>
                  ))}
                </Cluster>
              )}
            </Stack>
          </Surface>
          <Stack gap="md">
            <H3 className="text-base">レシピを選択（1〜7品）</H3>
            <Surface tone="card" density="comfy" className="rounded-2xl">
              {selectedRecipes.length ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedRecipes.map((recipe) => (
                    <div key={recipe.id} className="w-[140px] flex-shrink-0">
                      <RecipeCard
                        title={recipe.title}
                        author={recipe.author}
                        tags={recipe.tags}
                        imageUrl={recipe.imageUrl}
                        variant="selectable"
                        onClick={() => toggleSelect(recipe.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Body className="text-sm text-muted-foreground">まだ選んでないよ</Body>
              )}
              <div className="pt-3">
                <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setSelectorOpen(true)}>
                  レシピを追加
                </Button>
              </div>
            </Surface>
            <Button className="rounded-full" disabled={!canSave} onClick={handleSaveSet}>
              このセットを保存
            </Button>
          </Stack>
        </Stack>
      </main>
      {selectorOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="none" elevation="raised" className="w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">レシピを選択</H2>
              <button
                type="button"
                onClick={() => setSelectorOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <Stack gap="md">
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
                  <Search className="h-4 w-4 text-muted-foreground/70" />
                  <input
                    type="text"
                    placeholder="レシピを探す"
                    className="w-full bg-transparent text-sm outline-none"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 justify-items-center gap-3">
                  {filteredRecipes.map((recipe) => {
                    const selected = selectedIds.includes(recipe.id)
                    return (
                      <div
                        key={recipe.id}
                        className={cn(
                          "w-[140px] rounded-sm",
                          selected ? "ring-2 ring-primary/60" : ""
                        )}
                      >
                        <RecipeCard
                          title={recipe.title}
                          author={recipe.author}
                          tags={recipe.tags}
                          imageUrl={recipe.imageUrl}
                          variant="selectable"
                          onClick={() => toggleSelect(recipe.id)}
                        />
                      </div>
                    )
                  })}
                </div>
              </Stack>
            </div>
            <div className="border-t border-border px-5 py-4">
              <Cluster justify="between" align="center">
                <Muted className="text-xs">{selectedIds.length}品選択中</Muted>
                <Button variant="secondary" size="sm" onClick={() => setSelectorOpen(false)}>
                  選択を反映
                </Button>
              </Cluster>
            </div>
          </Surface>
        </div>
      ) : null}
      {templateOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface
            tone="card"
            density="none"
            elevation="raised"
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">既存セットから選択</H2>
              <button
                type="button"
                onClick={() => setTemplateOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
              {availableTemplates.length ? (
                <div className="grid grid-cols-2 justify-items-center gap-3">
                  {availableTemplates.map((set) => (
                    <div key={set.id} className="w-[140px]">
                      <RecipeSetCard
                        title={set.title}
                        count={set.count}
                        author={set.author}
                        tags={set.tags}
                        statusBadges={set.statusBadges}
                        imageUrl={set.imageUrl}
                        size="selectable"
                        onClick={() => applyTemplate(set)}
                      />
                      {set.source === "catalog" ? (
                        <Muted className="mt-1 text-[10px]">コピーして作成</Muted>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="セットがありません" description="新規で作成できます" />
              )}
            </div>
          </Surface>
        </div>
      ) : null}
    </ScreenContainer>
  )
}

export function RecipeAddScreen({
  onBack,
  onSave,
}: SubScreenProps & {
  onSave?: (recipe: {
    id: string
    title: string
    author?: string
    sourceUrl?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    ingredients?: { name: string; amount: number; unit: string }[]
    cookTimeMinutes?: number
    savedCount?: number
    createdAt?: string
  }) => void
}) {
  const [coverType, setCoverType] = React.useState<"image" | "icon">("icon")
  const [title, setTitle] = React.useState("")
  const [servings, setServings] = React.useState("2人前")
  const [ingredientsText, setIngredientsText] = React.useState("")
  const [stepsText, setStepsText] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const [sourceUrl, setSourceUrl] = React.useState("")
  const [tagsText, setTagsText] = React.useState("")
  const [coverImageUrl, setCoverImageUrl] = React.useState("")
  const [importText, setImportText] = React.useState("")
  const [importError, setImportError] = React.useState<string | null>(null)

  const parseIngredients = (value: string) => {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/)
        if (parts.length >= 3) {
          const amount = Number(parts[1]) || 1
          return { name: parts[0], amount, unit: parts[2] }
        }
        if (parts.length === 2) {
          const amount = Number(parts[1]) || 1
          return { name: parts[0], amount, unit: "個" }
        }
        return { name: line, amount: 1, unit: "個" }
      })
  }

  const buildImportPreview = (value: string) => {
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    const urlLine = lines.find((line) => line.startsWith("http"))
    const cleanedLines = lines.filter((line) => line !== urlLine)
    const titleLine = cleanedLines[0] ?? "取り込みレシピ"
    const ingredientsIndex = cleanedLines.findIndex((line) => line.includes("材料"))
    const stepsIndex = cleanedLines.findIndex(
      (line) => line.includes("作り方") || line.includes("手順")
    )
    const ingredientsLines =
      ingredientsIndex >= 0
        ? cleanedLines.slice(
            ingredientsIndex + 1,
            stepsIndex > ingredientsIndex ? stepsIndex : undefined
          )
        : cleanedLines.slice(1, stepsIndex > 1 ? stepsIndex : undefined)
    const stepsLines =
      stepsIndex >= 0 ? cleanedLines.slice(stepsIndex + 1) : cleanedLines.slice(2)

    return {
      title: titleLine,
      ingredientsText: ingredientsLines.join("\n") || "材料 2人前",
      stepsText: stepsLines.join("\n") || "作り方をここに入力してください",
      sourceUrl: urlLine,
    }
  }

  const handleImport = () => {
    if (!importText.trim()) {
      setImportError("取り込みたいURLまたはテキストを入力してください。")
      return
    }
    setImportError(null)
    const preview = buildImportPreview(importText)
    setTitle(preview.title)
    setIngredientsText(preview.ingredientsText)
    setStepsText(preview.stepsText)
    if (preview.sourceUrl) {
      setSourceUrl(preview.sourceUrl)
    }
    if (preview.author) {
      setAuthor(preview.author)
    }
  }

  const handleSaveRecipe = () => {
    if (!title.trim()) return
    const tags = tagsText
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
    const ingredients = parseIngredients(ingredientsText)
    const timeTag = tags.find((tag) => tag.includes("分以内"))
    const parsedTime = timeTag ? Number(timeTag.replace(/[^0-9]/g, "")) : NaN
    const cookTimeMinutes = Number.isNaN(parsedTime) ? 30 : parsedTime
    const derivedTags = tags.length ? tags : servings.includes("人前") ? [servings] : []
    onSave?.({
      id: `r-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || "あなた",
      sourceUrl: sourceUrl.trim() || undefined,
      tags: derivedTags,
      statusBadges: [{ label: "フリー", variant: "free" }],
      imageUrl: coverType === "image" ? coverImageUrl.trim() || undefined : undefined,
      ingredients,
      cookTimeMinutes,
      savedCount: 0,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="レシピを追加" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <H3 className="text-base">URLまたはテキストから取り込み</H3>
              <textarea
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                rows={4}
                placeholder="レシピのURLやテキストを貼り付け"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
              />
              {importError ? (
                <Muted className="text-xs text-destructive">{importError}</Muted>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={handleImport}
              >
                反映する
              </Button>
            </Stack>
          </Surface>

          <div className="h-px bg-border/60" />

          <Stack gap="md">
            <H3 className="text-base">必須項目</H3>
            <Surface tone="card" density="comfy" className="rounded-xl">
              <Stack gap="sm">
                <label className="text-sm font-semibold text-foreground">
                  料理名 <span className="text-primary">*</span>
                </label>
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  placeholder="例: 豚の生姜焼き"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <label className="text-sm font-semibold text-foreground">
                  何人前 <span className="text-primary">*</span>
                </label>
                <select
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  value={servings}
                  onChange={(event) => setServings(event.target.value)}
                >
                  <option>2人前</option>
                  <option>3人前</option>
                  <option>4人前</option>
                </select>
                <label className="text-sm font-semibold text-foreground">
                  材料 <span className="text-primary">*</span>
                </label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                  rows={5}
                  placeholder="材料を入力"
                  value={ingredientsText}
                  onChange={(event) => setIngredientsText(event.target.value)}
                />
                <label className="text-sm font-semibold text-foreground">
                  作り方 <span className="text-primary">*</span>
                </label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                  rows={6}
                  placeholder="作り方を入力"
                  value={stepsText}
                  onChange={(event) => setStepsText(event.target.value)}
                />
              </Stack>
            </Surface>
          </Stack>

          <Stack gap="md">
            <H3 className="text-base">任意項目</H3>
            <Surface tone="card" density="comfy" className="rounded-xl">
              <Stack gap="sm">
                <label className="text-sm font-semibold text-muted-foreground">カバー</label>
                <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
                  <Cluster gap="sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        coverType === "image"
                          ? "rounded-full bg-accent text-foreground"
                          : "rounded-full text-muted-foreground"
                      }
                      onClick={() => setCoverType("image")}
                    >
                      画像
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        coverType === "icon"
                          ? "rounded-full bg-accent text-foreground"
                          : "rounded-full text-muted-foreground"
                      }
                      onClick={() => setCoverType("icon")}
                    >
                      アイコン
                    </Button>
                  </Cluster>
                </div>
                {coverType === "image" ? (
                  <input
                    className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                    placeholder="画像URLを入力"
                    value={coverImageUrl}
                    onChange={(event) => setCoverImageUrl(event.target.value)}
                  />
                ) : (
                  <Cluster gap="sm">
                    {["🍽️", "🍳", "🥗", "🍲"].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg"
                      >
                        {icon}
                      </button>
                    ))}
                  </Cluster>
                )}
                <label className="text-sm font-semibold text-muted-foreground">作成者</label>
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  placeholder="例: あなた / 田中シェフ / @someone"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                />
                <label className="text-sm font-semibold text-muted-foreground">出典元URL</label>
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                />
                <label className="text-sm font-semibold text-muted-foreground">タグ</label>
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  placeholder="例: 時短, 定番"
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                />
                <label className="text-sm font-semibold text-muted-foreground">中間素材</label>
                <textarea className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm" rows={3} placeholder="中間素材があれば入力" />
              </Stack>
            </Surface>
          </Stack>

          <Button className="rounded-full" onClick={handleSaveRecipe}>
            保存
          </Button>
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function ShoppingListScreen({
  items,
  onPurchase,
  onConfirm,
  onAddExtra,
  onRemoveExtra,
  onBack,
}: {
  items: {
    id: string
    name: string
    amount: number
    unit: string
    isExtra?: boolean
    checked?: boolean
  }[]
  onPurchase?: (id: string) => void
  onConfirm?: () => void
  onAddExtra?: (name: string, amount: number, unit: string) => void
  onRemoveExtra?: (id: string) => void
  onBack?: () => void
}) {
  const [extraName, setExtraName] = React.useState("")
  const [extraAmount, setExtraAmount] = React.useState("1")
  const [extraUnit, setExtraUnit] = React.useState("")
  const [unitOptions, setUnitOptions] = React.useState(() => defaultUnitOptions)
  const unitListId = React.useId()
  const sortedItems = [...items].sort((a, b) => {
    if (!!a.checked === !!b.checked) return 0
    return a.checked ? 1 : -1
  })
  const hasChecked = sortedItems.some((item) => item.checked)

  const handleAddExtra = () => {
    if (!extraName.trim()) return
    const amount = Number(extraAmount) || 1
    const unit = extraUnit.trim() || "個"
    onAddExtra?.(extraName.trim(), amount, unit)
    setUnitOptions((prev) => (prev.includes(unit) ? prev : [...prev, unit]))
    setExtraName("")
    setExtraAmount("1")
    setExtraUnit("")
  }

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="買い物リスト" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          {items.length ? (
            <>
              <H2 className="text-xl">買うもの</H2>
              <Stack gap="sm" className="shopping-list">
                {sortedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPurchase?.(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left",
                      item.checked ? "opacity-60" : ""
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border border-border text-transparent",
                        item.checked ? "border-emerald-300 bg-emerald-500 text-white" : ""
                      )}
                    >
                      ✓
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold text-foreground truncate",
                          item.checked ? "line-through" : ""
                        )}
                      >
                        {item.name}
                      </span>
                      {item.isExtra ? (
                        <span className="rounded-full bg-accent/50 px-2 text-[10px] text-accent-foreground">
                          追加
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.amount}
                        {item.unit}
                      </span>
                      {item.isExtra ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onRemoveExtra?.(item.id)
                          }}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                          aria-label="削除"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                  </button>
                ))}
              </Stack>
              <Cluster justify="end">
                <Button
                  variant="secondary"
                  className="rounded-full"
                  onClick={onConfirm}
                  disabled={!hasChecked}
                >
                  買い物完了！
                </Button>
              </Cluster>
            </>
          ) : (
            <EmptyState title="買うものはないよ" description="セットを選ぶと出てくるよ" />
          )}
          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <H3 className="text-base">他の食材を追加</H3>
              <div className="grid grid-cols-[minmax(0,1fr)_64px_64px_64px] gap-2">
                <input
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  placeholder="追加する食材"
                  value={extraName}
                  onChange={(event) => setExtraName(event.target.value)}
                />
                <input
                  className="rounded-md border border-border bg-card px-2 py-2 text-sm text-right"
                  value={extraAmount}
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  onChange={(event) => setExtraAmount(normalizeNumberInput(event.target.value))}
                />
                <input
                  className="rounded-md border border-border bg-card px-2 py-2 text-sm"
                  placeholder="単位"
                  value={extraUnit}
                  list={unitListId}
                  onChange={(event) => setExtraUnit(event.target.value)}
                />
                <datalist id={unitListId}>
                  {unitOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <Button size="sm" onClick={handleAddExtra}>
                  追加
                </Button>
              </div>
            </Stack>
          </Surface>
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function FridgeScreen({
  items,
  deletedItems,
  onAddItem,
  onDeleteItem,
  onBack,
}: {
  items: { id: string; name: string; amount: number; unit: string }[]
  deletedItems?: { id: string; name: string; amount: number; unit: string; deletedAt: string }[]
  onAddItem?: (name: string, amount: number, unit: string) => void
  onDeleteItem?: (id: string) => void
  onBack?: () => void
}) {
  const [name, setName] = React.useState("")
  const [amount, setAmount] = React.useState("1")
  const [unit, setUnit] = React.useState("個")
  const [unitOptions, setUnitOptions] = React.useState(() => defaultUnitOptions)
  const [showAdd, setShowAdd] = React.useState(false)
  const [showDeleted, setShowDeleted] = React.useState(false)
  const unitListId = React.useId()

  const handleAdd = () => {
    if (!name.trim()) return
    const parsedAmount = Number(amount) || 1
    const trimmedUnit = unit.trim() || "個"
    onAddItem?.(name.trim(), parsedAmount, trimmedUnit)
    setUnitOptions((prev) => (prev.includes(trimmedUnit) ? prev : [...prev, trimmedUnit]))
    setName("")
    setAmount("1")
    setUnit("個")
    setShowAdd(false)
  }

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="冷蔵庫" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          {showDeleted ? (
            <Stack gap="sm">
              <H3 className="text-base">削除した食材</H3>
              {deletedItems && deletedItems.length ? (
                deletedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs"
                  >
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.amount}
                      {item.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-muted-foreground">
                  履歴はありません
                </div>
              )}
            </Stack>
          ) : items.length ? (
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${item.name}を削除しますか？`)) {
                      onDeleteItem?.(item.id)
                    }
                  }}
                  className="rounded-md border border-border bg-card px-2 py-3 text-center transition hover:bg-muted/40"
                >
                  <Apple className="h-6 w-6 text-muted-foreground" />
                  <div className="truncate text-xs font-semibold">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.amount}
                    {item.unit}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <Apple className="h-10 w-10 text-muted-foreground" />
              <div className="mt-2">冷蔵庫は空です</div>
              <div className="text-xs">買い物リストから追加できます</div>
            </div>
          )}

          {showAdd ? (
            <Surface tone="section" density="comfy" className="border-transparent">
              <Stack gap="sm">
                <H3 className="text-base">食材を追加</H3>
                <input
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  placeholder="例: 豚バラ肉"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={amount}
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    onChange={(event) => setAmount(normalizeNumberInput(event.target.value))}
                  />
                  <input
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={unit}
                    list={unitListId}
                    onChange={(event) => setUnit(event.target.value)}
                  />
                  <datalist id={unitListId}>
                    {unitOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <Cluster gap="sm" justify="end">
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                    キャンセル
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleAdd}>
                    追加する
                  </Button>
                </Cluster>
              </Stack>
            </Surface>
          ) : (
            <Cluster justify="between">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleted((prev) => !prev)}>
                履歴
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
                食材を追加
              </Button>
            </Cluster>
          )}
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function NotificationsScreen({
  onBack,
  onOpenHome,
  onOpenHelp,
  onOpenNotifications,
  onOpenFridge,
  onOpenNews,
  onboardingGuideActive,
  onboardingGuideStep,
  onboardingHistorySeeded,
  onAdvanceOnboarding,
  onCompleteOnboarding,
  pwaGuideAvailable,
  onOpenPwaGuide,
}: SubScreenProps & {
  onOpenHome?: () => void
  onOpenHelp?: () => void
  onOpenNotifications?: () => void
  onOpenFridge?: () => void
  onOpenNews?: (item: { title: string; message: string; sourceName?: string; createdAt: string }) => void
  onboardingGuideActive?: boolean
  onboardingGuideStep?: number
  onboardingHistorySeeded?: boolean
  onAdvanceOnboarding?: (nextStep: number) => void
  onCompleteOnboarding?: () => void
  pwaGuideAvailable?: boolean
  onOpenPwaGuide?: () => void
}) {
  type NotificationItem = {
    id: string
    category: "news" | "personal"
    title: string
    message: string
    sourceName?: string
    createdAt: string
    readAt: string | null
    kind?: "pwa-guide"
    onboardingStep?: number
  }
  const [tab, setTab] = React.useState<"news" | "personal">("news")
  const [items, setItems] = React.useState<NotificationItem[]>(() => [
    {
      id: "n1",
      category: "news",
      title: "今週のおすすめセットが届きました",
      message: "季節の献立をまとめた新しいセットを追加しました。",
      sourceName: "献立ループ事務局",
      createdAt: "2026-01-25T10:00:00.000Z",
      readAt: null as string | null,
    },
    {
      id: "n2",
      category: "personal",
      title: "レシピ帳に保存されました",
      message: "購入したレシピがレシピ帳に追加されました。",
      sourceName: "",
      createdAt: "2026-01-25T08:40:00.000Z",
      readAt: null as string | null,
    },
    {
      id: "n3",
      category: "news",
      title: "料理家の新作レシピ公開",
      message: "人気料理家の新作レシピが公開されました。",
      sourceName: "Kondatelab",
      createdAt: "2026-01-24T21:15:00.000Z",
      readAt: "2026-01-25T09:00:00.000Z",
    },
  ])
  const [activeNotification, setActiveNotification] = React.useState<{
    title: string
    message: string
  } | null>(null)
  const [activeGuideStep, setActiveGuideStep] = React.useState<number | null>(null)

  const onboardingGuides = React.useMemo(
    () => [
      {
        step: 1,
        title: "まずはカテゴリを登録してみましょう",
        message: "レシピ帳のカテゴリ管理から、自分の棚を作れます。",
      },
      {
        step: 2,
        title: "レシピ一覧を作ってみましょう",
        message: "お気に入りのレシピを保存して、献立のベースに。",
      },
      {
        step: 3,
        title: "献立を組んでみましょう",
        message: "今週のこんだてにセットを反映すると買い物が楽になります。",
      },
      {
        step: 4,
        title: "ホーム画面に追加しましょう",
        message: "PWAとして追加すると、すぐ開けて便利です。",
      },
    ],
    []
  )

  React.useEffect(() => {
    if (!onboardingHistorySeeded && !onboardingGuideActive) return
    setItems((prev) => {
      const hasOnboarding = prev.some((item) => item.id.startsWith("onboard-"))
      if (hasOnboarding) return prev
      const now = new Date().toISOString()
      const onboardingItems = onboardingGuides.map((guide) => ({
        id: `onboard-${guide.step}`,
        category: "personal",
        title: guide.title,
        message: guide.message,
        sourceName: "",
        createdAt: now,
        readAt: null as string | null,
        onboardingStep: guide.step,
      }))
      return [...onboardingItems, ...prev]
    })
  }, [onboardingGuideActive, onboardingGuides])

  React.useEffect(() => {
    if (!pwaGuideAvailable) return
    setItems((prev) => {
      if (prev.some((item) => item.id === "pwa-guide")) return prev
      const now = new Date().toISOString()
      const guideItem: NotificationItem = {
        id: "pwa-guide",
        category: "personal",
        title: "ホーム画面に追加する方法",
        message: "追加手順を確認して、すぐに開けるようにしましょう。",
        createdAt: now,
        readAt: null,
        kind: "pwa-guide",
      }
      return [guideItem, ...prev]
    })
  }, [pwaGuideAvailable])

  const filteredItems = items
    .filter((item) => item.category === tab)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() }
      )
    )
  }

  const openNotification = (item: (typeof items)[number]) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id && !entry.readAt
          ? { ...entry, readAt: new Date().toISOString() }
          : entry
      )
    )
    if (item.onboardingStep) {
      setActiveGuideStep(item.onboardingStep)
      return
    }
    if (item.kind === "pwa-guide") {
      onOpenPwaGuide?.()
      return
    }
    if (item.category === "news") {
      onOpenNews?.({
        title: item.title,
        message: item.message,
        sourceName: item.sourceName,
        createdAt: item.createdAt,
      })
      return
    }
    setActiveNotification({ title: item.title, message: item.message })
  }

  const formatSimpleDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const activeGuide = onboardingGuides.find((guide) => guide.step === activeGuideStep)
  const handleGuideAdvance = () => {
    if (!activeGuideStep) return
    const nextStep = activeGuideStep + 1
    setActiveGuideStep(null)
    if (nextStep > onboardingGuides.length) {
      onCompleteOnboarding?.()
      onAdvanceOnboarding?.(0)
      return
    }
    onAdvanceOnboarding?.(nextStep)
  }

  return (
    <ScreenContainer>
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/90 px-5 pb-3 pt-4 backdrop-blur">
        <Cluster justify="between" align="center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
            aria-label="戻る"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-center gap-3">
            <button type="button" onClick={onOpenHome} className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="text-base font-semibold">こんだてLoop</span>
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="text-xs text-muted-foreground"
            >
              使い方
            </button>
          </div>
          <HeaderActions onNotifications={onOpenNotifications} onFridge={onOpenFridge} />
        </Cluster>
      </header>
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          <H2 className="text-lg">通知</H2>

          <div className="grid w-full grid-cols-2 rounded-full bg-muted/40 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full rounded-full",
                tab === "news" ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setTab("news")}
            >
              ニュース
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full rounded-full",
                tab === "personal" ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setTab("personal")}
            >
              あなた宛て
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={markAllRead}
              disabled={!filteredItems.length}
            >
              すべて既読
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<span>🔔</span>}
              title="まだ通知はありません"
              description="新しいお知らせが届いたら表示されます"
              className="border-none bg-transparent px-0"
            />
          ) : (
            <Stack gap="sm">
              {filteredItems.map((item) => {
                const isNextGuide =
                  onboardingGuideActive &&
                  typeof item.onboardingStep === "number" &&
                  item.onboardingStep === onboardingGuideStep
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={cn(
                      "w-full rounded-2xl border border-border bg-card px-4 py-3 text-left",
                      item.readAt ? "opacity-80" : "shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    <Stack gap="xs">
                      <Cluster justify="between" align="center">
                        <Cluster gap="xs" align="center">
                          <Body className="text-sm font-semibold">{item.title}</Body>
                          {isNextGuide ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                              次のガイド
                            </span>
                          ) : null}
                        </Cluster>
                        {!item.readAt ? (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        ) : null}
                      </Cluster>
                      {item.category === "news" ? (
                        <Muted className="text-xs">
                          {item.sourceName || "献立ループ事務局"}
                        </Muted>
                      ) : null}
                      <Muted className="text-xs">{item.message}</Muted>
                      <Muted className="text-xs">{formatSimpleDate(item.createdAt)}</Muted>
                    </Stack>
                  </button>
                )
              })}
            </Stack>
          )}
        </Stack>
      </main>
      {activeNotification ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface
            tone="card"
            density="none"
            elevation="raised"
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">通知</H2>
              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="px-5 py-5">
              <Stack gap="sm">
                <H3 className="text-base">{activeNotification.title}</H3>
                <Body className="text-sm text-muted-foreground">
                  {activeNotification.message}
                </Body>
              </Stack>
            </div>
          </Surface>
        </div>
      ) : null}
      {activeGuide ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface
            tone="card"
            density="none"
            elevation="raised"
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">ガイド {activeGuide.step}/4</H2>
              <button
                type="button"
                onClick={() => setActiveGuideStep(null)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="px-5 py-5">
              <Stack gap="sm">
                <H3 className="text-base">{activeGuide.title}</H3>
                <Body className="text-sm text-muted-foreground">{activeGuide.message}</Body>
                <Cluster gap="sm" justify="end">
                  <Button variant="ghost" size="sm" onClick={() => setActiveGuideStep(null)}>
                    後で見る
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleGuideAdvance}>
                    {activeGuide.step >= onboardingGuides.length ? "完了" : "次へ"}
                  </Button>
                </Cluster>
              </Stack>
            </div>
          </Surface>
        </div>
      ) : null}
    </ScreenContainer>
  )
}

export function NewsDetailScreen({
  onBack,
  data,
}: SubScreenProps & {
  data?: { title: string; message: string; sourceName?: string; createdAt?: string }
}) {
  const formatSimpleDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="ニュース詳細" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          <Surface tone="card" density="comfy" className="rounded-2xl">
            <Stack gap="sm">
              <H2 className="text-lg">{data?.title ?? "ニュース"}</H2>
              <Muted className="text-xs">
                {data?.sourceName ?? "献立ループ事務局"}
                {data?.createdAt ? ` ・ ${formatSimpleDate(data.createdAt)}` : ""}
              </Muted>
              <Body className="text-sm text-muted-foreground">
                {data?.message ?? "お知らせ内容を表示します。"}
              </Body>
            </Stack>
          </Surface>
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function ChefDetailScreen({
  onBack,
  chefName,
}: SubScreenProps & { chefName?: string }) {
  const displayName = chefName ?? "料理家A"
  const [tab, setTab] = React.useState<"home" | "recipes" | "sets" | "membership">("home")
  const chefRecipes = [
    {
      id: "chef-r1",
      title: "旬野菜の和風ポトフ",
      author: displayName,
      tags: ["和食", "野菜", "定番"],
      imageUrl:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "chef-r2",
      title: "鶏むねの香味だれ",
      author: displayName,
      tags: ["時短", "たんぱく質"],
      imageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "chef-r3",
      title: "季節の彩りサラダ",
      author: displayName,
      tags: ["ヘルシー", "副菜"],
      imageUrl:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    },
  ]
  const chefSets = [
    {
      id: "chef-s1",
      title: "平日おだやか5品",
      count: 5,
      author: displayName,
      tags: ["時短", "定番"],
      statusBadges: [{ label: "フリー", variant: "free" as const }],
      imageUrl:
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "chef-s2",
      title: "季節の野菜たっぷり",
      count: 4,
      author: displayName,
      tags: ["野菜", "整える"],
      statusBadges: [{ label: "限定", variant: "membership" as const }],
      imageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    },
  ]
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="料理家詳細" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <Cluster gap="sm">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-6 w-6" />
                </span>
                <Stack gap="xs">
                  <H2 className="text-lg">{displayName}</H2>
                  <Muted className="text-xs">季節の献立を届ける</Muted>
                </Stack>
              </Cluster>
              <Body className="text-sm text-muted-foreground">
                旬の食材を中心に、毎日の献立を無理なく続けられるレシピを提案しています。
              </Body>
              <Cluster gap="xs" className="flex-wrap">
                {["Instagram", "YouTube", "X"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </Cluster>
            </Stack>
          </Surface>

          <div className="grid w-full grid-cols-4 rounded-full bg-muted/40 p-1 text-xs">
            {[
              { key: "home", label: "ホーム" },
              { key: "recipes", label: "レシピ" },
              { key: "sets", label: "セット" },
              { key: "membership", label: "メンバー" },
            ].map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full rounded-full px-1",
                  tab === item.key ? "bg-accent text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setTab(item.key as typeof tab)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {tab === "home" ? (
            <Stack gap="md">
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="xs">
                  <Cluster justify="between" align="center">
                    <Cluster gap="sm">
                      <Crown className="h-4 w-4" />
                      <H3 className="text-base">メンバーシップ</H3>
                    </Cluster>
                    <Button variant="secondary" size="sm" disabled>
                      準備中
                    </Button>
                  </Cluster>
                  <Muted className="text-xs">
                    限定レシピや掲示板などの機能は準備中です。
                  </Muted>
                </Stack>
              </Surface>
              <Stack gap="sm">
                <H3 className="text-base">代表レシピ</H3>
                <div className="no-scrollbar overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {chefRecipes.map((recipe) => (
                      <div key={recipe.id} className="w-[140px]">
                        <RecipeCard
                          title={recipe.title}
                          author={recipe.author}
                          tags={recipe.tags}
                          imageUrl={recipe.imageUrl}
                          variant="selectable"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Stack>
              <Stack gap="sm">
                <H3 className="text-base">最新セット</H3>
                <div className="no-scrollbar overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {chefSets.map((set) => (
                      <div key={set.id} className="w-[140px]">
                        <RecipeSetCard
                          title={set.title}
                          count={set.count}
                          author={set.author}
                          tags={set.tags}
                          statusBadges={set.statusBadges}
                          imageUrl={set.imageUrl}
                          size="selectable"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Stack>
            </Stack>
          ) : null}

          {tab === "recipes" ? (
            <Stack gap="sm">
              <H3 className="text-base">レシピ</H3>
              <div className="grid grid-cols-2 justify-items-center gap-3">
                {chefRecipes.map((recipe) => (
                  <div key={recipe.id} className="w-[140px]">
                    <RecipeCard
                      title={recipe.title}
                      author={recipe.author}
                      tags={recipe.tags}
                      imageUrl={recipe.imageUrl}
                      variant="selectable"
                    />
                  </div>
                ))}
              </div>
            </Stack>
          ) : null}

          {tab === "sets" ? (
            <Stack gap="sm">
              <H3 className="text-base">セット</H3>
              <div className="grid grid-cols-2 justify-items-center gap-3">
                {chefSets.map((set) => (
                  <div key={set.id} className="w-[140px]">
                    <RecipeSetCard
                      title={set.title}
                      count={set.count}
                      author={set.author}
                      tags={set.tags}
                      statusBadges={set.statusBadges}
                      imageUrl={set.imageUrl}
                      size="selectable"
                    />
                  </div>
                ))}
              </div>
            </Stack>
          ) : null}

          {tab === "membership" ? (
            <Surface tone="card" density="comfy">
              <EmptyState title="メンバーシップは準備中です" description="公開までお待ちください" />
            </Surface>
          ) : null}
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function MembershipPlansScreen({ onBack }: SubScreenProps) {
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="メンバーシップ" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Surface key={idx} tone="card" density="comfy" elevation="raised">
              <Stack gap="sm">
                <H3 className="text-base">スタンダードプラン</H3>
                <Muted className="text-xs">月額 ¥480</Muted>
                <Button variant="secondary" size="sm">このプランにする</Button>
              </Stack>
            </Surface>
          ))}
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function MembershipDetailScreen({ onBack }: SubScreenProps) {
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="メンバーシップ詳細" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <Surface tone="section" density="comfy" className="border-transparent">
            <Cluster gap="sm">
              <Crown className="h-6 w-6" />
              <Stack gap="xs">
                <H2 className="text-lg">限定セット</H2>
                <Muted className="text-xs">加入者限定の献立</Muted>
              </Stack>
            </Cluster>
          </Surface>
          <Surface tone="card" density="comfy">
            <EmptyState title="限定セットが届きました" description="毎月更新されます" />
          </Surface>
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function ArchiveScreen({ onBack }: SubScreenProps) {
  const [activeArchive, setActiveArchive] = React.useState<{
    date: string
    title: string
    recipes: string[]
  } | null>(null)
  const year = 2026
  const monthIndex = 0
  const monthLabel = `${year}年${monthIndex + 1}月`
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const archiveEntries = [
    {
      date: "2026-01-03",
      title: "冬のほっこりセット",
      recipes: ["甘辛チキン", "鮭ときのこのバター醤油", "味噌汁"],
    },
    {
      date: "2026-01-08",
      title: "時短3日セット",
      recipes: ["豆腐とひき肉の旨辛丼", "サラダチキン", "きんぴら"],
    },
    {
      date: "2026-01-15",
      title: "作り置き活用セット",
      recipes: ["肉じゃが", "ほうれん草おひたし", "鮭の塩焼き"],
    },
  ]
  const entryMap = new Map(
    archiveEntries.map((entry) => [entry.date, entry])
  )
  const calendarCells = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) return null
    const day = index - firstDay + 1
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return {
      day,
      dateKey,
      entry: entryMap.get(dateKey) ?? null,
    }
  })

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="アーカイブ" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="md">
          <Surface tone="card" density="comfy" className="rounded-2xl">
            <Stack gap="sm">
              <Cluster justify="between" align="center">
                <Cluster gap="sm">
                  <Calendar className="h-4 w-4" />
                  <H3 className="text-base">{monthLabel}</H3>
                </Cluster>
                <Muted className="text-xs">料理ログ</Muted>
              </Cluster>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                {["日", "月", "火", "水", "木", "金", "土"].map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) =>
                  cell ? (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => cell.entry && setActiveArchive(cell.entry)}
                      className={cn(
                        "flex h-10 flex-col items-center justify-center rounded-lg text-xs",
                        cell.entry
                          ? "bg-amber-50 text-amber-900"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                      disabled={!cell.entry}
                    >
                      <span>{cell.day}</span>
                      {cell.entry ? <span className="mt-0.5 h-1 w-1 rounded-full bg-amber-400" /> : null}
                    </button>
                  ) : (
                    <div key={`empty-${idx}`} className="h-10" />
                  )
                )}
              </div>
              <Muted className="text-xs">料理した日をタップすると詳細が見られます。</Muted>
            </Stack>
          </Surface>
        </Stack>
      </main>
      {activeArchive ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface
            tone="card"
            density="none"
            elevation="raised"
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">{activeArchive.title}</H2>
              <button
                type="button"
                onClick={() => setActiveArchive(null)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="px-5 py-5">
              <Stack gap="sm">
                <Muted className="text-xs">{activeArchive.date}</Muted>
                <Muted className="text-xs text-muted-foreground">スワイプで次へ</Muted>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                  {activeArchive.recipes.map((recipe, idx) => (
                    <div
                      key={recipe}
                      className="min-w-[220px] snap-center rounded-xl border border-border/60 bg-card px-4 py-4"
                    >
                      <div className="text-xs text-muted-foreground">
                        {idx + 1}/{activeArchive.recipes.length}
                      </div>
                      <H3 className="mt-1 text-base">{recipe}</H3>
                      <Muted className="mt-2 text-xs">
                        料理ログの詳細は次の画面で確認できます。
                      </Muted>
                    </div>
                  ))}
                </div>
              </Stack>
            </div>
          </Surface>
        </div>
      ) : null}
    </ScreenContainer>
  )
}

export function DiagnosisScreen({ onBack }: SubScreenProps) {
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="わたしの傾向メモ" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Surface tone="card" density="comfy">
          <Stack gap="sm">
            <H3 className="text-base">あなたの好み</H3>
            <Body className="text-sm">時短・和食・野菜多めの献立が多いです。</Body>
            <Button variant="secondary" size="sm">診断を更新</Button>
          </Stack>
        </Surface>
      </main>
    </ScreenContainer>
  )
}

export function PurchaseHistoryScreen({ onBack }: SubScreenProps) {
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="購入履歴" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="sm">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Surface key={idx} tone="card" density="compact">
              <Cluster justify="between" align="center">
                <Cluster gap="sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <Body className="text-sm">プレミアムレシピ {idx + 1}</Body>
                </Cluster>
                <Muted className="text-xs">¥480</Muted>
              </Cluster>
            </Surface>
          ))}
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function PaymentHistoryScreen({ onBack }: SubScreenProps) {
  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="決済履歴" onBack={onBack} />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="sm">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Surface key={idx} tone="card" density="compact">
              <Cluster justify="between" align="center">
                <Cluster gap="sm">
                  <CreditCard className="h-4 w-4" />
                  <Body className="text-sm">2026/01/0{idx + 1}</Body>
                </Cluster>
                <Muted className="text-xs">¥480</Muted>
              </Cluster>
            </Surface>
          ))}
        </Stack>
      </main>
    </ScreenContainer>
  )
}
