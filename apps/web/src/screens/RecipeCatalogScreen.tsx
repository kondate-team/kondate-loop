import * as React from "react"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"

import { ScreenContainer } from "@/components/layout/ScreenContainer"
import { HeaderBar } from "@/components/layout/HeaderBar"
import { HeaderActions } from "@/components/layout/HeaderActions"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2 } from "@/components/primitives/Typography"
import { CategoryTabs, type CategoryItem } from "@/components/domain/CategoryTabs"
import { RecipeCard } from "@/components/domain/RecipeCard"
import { RecipeSetCard } from "@/components/domain/RecipeSetCard"
import { EmptyState } from "@/components/domain/EmptyState"
import { SortModal } from "@/components/domain/SortModal"
import { FilterModal, type FilterState } from "@/components/domain/FilterModal"
import { CategoryManagerModal } from "@/components/domain/CategoryManagerModal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sortOptions, filterGroups } from "@/data/filterOptions"

interface RecipeCatalogScreenProps {
  categories: CategoryItem[]
  followedAuthors?: string[]
  recipes: {
    id: string
    title: string
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    cookTimeMinutes?: number
    savedCount?: number
    createdAt?: string
  }[]
  sets: {
    id: string
    title: string
    count: number
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    imageUrl?: string
    savedCount?: number
    createdAt?: string
  }[]
  onOpenRecipe: (id: string) => void
  onOpenSet?: (id: string) => void
  savedRecipeIds: Set<string>
  savedSetIds: Set<string>
  onSaveRecipe: (id: string) => void
  onUnsaveRecipe?: (id: string) => void
  onPurchaseRecipe: (id: string) => void
  onSaveSet: (id: string) => void
  onUnsaveSet?: (id: string) => void
  onPurchaseSet: (id: string) => void
  onUpdateCategories?: (next: CategoryItem[]) => void
  onCreateCategory?: (label: string) => CategoryItem
  onOpenChef?: (author?: string) => void
  membershipAvailable?: boolean
  onOpenNotifications?: () => void
  onOpenFridge?: () => void
  onOpenHelp?: () => void
  onOpenHome?: () => void
}

const initialFilters: FilterState = {
  status: [],
  time: [],
  tag: [],
  rating: [],
  follow: [],
}

export function RecipeCatalogScreen({
  categories,
  followedAuthors,
  recipes,
  sets,
  onOpenRecipe,
  onOpenSet,
  savedRecipeIds,
  savedSetIds,
  onSaveRecipe,
  onUnsaveRecipe,
  onPurchaseRecipe,
  onSaveSet,
  onUnsaveSet,
  onPurchaseSet,
  onUpdateCategories,
  onCreateCategory,
  onOpenChef,
  membershipAvailable,
  onOpenNotifications,
  onOpenFridge,
  onOpenHelp,
  onOpenHome,
}: RecipeCatalogScreenProps) {
  const initialCategoryId =
    categories.find((item) => !item.isHidden)?.id ?? categories[0]?.id ?? "all"
  const [tab, setTab] = React.useState<"recipes" | "sets">("sets")
  const [category, setCategory] = React.useState<string>(initialCategoryId)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<string>(sortOptions[0])
  const [filters, setFilters] = React.useState<FilterState>(initialFilters)
  const [sortOpen, setSortOpen] = React.useState(false)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = React.useState(false)
  const visibleCategories = React.useMemo(
    () => categories.filter((item) => !item.isHidden || item.id === "all"),
    [categories]
  )
  const activeCategory =
    visibleCategories.find((item) => item.id === category) ?? visibleCategories[0]
  const edgeClass = activeCategory?.activeColorClass ?? activeCategory?.colorClass ?? "bg-muted/40"
  const edgeToneClass = edgeClass
  const edgeBarClass = cn(edgeClass, "-translate-x-0.5")
  const titleBgClass = edgeToneClass
  const titleTextClass = activeCategory?.textClass ?? "text-muted-foreground"
  const followedSet = React.useMemo(
    () => new Set(followedAuthors ?? []),
    [followedAuthors]
  )
  const membershipEnabled = membershipAvailable ?? false
  const canManageCategories = Boolean(onUpdateCategories && onCreateCategory)

  const getAccessInfo = (
    badges?: { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
  ) => {
    const labels = badges?.map((badge) => badge.label) ?? []
    const hasPrice = labels.some((label) => label.includes("¥"))
    const hasMembership = labels.includes("限定")
    const isPurchased = labels.includes("購入済み")
    const isFree = labels.includes("フリー")
    const accessible = isFree || isPurchased || (hasMembership && membershipEnabled)
    const priceLabel = labels.find((label) => label.includes("¥"))
    return {
      hasPrice,
      hasMembership,
      isPurchased,
      isFree,
      accessible,
      priceLabel,
    }
  }

  const renderCatalogActions = (
    statusBadges?: { label: string; variant: string }[],
    saved = false,
    onSave?: () => void,
    onPurchase?: () => void,
    onUnsave?: () => void
  ) => {
    const access = getAccessInfo(
      statusBadges as { label: string; variant: "free" | "price" | "purchased" | "membership" | "status" }[]
    )
    const showSave = access.accessible
    const showPurchase = !access.accessible && access.hasPrice
    const showMembershipOnly = !access.accessible && access.hasMembership && !access.hasPrice

    return (
      <Cluster gap="xs" className="w-full" onClick={(event) => event.stopPropagation()}>
        {showSave ? (
          <button
            type="button"
            className={cn(
              "flex-1 rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap",
              saved ? "border-amber-200 bg-amber-50 text-amber-900" : "border-border bg-background text-muted-foreground"
            )}
            onClick={(event) => {
              event.stopPropagation()
              if (saved) {
                onUnsave?.()
              } else {
                onSave?.()
              }
            }}
          >
            {saved ? "保存解除" : "保存"}
          </button>
        ) : null}
        {showPurchase ? (
          <button
            type="button"
            className="flex-1 rounded-full border border-transparent bg-amber-100 px-2 py-0.5 text-[10px] text-amber-900 whitespace-nowrap"
            onClick={(event) => {
              event.stopPropagation()
              onPurchase?.()
            }}
          >
            購入
          </button>
        ) : null}
        {showMembershipOnly ? (
          <button
            type="button"
            disabled
            className="flex-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground whitespace-nowrap"
          >
            メンバー限定
          </button>
        ) : null}
      </Cluster>
    )
  }

  const toggleFilter = (group: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[group])
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, [group]: Array.from(next) }
    })
  }

  const resetFilters = () => setFilters(initialFilters)

  const applyFilters = () => setFilterOpen(false)

  React.useEffect(() => {
    if (!visibleCategories.length) return
    if (!visibleCategories.some((item) => item.id === category)) {
      setCategory(visibleCategories[0]?.id ?? "all")
    }
  }, [visibleCategories, category])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const matchesQuery = (title: string, tags?: string[], author?: string) => {
    if (!normalizedQuery) return true
    const haystack = [title, author, ...(tags ?? [])].filter(Boolean).join(" ").toLowerCase()
    return haystack.includes(normalizedQuery)
  }

  const matchesCategory = (tags?: string[]) => {
    if (!activeCategory || activeCategory.id === "all") return true
    return tags?.includes(activeCategory.label) ?? false
  }

  const matchesStatus = (badges?: { label: string; variant: string }[]) => {
    if (!filters.status.length) return true
    const labels = badges?.map((badge) => badge.label) ?? []
    return filters.status.some((value) => {
      if (value === "有料") return labels.some((label) => label.includes("¥"))
      return labels.includes(value)
    })
  }

  const matchesTime = (tags?: string[], cookTimeMinutes?: number) => {
    if (!filters.time.length) return true
    return filters.time.some((value) => {
      if (cookTimeMinutes) {
        if (value === "15分以内") return cookTimeMinutes <= 15
        if (value === "30分以内") return cookTimeMinutes <= 30
        if (value === "45分以内") return cookTimeMinutes <= 45
      }
      return tags?.includes(value)
    })
  }

  const matchesTag = (tags?: string[]) => {
    if (!filters.tag.length) return true
    return filters.tag.some((value) => tags?.includes(value))
  }

  const createRankMap = <T extends { id: string }>(
    items: T[],
    getValue: (item: T) => number
  ) => {
    return new Map(
      [...items]
        .sort((a, b) => getValue(b) - getValue(a))
        .map((item, index) => [item.id, index + 1])
    )
  }

  const recipeSavedRank = React.useMemo(
    () => createRankMap(recipes, (item) => item.savedCount ?? 0),
    [recipes]
  )
  const recipeNewRank = React.useMemo(
    () =>
      createRankMap(recipes, (item) =>
        item.createdAt ? new Date(item.createdAt).getTime() : 0
      ),
    [recipes]
  )
  const setSavedRank = React.useMemo(
    () => createRankMap(sets, (item) => item.savedCount ?? 0),
    [sets]
  )
  const setNewRank = React.useMemo(
    () =>
      createRankMap(sets, (item) =>
        item.createdAt ? new Date(item.createdAt).getTime() : 0
      ),
    [sets]
  )

  const matchesRating = (id: string, savedRank: Map<string, number>, newRank: Map<string, number>) => {
    if (!filters.rating.length) return true
    return filters.rating.some((value) => {
      if (value === "保存数トップ10") return (savedRank.get(id) ?? Number.POSITIVE_INFINITY) <= 10
      if (value === "保存数トップ30") return (savedRank.get(id) ?? Number.POSITIVE_INFINITY) <= 30
      if (value === "新着") return (newRank.get(id) ?? Number.POSITIVE_INFINITY) <= 10
      return true
    })
  }

  const matchesFollow = (author?: string) => {
    if (!filters.follow.length) return true
    if (!author) return false
    return followedSet.has(author)
  }

  const filteredRecipes = recipes
    .filter((recipe) => matchesQuery(recipe.title, recipe.tags, recipe.author))
    .filter((recipe) => matchesCategory(recipe.tags))
    .filter((recipe) => matchesStatus(recipe.statusBadges))
    .filter((recipe) => matchesTime(recipe.tags, recipe.cookTimeMinutes))
    .filter((recipe) => matchesTag(recipe.tags))
    .filter((recipe) => matchesRating(recipe.id, recipeSavedRank, recipeNewRank))
    .filter((recipe) => matchesFollow(recipe.author))

  const filteredSets = sets
    .filter((set) => matchesQuery(set.title, set.tags, set.author))
    .filter((set) => matchesCategory(set.tags))
    .filter((set) => matchesStatus(set.statusBadges))
    .filter((set) => matchesTag(set.tags))
    .filter((set) => matchesRating(set.id, setSavedRank, setNewRank))
    .filter((set) => matchesFollow(set.author))

  const applySort = <T extends { title: string; savedCount?: number; createdAt?: string }>(list: T[]) => {
    if (sortBy === "新着順") {
      return [...list].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
    }
    if (sortBy === "人気順") {
      return [...list].sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0))
    }
    return list
  }

  const sortedRecipes = applySort(filteredRecipes)
  const sortedSets = applySort(filteredSets)

  const effectiveTimeFilters = tab === "recipes" ? filters.time : []
  const filterSummary = [
    `並び替え: ${sortBy}`,
    ...filters.status,
    ...effectiveTimeFilters,
    ...filters.tag,
    ...filters.rating,
    ...filters.follow,
  ]

  const hasFilters = Object.entries(filters).some(([key, group]) => {
    if (key === "time" && tab !== "recipes") return false
    return group.length > 0
  })
  const hasSort = sortBy !== sortOptions[0]

  return (
    <ScreenContainer>
      <HeaderBar
        actions={<HeaderActions onNotifications={onOpenNotifications} onFridge={onOpenFridge} />}
        onHelpClick={onOpenHelp}
        onLogoClick={onOpenHome}
      />
      <main className="flex h-[calc(100vh-120px)] flex-col overflow-hidden pb-6 pt-4">
        <Stack gap="md" className="flex-1 min-h-0">
          <div className="px-5">
            <div className="flex items-center">
              <H2 className="relative text-[22px] tracking-tight">
                <span className="relative z-10">レシピカタログ</span>
                <span className="absolute -bottom-1 left-0 h-3 w-full origin-left skew-x-[-12deg] rounded-[1px] bg-orange-200/75" />
              </H2>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-col bg-background">
            <div className="px-5 pt-2">
              <Stack gap="md">
                <Cluster gap="sm" className="w-full">
                  <div className="flex flex-1 items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm">
                    <Search className="h-4 w-4 text-muted-foreground/70" />
                    <input
                      type="text"
                      placeholder={tab === "recipes" ? "レシピを探す" : "セットを探す"}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border bg-card",
                      hasSort ? "border-primary/40 text-foreground" : "border-border/70"
                    )}
                    aria-label="並び替え"
                    onClick={() => setSortOpen(true)}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border bg-card",
                      hasFilters ? "border-primary/40 text-foreground" : "border-border/70"
                    )}
                    aria-label="絞り込み"
                    onClick={() => setFilterOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </Cluster>
                {filterSummary.length ? (
                  <div className="flex flex-wrap gap-2">
                    {filterSummary.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="grid w-full grid-cols-2 rounded-full bg-muted/40 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full rounded-full",
                      tab === "sets"
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setTab("sets")}
                  >
                    レシピセット
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full rounded-full",
                      tab === "recipes"
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setTab("recipes")}
                  >
                    レシピ
                  </Button>
                </div>
              </Stack>
            </div>

            <div className="grid h-full flex-1 min-h-0 grid-cols-[auto,6px,1fr] gap-0 pt-2">
              <CategoryTabs
                items={visibleCategories}
                activeId={category}
                onSelect={setCategory}
                onAdd={canManageCategories ? () => setCategoryManagerOpen(true) : undefined}
                className="py-0 pl-3"
              />
              <div className="relative w-[6px]">
                <div className={cn("absolute left-0 right-0 top-0 -bottom-28", edgeBarClass)} />
              </div>
              <div className="min-h-0 overflow-y-auto px-3 pb-6 pt-2">
                <div className="pb-3">
                  <div
                    className={cn(
                      "inline-flex h-6 items-center rounded-sm px-2 text-[11px] font-semibold",
                      titleBgClass,
                      titleTextClass
                    )}
                  >
                    {activeCategory?.label}
                  </div>
                </div>
                {tab === "recipes" ? (
                  <>
                    {sortedRecipes.length ? (
                      <div className="grid grid-cols-2 justify-items-center gap-3">
                        {sortedRecipes.map((recipe) => (
                          <div key={recipe.id} className="w-[140px]">
                          <RecipeCard
                            title={recipe.title}
                            author={recipe.author}
                            tags={recipe.tags}
                            statusBadges={recipe.statusBadges}
                            imageUrl={recipe.imageUrl}
                            variant="selectable"
                              footerAction={renderCatalogActions(
                                recipe.statusBadges,
                                savedRecipeIds.has(recipe.id),
                                () => onSaveRecipe(recipe.id),
                                () => onPurchaseRecipe(recipe.id),
                                () => onUnsaveRecipe?.(recipe.id)
                              )}
                            onAuthorClick={() => onOpenChef?.(recipe.author)}
                            onClick={() => onOpenRecipe(recipe.id)}
                          />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="レシピがありません" description="近日公開予定です" />
                    )}
                  </>
                ) : (
                  <>
                    {sortedSets.length ? (
                      <div className="grid grid-cols-2 justify-items-center gap-3">
                        {sortedSets.map((set) => (
                          <div key={set.id} className="w-[140px]">
                          <RecipeSetCard
                            title={set.title}
                            count={set.count}
                            author={set.author}
                            tags={set.tags}
                            statusBadges={set.statusBadges}
                            imageUrl={set.imageUrl}
                            size="selectable"
                              footerAction={renderCatalogActions(
                                set.statusBadges,
                                savedSetIds.has(set.id),
                                () => onSaveSet(set.id),
                                () => onPurchaseSet(set.id),
                                () => onUnsaveSet?.(set.id)
                              )}
                            onAuthorClick={() => onOpenChef?.(set.author)}
                            onClick={() => onOpenSet?.(set.id)}
                          />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="セットがありません" description="近日公開予定です" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Stack>
      </main>
      <SortModal
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        contextLabel="レシピカタログ"
        options={[...sortOptions]}
        value={sortBy}
        onSelect={(value) => {
          setSortBy(value)
          setSortOpen(false)
        }}
      />
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        contextLabel="レシピカタログ"
        sections={[
          { key: "status", title: "販売ステータス", options: [...filterGroups.status] },
          ...(tab === "recipes"
            ? [{ key: "time" as const, title: "調理時間", options: [...filterGroups.time] }]
            : []),
          { key: "tag", title: "タグ", options: [...filterGroups.tag] },
          { key: "rating", title: "保存数", options: [...filterGroups.rating] },
          { key: "follow", title: "フォロー", options: [...filterGroups.follow] },
        ]}
        state={filters}
        onToggle={toggleFilter}
        onReset={resetFilters}
        onApply={applyFilters}
      />
      {canManageCategories ? (
        <CategoryManagerModal
          open={categoryManagerOpen}
          categories={categories}
          onClose={() => setCategoryManagerOpen(false)}
          onSave={(next) => {
            onUpdateCategories?.(next)
            const nextVisible = next.filter((item) => !item.isHidden || item.id === "all")
            if (!nextVisible.some((item) => item.id === category)) {
              setCategory(nextVisible[0]?.id ?? "all")
            }
          }}
          onCreate={(label) => onCreateCategory?.(label) ?? { id: label, label }}
        />
      ) : null}
    </ScreenContainer>
  )
}
