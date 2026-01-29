import * as React from "react"
import { Share2 } from "lucide-react"

import { BottomNav, type NavItemKey } from "@/components/layout/BottomNav"
import { RecipeDetailModal } from "@/components/domain/RecipeDetailModal"
import { RecipeSetDetailModal } from "@/components/domain/RecipeSetDetailModal"
import { ShoppingModal } from "@/components/domain/ShoppingModal"
import { FridgeModal } from "@/components/domain/FridgeModal"
import { ShareModal } from "@/components/domain/ShareModal"
import { ShareLinkModal } from "@/components/domain/ShareLinkModal"
import { Button } from "@/components/ui/button"
import { Stack, Cluster } from "@/components/primitives/Stack"
import type { CategoryItem } from "@/components/domain/CategoryTabs"
import {
  recipeCategories,
  mockRecipes,
  mockSets,
  mockPublicRecipes,
  mockPublicSets,
  mockFridgeItems,
  mockFollowedAuthors,
  recipeDetailMock,
  recipeSetDetailMock,
} from "@/data/mockData"
import type { Recipe as ApiRecipe, RecipeSet as ApiRecipeSet, StatusBadge } from "@/types/api"
import { defaultUnitOptions } from "@/data/unitOptions"
import { KondateScreen } from "@/screens/KondateScreen"
import { RecipeBookScreen } from "@/screens/RecipeBookScreen"
import { RecipeCatalogScreen } from "@/screens/RecipeCatalogScreen"
import { MyPageScreen } from "@/screens/MyPageScreen"
import { ShareRecipeScreen, ShareSetScreen } from "@/screens/ShareScreens"
import {
  OnboardingScreen,
  AuthLandingScreen,
  LoginScreen,
  SignupScreen,
  AuthErrorScreen,
  SetSelectScreen,
  SetCreateScreen,
  RecipeAddScreen,
  ShoppingListScreen,
  FridgeScreen,
  NotificationsScreen,
  NewsDetailScreen,
  ChefDetailScreen,
  MembershipPlansScreen,
  MembershipDetailScreen,
  ArchiveScreen,
  DiagnosisScreen,
  PurchaseHistoryScreen,
  PaymentHistoryScreen,
} from "@/screens/ExtraScreens"

export type ScreenKey =
  | "auth"
  | "login"
  | "signup"
  | "auth-error"
  | "kondate"
  | "book"
  | "catalog"
  | "mypage"
  | "share-recipe"
  | "share-set"
  | "onboarding"
  | "set-select"
  | "set-create"
  | "recipe-add"
  | "shopping"
  | "fridge"
  | "notifications"
  | "news-detail"
  | "chef"
  | "membership-plans"
  | "membership-detail"
  | "archive"
  | "diagnosis"
  | "purchase"
  | "payment"

const rootScreens: ScreenKey[] = ["kondate", "book", "catalog", "mypage"]

type Ingredient = { name: string; amount: number; unit: string }
type ShoppingItem = {
  id: string
  name: string
  amount: number
  unit: string
  key: string
  isExtra: boolean
  checked: boolean
}
type Recipe = ApiRecipe & { ingredients?: Ingredient[]; source?: "catalog" }
type RecipeSet = ApiRecipeSet & { source?: "catalog" }
type PublicRecipe = Recipe
type PublicSet = RecipeSet
type AnySet = RecipeSet | PublicSet
type SetTemplate = {
  title?: string
  author?: string
  description?: string
  recipeIds?: string[]
  imageUrl?: string
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}
const getShareViewFromPath = (): { type: "recipe" | "set"; id: string } | null => {
  if (typeof window === "undefined") return null
  const match = window.location.pathname.match(/^\/share\/(recipe|set)\/([^/]+)$/)
  if (!match) return null
  const type = match[1] === "set" ? "set" : "recipe"
  return { type, id: match[2] }
}

const buildShoppingItemsFromSet = (
  setItem: { recipeIds?: string[] } | null,
  recipesPool: { id: string; ingredients?: Ingredient[] }[],
  fridgeList: { name: string; amount: number; unit: string }[]
) => {
  if (!setItem?.recipeIds?.length) return []
  const totals = new Map<string, { name: string; unit: string; amount: number }>()
  setItem.recipeIds.forEach((id) => {
    const recipe = recipesPool.find((item) => item.id === id)
    if (!recipe?.ingredients?.length) return
    recipe.ingredients.forEach((ing) => {
      const key = `${ing.name}-${ing.unit}`
      const current = totals.get(key)
      if (current) {
        current.amount += ing.amount
      } else {
        totals.set(key, { name: ing.name, unit: ing.unit, amount: ing.amount })
      }
    })
  })

  const fridgeMap = new Map<string, number>()
  fridgeList.forEach((item) => {
    const key = `${item.name}-${item.unit}`
    fridgeMap.set(key, (fridgeMap.get(key) ?? 0) + item.amount)
  })

  return Array.from(totals.entries())
    .map(([key, value]) => {
      const fridgeAmount = fridgeMap.get(key) ?? 0
      const remaining = value.amount - fridgeAmount
      return remaining > 0
        ? ({
            id: `i-${key}`,
            name: value.name,
            amount: remaining,
            unit: value.unit,
            key,
            isExtra: false,
            checked: false,
          } as ShoppingItem)
        : null
    })
    .filter((item): item is ShoppingItem => item !== null)
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [hasOnboarded, setHasOnboarded] = React.useState(true)
  const [screen, setScreen] = React.useState<ScreenKey>(() => {
    const shareView = getShareViewFromPath()
    if (!shareView) return "auth"
    return shareView.type === "recipe" ? "share-recipe" : "share-set"
  })
  const [, setHistory] = React.useState<ScreenKey[]>(["auth"])
  const [authError, setAuthError] = React.useState<{ title: string; message: string } | null>(null)
  const [logoutConfirm, setLogoutConfirm] = React.useState(false)
  const [categories, setCategories] = React.useState<CategoryItem[]>(() => recipeCategories)
  const [myRecipes, setMyRecipes] = React.useState<Recipe[]>(() => mockRecipes)
  const [mySets, setMySets] = React.useState<RecipeSet[]>(() => mockSets)
  const [publicRecipes, setPublicRecipes] = React.useState<PublicRecipe[]>(() => mockPublicRecipes)
  const [publicSets, setPublicSets] = React.useState<PublicSet[]>(() => mockPublicSets)
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null)
  const [selectedSetId, setSelectedSetId] = React.useState<string | null>(null)
  const [recipeContext, setRecipeContext] = React.useState<"kondate" | "book" | "catalog" | "set">("kondate")
  const [setContext, setSetContext] = React.useState<"kondate" | "book" | "catalog">("kondate")
  const [setDetailOpen, setSetDetailOpen] = React.useState(false)
  const [returnToSetId, setReturnToSetId] = React.useState<string | null>(null)
  const [activeNews, setActiveNews] = React.useState<{
    title: string
    message: string
    sourceName?: string
    createdAt?: string
  } | null>(null)
  const [activeChef, setActiveChef] = React.useState<{ name?: string } | null>(null)
  const [cookedIds, setCookedIds] = React.useState<Set<string>>(new Set(["r2"]))
  const [shoppingOpen, setShoppingOpen] = React.useState(false)
  const [fridgeOpen, setFridgeOpen] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [unitOptions, setUnitOptions] = React.useState(() => defaultUnitOptions)
  const [purchaseConfirm, setPurchaseConfirm] = React.useState<{
    type: "recipe" | "set"
    id: string
    priceLabel?: string
  } | null>(null)
  const [purchasePrompt, setPurchasePrompt] = React.useState<{
    type: "recipe" | "set"
    id: string
  } | null>(null)
  const [shareTarget, setShareTarget] = React.useState<{
    type: "recipe" | "set"
    id: string
  } | null>(null)
  const [shareLink, setShareLink] = React.useState<{
    url: string
    title: string
    type: "recipe" | "set"
  } | null>(null)
  const [shareView, setShareView] = React.useState<{
    type: "recipe" | "set"
    id: string
  } | null>(() => getShareViewFromPath())
  const [completionOpen, setCompletionOpen] = React.useState(false)
  const [pwaPromptEvent, setPwaPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [pwaDismissed, setPwaDismissed] = React.useState(false)
  const [pwaInstalled, setPwaInstalled] = React.useState(false)
  const [currentSet, setCurrentSet] = React.useState<AnySet | null>(() => mockSets[0] ?? null)
  const [nextSet, setNextSet] = React.useState<AnySet | null>(() => mockSets[1] ?? null)
  const [selectingFor, setSelectingFor] = React.useState<"current" | "next">("current")
  const [setTemplate, setSetTemplate] = React.useState<SetTemplate | null>(null)
  const [fridgeItems, setFridgeItems] = React.useState(() => mockFridgeItems)
  const [deletedFridgeItems, setDeletedFridgeItems] = React.useState<
    { id: string; name: string; amount: number; unit: string; deletedAt: string }[]
  >([])
  const categoryThemePalette = React.useMemo(
    () =>
      recipeCategories
        .filter((item) => item.id !== "all")
        .map(
          ({
            colorClass,
            activeColorClass,
            textClass,
            panelClass,
            panelRecipeClass,
            panelSetClass,
          }) => ({
            colorClass,
            activeColorClass: activeColorClass ?? colorClass,
            textClass,
            panelClass,
            panelRecipeClass,
            panelSetClass,
          })
        ),
    []
  )
  const createCategory = React.useCallback(
    (label: string) => {
      const customCount = categories.filter((item) => !item.isDefault).length
      const theme = categoryThemePalette[customCount % categoryThemePalette.length]
      return {
        id: `c-${Date.now()}`,
        label,
        isDefault: false,
        isHidden: false,
        colorClass: theme?.colorClass,
        activeColorClass: theme?.activeColorClass ?? theme?.colorClass,
        textClass: theme?.textClass,
        panelClass: theme?.panelClass,
        panelRecipeClass: theme?.panelRecipeClass,
        panelSetClass: theme?.panelSetClass,
      }
    },
    [categories, categoryThemePalette]
  )
  const registerUnitOption = React.useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setUnitOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
  }, [])
  const recipePool = React.useMemo(() => {
    const map = new Map<string, (typeof myRecipes)[number]>()
    ;[...myRecipes, ...publicRecipes].forEach((recipe) => {
      if (!map.has(recipe.id)) {
        map.set(recipe.id, recipe)
      }
    })
    return Array.from(map.values())
  }, [myRecipes, publicRecipes])
  const buildShoppingItems = React.useCallback(
    (setItem: { recipeIds?: string[] } | null, fridgeList: typeof mockFridgeItems) =>
      buildShoppingItemsFromSet(setItem, recipePool, fridgeList),
    [recipePool]
  )
  const [shoppingItems, setShoppingItems] = React.useState<ShoppingItem[]>(() =>
    buildShoppingItemsFromSet(mockSets[0] ?? null, mockRecipes, mockFridgeItems)
  )

  const navigate = React.useCallback((next: ScreenKey, reset = false) => {
    if (reset) {
      setHistory([next])
      setScreen(next)
      return
    }
    setHistory((prev) => [...prev, next])
    setScreen(next)
  }, [])

  React.useEffect(() => {
    const match = window.location.pathname.match(/^\/share\/(recipe|set)\/([^/]+)$/)
    if (!match) return
    const type = match[1] === "set" ? "set" : "recipe"
    const id = match[2]
    setShareView({ type, id })
    navigate(type === "recipe" ? "share-recipe" : "share-set", true)
  }, [navigate])

  const completeLogin = (firstTime?: boolean) => {
    setIsAuthenticated(true)
    if (firstTime) {
      setHasOnboarded(false)
      navigate("onboarding", true)
      return
    }
    navigate(hasOnboarded ? "kondate" : "onboarding", true)
  }

  const handleLogin = (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      setAuthError({
        title: "ログインに失敗しました",
        message: "メールアドレスとパスワードを入力してください。",
      })
      navigate("auth-error")
      return
    }
    completeLogin(false)
  }

  const handleSignup = (name: string, email: string, password: string) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAuthError({
        title: "登録に失敗しました",
        message: "入力内容を確認して、もう一度お試しください。",
      })
      navigate("auth-error")
      return
    }
    completeLogin(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate("auth", true)
  }

  const handlePwaInstall = async () => {
    if (!pwaPromptEvent) return
    await pwaPromptEvent.prompt()
    const choice = await pwaPromptEvent.userChoice
    setPwaDismissed(true)
    if (choice.outcome === "accepted") {
      setPwaInstalled(true)
      setToastMessage("ホーム画面に追加しました")
    }
  }

  React.useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone
    if (isStandalone) {
      setPwaInstalled(true)
    }
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setPwaPromptEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setPwaInstalled(true)
      setPwaPromptEvent(null)
    }
    window.addEventListener("beforeinstallprompt", handlePrompt)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  const goBack = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const nextHistory = prev.slice(0, -1)
      setScreen(nextHistory[nextHistory.length - 1])
      return nextHistory
    })
  }, [])

  const handleNav = (next: NavItemKey) => {
    const map: Record<NavItemKey, ScreenKey> = {
      kondate: "kondate",
      book: "book",
      catalog: "catalog",
      mypage: "mypage",
    }
    navigate(map[next], true)
  }

  const recipesWithCooked = recipePool.map((recipe) => ({
    ...recipe,
    cooked: cookedIds.has(recipe.id),
  }))
  const kondateRecipes = React.useMemo(
    () => {
      const currentSetRecipeIds = currentSet?.recipeIds ?? []
      const base = currentSetRecipeIds.length
        ? recipesWithCooked.filter((recipe) => currentSetRecipeIds.includes(recipe.id))
        : recipesWithCooked
      return [...base].sort((a, b) => {
        if (a.cooked === b.cooked) return 0
        return a.cooked ? 1 : -1
      })
    },
    [currentSet, recipesWithCooked]
  )

  const selectedRecipe = selectedRecipeId
    ? (recipeContext === "catalog"
        ? publicRecipes.find((recipe) => recipe.id === selectedRecipeId)
        : recipeContext === "set"
          ? myRecipes.find((recipe) => recipe.id === selectedRecipeId) ??
            publicRecipes.find((recipe) => recipe.id === selectedRecipeId)
          : myRecipes.find((recipe) => recipe.id === selectedRecipeId))
    : null
  const recipeDetailData = selectedRecipe
    ? {
        ...recipeDetailMock,
        title: selectedRecipe.title,
        author: selectedRecipe.author ?? recipeDetailMock.author,
        sourceUrl: selectedRecipe.sourceUrl ?? recipeDetailMock.sourceUrl,
        tags: selectedRecipe.tags ?? recipeDetailMock.tags,
        statusBadges: selectedRecipe.statusBadges ?? recipeDetailMock.statusBadges,
        imageUrl: selectedRecipe.imageUrl ?? recipeDetailMock.imageUrl,
      }
    : recipeDetailMock

  const selectedSet = selectedSetId
    ? (setContext === "catalog"
        ? publicSets.find((set) => set.id === selectedSetId)
        : mySets.find((set) => set.id === selectedSetId))
    : null
  const setDetailData = selectedSet
    ? {
        ...recipeSetDetailMock,
        title: selectedSet.title,
        author: selectedSet.author ?? recipeSetDetailMock.author,
        tags: selectedSet.tags ?? recipeSetDetailMock.tags,
        count: selectedSet.count ?? recipeSetDetailMock.count,
        imageUrl: selectedSet.imageUrl ?? recipeSetDetailMock.imageUrl,
        statusBadges: selectedSet.statusBadges ?? recipeSetDetailMock.statusBadges,
      }
    : recipeSetDetailMock

  const membershipAvailable = false
  const isMember = false
  const getAccessInfo = (badges?: StatusBadge[]) => {
    const labels = badges?.map((badge) => badge.label) ?? []
    const hasPrice = labels.some((label) => label.includes("¥"))
    const hasMembership = labels.includes("限定")
    const isPurchased = labels.includes("購入済み")
    const isFree = labels.includes("フリー")
    const accessible = isFree || isPurchased || (hasMembership && isMember)
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

  const recipeAccess = getAccessInfo(selectedRecipe?.statusBadges)
  const setAccess = getAccessInfo(selectedSet?.statusBadges)
  const priceBadge = recipeAccess.priceLabel
  const canShareRecipeInBook =
    recipeContext === "book" || (recipeContext === "set" && setContext === "book")
  const canShareSetInBook = setContext === "book"

  const savedRecipeIds = React.useMemo(
    () => new Set(myRecipes.map((recipe) => recipe.id)),
    [myRecipes]
  )
  const savedSetIds = React.useMemo(
    () => new Set(mySets.map((set) => set.id)),
    [mySets]
  )
  const shareRecipe =
    shareTarget?.type === "recipe"
      ? recipePool.find((item) => item.id === shareTarget.id)
      : null
  const shareSet =
    shareTarget?.type === "set" ? mySets.find((item) => item.id === shareTarget.id) : null
  const shareLinkTitle = shareLink?.title ?? ""
  const shareLinkTypeLabel = shareLink?.type === "set" ? "レシピセット" : "レシピ"
  const shareRecipeView =
    shareView?.type === "recipe"
      ? recipePool.find((item) => item.id === shareView.id) ?? recipeDetailMock
      : null
  const shareSetView =
    shareView?.type === "set"
      ? publicSets.find((item) => item.id === shareView.id) ??
        mySets.find((item) => item.id === shareView.id) ??
        recipeSetDetailMock
      : null
  const markPurchasedBadges = (badges?: StatusBadge[]) => {
    const filtered = (badges ?? []).filter(
      (badge) => !["フリー", "購入済み"].includes(badge.label) && !badge.label.includes("¥")
    )
    return [...filtered, { label: "購入済み", variant: "purchased" as const }]
  }

  function handleSaveRecipeFromCatalog(id: string) {
    if (savedRecipeIds.has(id)) {
      setToastMessage("保存済みです")
      return
    }
    const recipe = publicRecipes.find((item) => item.id === id)
    if (!recipe) return
    const access = getAccessInfo(recipe.statusBadges)
    if (!access.accessible) {
      if (access.hasMembership && !access.hasPrice) {
        setToastMessage("メンバー限定は準備中です")
      } else {
        setToastMessage("購入すると保存できます")
      }
      return
    }
    setMyRecipes((prev) => [...prev, { ...recipe, source: "catalog" }])
    setToastMessage("レシピ帳に保存しました")
  }

  function handleUnsaveRecipeFromCatalog(id: string) {
    if (!savedRecipeIds.has(id)) {
      setToastMessage("まだ保存されていません")
      return
    }
    setMyRecipes((prev) => prev.filter((item) => item.id !== id))
    setToastMessage("保存を解除しました")
  }

  function handleSaveSetFromCatalog(id: string) {
    if (savedSetIds.has(id)) {
      setToastMessage("保存済みです")
      return
    }
    const setItem = publicSets.find((item) => item.id === id)
    if (!setItem) return
    const access = getAccessInfo(setItem.statusBadges)
    if (!access.accessible) {
      if (access.hasMembership && !access.hasPrice) {
        setToastMessage("メンバー限定は準備中です")
      } else {
        setToastMessage("購入すると保存できます")
      }
      return
    }
    setMySets((prev) => [...prev, { ...setItem, source: "catalog" }])
    setToastMessage("レシピ帳に保存しました")
  }

  function handleUnsaveSetFromCatalog(id: string) {
    if (!savedSetIds.has(id)) {
      setToastMessage("まだ保存されていません")
      return
    }
    setMySets((prev) => prev.filter((item) => item.id !== id))
    setToastMessage("保存を解除しました")
  }

  function handlePurchaseRecipeFromCatalog(id: string) {
    setPublicRecipes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, statusBadges: markPurchasedBadges(item.statusBadges) } : item
      )
    )
    setToastMessage("購入しました")
    setPurchasePrompt({ type: "recipe", id })
  }

  function handlePurchaseSetFromCatalog(id: string) {
    setPublicSets((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, statusBadges: markPurchasedBadges(item.statusBadges) } : item
      )
    )
    setToastMessage("購入しました")
    setPurchasePrompt({ type: "set", id })
  }

  const openPurchaseConfirm = (type: "recipe" | "set", id: string) => {
    const source =
      type === "recipe"
        ? publicRecipes.find((item) => item.id === id)
        : publicSets.find((item) => item.id === id)
    if (!source) return
    const access = getAccessInfo(source.statusBadges)
    if (!access.hasPrice) {
      if (access.hasMembership && !membershipAvailable) {
        setToastMessage("メンバー限定は準備中です")
      }
      return
    }
    setPurchaseConfirm({ type, id, priceLabel: access.priceLabel })
  }

  const closePurchaseConfirm = () => setPurchaseConfirm(null)

  const handleConfirmPurchaseIntent = () => {
    if (!purchaseConfirm) return
    if (purchaseConfirm.type === "recipe") {
      handlePurchaseRecipeFromCatalog(purchaseConfirm.id)
      closeRecipe()
    } else {
      handlePurchaseSetFromCatalog(purchaseConfirm.id)
      closeSet()
    }
    setPurchaseConfirm(null)
    navigate("catalog", true)
  }

  const closePurchasePrompt = () => setPurchasePrompt(null)

  const handlePurchasePromptSave = () => {
    if (!purchasePrompt) return
    if (purchasePrompt.type === "recipe") {
      handleSaveRecipeFromCatalog(purchasePrompt.id)
    } else {
      handleSaveSetFromCatalog(purchasePrompt.id)
    }
    setPurchasePrompt(null)
    navigate("catalog", true)
  }

  function handleDeleteRecipe(id: string) {
    if (!window.confirm("レシピ帳から削除しますか？")) return
    setMyRecipes((prev) => prev.filter((item) => item.id !== id))
    closeRecipe()
    setToastMessage("削除しました")
  }

  function handleDeleteSet(id: string) {
    if (!window.confirm("レシピ帳から削除しますか？")) return
    setMySets((prev) => prev.filter((item) => item.id !== id))
    closeSet()
    setToastMessage("削除しました")
  }

  const openShare = (type: "recipe" | "set", id: string) => {
    setShareTarget({ type, id })
  }

  const closeShare = () => setShareTarget(null)

  const buildShareUrl = (type: "recipe" | "set", id: string) =>
    `https://kondate-loop.example.com/share/${type}/${id}`

  const handleShareSubmit = (payload: { author?: string; sourceUrl?: string }) => {
    if (!shareTarget) return
    const nextAuthor = payload.author?.trim()
    const nextSourceUrl = payload.sourceUrl?.trim()
    if (shareTarget.type === "recipe") {
      setMyRecipes((prev) =>
        prev.map((item) =>
          item.id === shareTarget.id
            ? {
                ...item,
                author: nextAuthor || item.author,
                sourceUrl: nextSourceUrl || item.sourceUrl,
              }
            : item
        )
      )
    } else {
      setMySets((prev) =>
        prev.map((item) =>
          item.id === shareTarget.id
            ? {
                ...item,
                author: nextAuthor || item.author,
                sourceUrl: nextSourceUrl || item.sourceUrl,
              }
            : item
        )
      )
    }
    const url = buildShareUrl(shareTarget.type, shareTarget.id)
    const title =
      shareTarget.type === "recipe"
        ? shareRecipe?.title ?? "レシピ"
        : shareSet?.title ?? "レシピセット"
    setShareTarget(null)
    setShareLink({ url, title, type: shareTarget.type })
  }

  const openRecipe = (id: string, context: "kondate" | "book" | "catalog" | "set") => {
    setRecipeContext(context)
    setSelectedRecipeId(id)
  }
  function closeRecipe() {
    setSelectedRecipeId(null)
    setReturnToSetId(null)
  }
  const openSet = (id: string, context: "kondate" | "book" | "catalog") => {
    setSetContext(context)
    setSelectedSetId(id)
    setSetDetailOpen(true)
  }
  const openSetCreate = (template?: SetTemplate) => {
    setSetTemplate(template ?? null)
    navigate("set-create")
  }
  const openChef = (author?: string) => {
    const name = author?.trim() || "料理家"
    setActiveChef({ name })
    setSelectedRecipeId(null)
    setSelectedSetId(null)
    setSetDetailOpen(false)
    setReturnToSetId(null)
    navigate("chef")
  }
  function closeSet() {
    setSelectedSetId(null)
    setSetDetailOpen(false)
  }
  const backToSetDetail = () => {
    if (!returnToSetId) return
    setSelectedRecipeId(null)
    setSelectedSetId(returnToSetId)
    setSetDetailOpen(true)
    setReturnToSetId(null)
  }

  const consumeIngredientsFromFridge = (recipe?: { ingredients?: Ingredient[] }) => {
    if (!recipe?.ingredients?.length) return
    setFridgeItems((prev) => {
      let next = [...prev]
      recipe.ingredients?.forEach((ing) => {
        const index = next.findIndex(
          (item) => item.name === ing.name && item.unit === ing.unit
        )
        if (index === -1) return
        const target = next[index]
        const remaining = target.amount - ing.amount
        if (remaining <= 0) {
          next = next.filter((_, idx) => idx !== index)
        } else {
          next[index] = { ...target, amount: remaining }
        }
      })
      return next
    })
  }

  const recipeLocked = recipeContext === "catalog" && !recipeAccess.accessible
  const recipeLockedMessage =
    recipeAccess.hasMembership && !membershipAvailable && !recipeAccess.hasPrice
      ? "メンバー限定コンテンツは準備中です"
      : recipeAccess.hasMembership && membershipAvailable
        ? "加入するとレシピの中身が見られるよ"
        : "購入するとレシピの中身が見られるよ"

  const recipeLockedActions =
    recipeContext === "catalog" ? (
      <Stack gap="sm">
        {recipeAccess.hasMembership && !membershipAvailable && !recipeAccess.hasPrice ? (
          <Button className="w-full rounded-full" disabled>
            メンバーシップ準備中
          </Button>
        ) : recipeAccess.hasMembership && membershipAvailable ? (
          <Button className="w-full rounded-full" onClick={() => navigate("membership-plans")}>
            プランを見る
          </Button>
        ) : null}
        {recipeAccess.hasPrice ? (
          <Button
            className="w-full rounded-full"
            onClick={() => selectedRecipeId && openPurchaseConfirm("recipe", selectedRecipeId)}
          >
            {recipeAccess.priceLabel ? `購入する ${recipeAccess.priceLabel}` : "購入する"}
          </Button>
        ) : null}
        {recipeAccess.hasPrice ? (
          <span className="text-center text-xs text-muted-foreground">
            購入後に「保存」でレシピ帳へ
          </span>
        ) : null}
      </Stack>
    ) : null

  const recipeShareButton =
    canShareRecipeInBook && selectedRecipeId ? (
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full"
        onClick={() => openShare("recipe", selectedRecipeId)}
        aria-label="外部共有"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    ) : null
  const setShareButton =
    canShareSetInBook && selectedSetId ? (
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full"
        onClick={() => openShare("set", selectedSetId)}
        aria-label="外部共有"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    ) : null

  const setLocked = setContext === "catalog" && !setAccess.accessible
  const setLockedMessage =
    setAccess.hasMembership && !membershipAvailable && !setAccess.hasPrice
      ? "メンバー限定コンテンツは準備中です"
      : setAccess.hasMembership && membershipAvailable
        ? "加入すると献立表に登録できます"
        : "購入すると献立表に登録できます"

  const setLockedActions =
    setContext === "catalog" ? (
      <Stack gap="sm">
        {setAccess.hasPrice ? (
          <Button
            className="w-full rounded-full"
            onClick={() => selectedSetId && openPurchaseConfirm("set", selectedSetId)}
          >
            {setAccess.priceLabel ? `購入して使う ${setAccess.priceLabel}` : "購入して使う"}
          </Button>
        ) : null}
        {setAccess.hasMembership && !membershipAvailable && !setAccess.hasPrice ? (
          <Button variant="secondary" className="w-full rounded-full" disabled>
            メンバーシップ準備中
          </Button>
        ) : setAccess.hasMembership && membershipAvailable ? (
          <Button
            variant="secondary"
            className="w-full rounded-full"
            onClick={() => navigate("membership-plans")}
          >
            プランを見る
          </Button>
        ) : null}
        <span className="text-center text-xs text-muted-foreground">{setLockedMessage}</span>
      </Stack>
    ) : null

  const recipeFooter =
    recipeContext === "kondate" ? undefined : recipeContext === "catalog" ? (
      <Stack gap="sm">
        {(() => {
          const isSaved = Boolean(selectedRecipeId && savedRecipeIds.has(selectedRecipeId))
          return (
            <Button
              variant="secondary"
              className="w-full rounded-full"
              disabled={!selectedRecipeId}
              onClick={() => {
                if (!selectedRecipeId) return
                if (isSaved) {
                  handleUnsaveRecipeFromCatalog(selectedRecipeId)
                } else {
                  handleSaveRecipeFromCatalog(selectedRecipeId)
                }
              }}
            >
              {isSaved ? "保存解除" : "レシピ帳に保存"}
            </Button>
          )
        })()}
        {recipeAccess.hasPrice ? (
          <Button
            className="w-full rounded-full"
            disabled={!selectedRecipeId || recipeAccess.isPurchased}
            onClick={() => selectedRecipeId && openPurchaseConfirm("recipe", selectedRecipeId)}
          >
            {recipeAccess.isPurchased
              ? "購入済み"
              : priceBadge
                ? `購入する ${priceBadge}`
                : "購入する"}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          className="w-full rounded-full"
          onClick={() => {
            closeRecipe()
            openSetCreate()
          }}
        >
          ここからセットを作る
        </Button>
      </Stack>
    ) : recipeContext === "set" ? (
      <Stack gap="sm">
        <Cluster gap="sm" wrap="nowrap" className="w-full">
          {recipeShareButton}
          <Button
            variant="secondary"
            className="w-full rounded-full"
            onClick={() => {
              closeRecipe()
              openSetCreate()
            }}
          >
            ここからセットを作る
          </Button>
        </Cluster>
      </Stack>
    ) : (
      <Stack gap="sm">
        <Cluster gap="sm" wrap="nowrap" className="w-full">
          {recipeShareButton}
          <Button
            variant="secondary"
            className="w-full rounded-full"
            onClick={() => {
              closeRecipe()
              openSetCreate()
            }}
          >
            ここからセットを作る
          </Button>
        </Cluster>
        <Button
          variant="ghost"
          className="w-full rounded-full text-destructive"
          onClick={() => selectedRecipeId && handleDeleteRecipe(selectedRecipeId)}
        >
          レシピ帳から削除
        </Button>
      </Stack>
    )

  const applySelectedSet = () => {
    if (!selectedSet) return
    setCurrentSet(selectedSet)
    setShoppingItems(buildShoppingItems(selectedSet, fridgeItems))
    closeSet()
    navigate("kondate", true)
  }

  const isCatalogSetInBook =
    setContext === "book" && selectedSet && "source" in selectedSet && selectedSet.source === "catalog"
  const openSetCreateFromSet = () => {
    if (!selectedSet) return
    closeSet()
    if (isCatalogSetInBook) {
      openSetCreate({
        title: `${selectedSet.title}のコピー`,
        recipeIds: selectedSet.recipeIds ?? [],
        imageUrl: selectedSet.imageUrl,
      })
      return
    }
    openSetCreate()
  }

  const setFooter = (
    <Stack gap="sm">
      <Button className="w-full rounded-full" onClick={applySelectedSet}>
        献立表に登録する
      </Button>
      {setContext === "catalog" ? (
        (() => {
          const isSaved = Boolean(selectedSetId && savedSetIds.has(selectedSetId))
          return (
            <Button
              variant="secondary"
              className="w-full rounded-full"
              disabled={!selectedSetId}
              onClick={() => {
                if (!selectedSetId) return
                if (isSaved) {
                  handleUnsaveSetFromCatalog(selectedSetId)
                } else {
                  handleSaveSetFromCatalog(selectedSetId)
                }
              }}
            >
              {isSaved ? "保存解除" : "レシピ帳に保存"}
            </Button>
          )
        })()
      ) : (
        <>
          <Cluster gap="sm" wrap="nowrap" className="w-full">
            {setShareButton}
            <Button
              variant="secondary"
              className="w-full rounded-full"
              onClick={openSetCreateFromSet}
            >
              {isCatalogSetInBook ? "このセットから作る" : "編集する"}
            </Button>
          </Cluster>
          {canShareSetInBook ? (
            <Button
              variant="ghost"
              className="w-full rounded-full text-destructive"
              onClick={() => selectedSetId && handleDeleteSet(selectedSetId)}
            >
              レシピ帳から削除
            </Button>
          ) : null}
        </>
      )}
    </Stack>
  )

  const toggleCooked = () => {
    if (!selectedRecipeId) return
    const next = new Set(cookedIds)
    const wasCooked = next.has(selectedRecipeId)
    if (wasCooked) {
      next.delete(selectedRecipeId)
    } else {
      consumeIngredientsFromFridge(selectedRecipe ?? undefined)
      next.add(selectedRecipeId)
    }
    setCookedIds(next)
    closeRecipe()
    if (recipeContext === "kondate") {
      setScreen("kondate")
    }
    if (!wasCooked && currentSet) {
      const allCooked =
        kondateRecipes.length > 0 && kondateRecipes.every((recipe) => next.has(recipe.id))
      if (allCooked) {
        window.setTimeout(() => setCompletionOpen(true), 500)
      }
    }
  }

  const handlePurchaseItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, checked: !entry.checked } : entry
      )
    )
  }

  const handleConfirmPurchase = () => {
    const purchased = shoppingItems.filter((entry) => entry.checked)
    if (!purchased.length) return
    const remainingExtras = shoppingItems.filter(
      (entry) => entry.isExtra && !entry.checked
    )
    setFridgeItems((current) => {
      const nextFridge = [
        ...current,
        ...purchased.map((entry) => ({
          id: `f-${Date.now()}-${entry.id}`,
          name: entry.name,
          amount: entry.amount,
          unit: entry.unit,
        })),
      ]
      setShoppingItems([...buildShoppingItems(currentSet, nextFridge), ...remainingExtras])
      return nextFridge
    })
    setShoppingOpen(false)
    setToastMessage("冷蔵庫に追加しました")
  }

  const completeCurrentSet = React.useCallback(() => {
    setCompletionOpen(false)
    if (nextSet) {
      setCurrentSet(nextSet)
      setNextSet(null)
      setShoppingItems(buildShoppingItems(nextSet, fridgeItems))
    } else {
      setCurrentSet(null)
      setShoppingItems([])
    }
    setCookedIds(new Set())
  }, [buildShoppingItems, fridgeItems, nextSet])

  const handleAddFridgeItem = (name: string, amount: number, unit: string) => {
    setFridgeItems((prev) => {
      const next = [...prev, { id: `f-${Date.now()}`, name, amount, unit }]
      const extras = shoppingItems.filter((entry) => entry.isExtra)
      setShoppingItems([...buildShoppingItems(currentSet, next), ...extras])
      return next
    })
  }

  const handleAddExtraItem = (name: string, amount: number, unit: string) => {
    const key = `extra-${Date.now()}`
    setShoppingItems((prev) => [
      ...prev,
      {
        id: key,
        name,
        amount,
        unit,
        key,
        isExtra: true,
        checked: false,
      },
    ])
  }

  const handleRemoveExtraItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleDeleteFridgeItem = (id: string) => {
    setFridgeItems((prev) => {
      const item = prev.find((entry) => entry.id === id)
      if (!item) return prev
      const next = prev.filter((entry) => entry.id !== id)
      setDeletedFridgeItems((history) => [
        { ...item, deletedAt: new Date().toISOString() },
        ...history,
      ])
      setShoppingItems((current) => {
        const extras = current.filter((entry) => entry.isExtra)
        return [...buildShoppingItems(currentSet, next), ...extras]
      })
      return next
    })
  }

  const handleCreateRecipe = (recipe: Recipe) => {
    setMyRecipes((prev) => [...prev, recipe])
    setToastMessage("レシピを追加しました")
    navigate("book", true)
  }

  const handleCreateSet = (setItem: RecipeSet) => {
    setMySets((prev) => [...prev, setItem])
    setToastMessage("セットを追加しました")
    setSetTemplate(null)
    navigate("book", true)
  }

  const handleSelectSet = (setItem: AnySet) => {
    const toast =
      selectingFor === "next" ? "次の献立に登録しました" : "献立表に登録しました"
    if (selectingFor === "next") {
      setNextSet(setItem)
    } else {
      setCurrentSet(setItem)
      setCookedIds(new Set())
      setShoppingItems(buildShoppingItems(setItem, fridgeItems))
    }
    setToastMessage(toast)
    navigate("kondate", true)
  }

  const renderScreen = () => {
    switch (screen) {
      case "auth":
        return (
          <AuthLandingScreen
            onLogin={() => navigate("login")}
            onSignup={() => navigate("signup")}
          />
        )
      case "login":
        return (
          <LoginScreen
            onBack={() => navigate("auth", true)}
            onOpenSignup={() => navigate("signup")}
            onSubmit={handleLogin}
          />
        )
      case "signup":
        return (
          <SignupScreen
            onBack={() => navigate("auth", true)}
            onOpenLogin={() => navigate("login")}
            onSubmit={handleSignup}
          />
        )
      case "auth-error":
        return (
          <AuthErrorScreen
            title={authError?.title}
            message={authError?.message}
            onBack={() => navigate("auth", true)}
          />
        )
      case "kondate":
        return (
          <KondateScreen
            currentSet={currentSet ?? undefined}
            nextSet={nextSet ?? undefined}
            recipes={kondateRecipes}
            onOpenRecipe={(id) => openRecipe(id, "kondate")}
            onSelectSet={() => {
              setSelectingFor("current")
              navigate("set-select")
            }}
            onChangeSet={() => {
              setSelectingFor("current")
              navigate("set-select")
            }}
            onResetCurrent={() => {
              setCurrentSet(null)
              setCookedIds(new Set())
              setShoppingItems([])
            }}
            onSelectNext={() => {
              setSelectingFor("next")
              navigate("set-select")
            }}
            onResetNext={() => setNextSet(null)}
            showShopping={shoppingItems.length > 0}
            shoppingCount={shoppingItems.length}
            onOpenShopping={() => setShoppingOpen(true)}
            onOpenNotifications={() => navigate("notifications")}
            onOpenFridge={() => setFridgeOpen(true)}
            onOpenHelp={() => navigate("onboarding")}
            onOpenHome={() => navigate("kondate", true)}
            onOpenCurrentSet={() => {
              if (currentSet) openSet(currentSet.id, "kondate")
            }}
            onOpenNextSet={() => {
              if (nextSet) openSet(nextSet.id, "kondate")
            }}
          />
        )
      case "book":
        return (
          <RecipeBookScreen
            categories={categories}
            followedAuthors={mockFollowedAuthors}
            onUpdateCategories={setCategories}
            onCreateCategory={createCategory}
            recipes={myRecipes}
            sets={mySets}
            onOpenRecipe={(id) => openRecipe(id, "book")}
            onCreateSet={() => {
              setSetTemplate(null)
              navigate("set-create")
            }}
            onCreateRecipe={() => navigate("recipe-add")}
            onOpenSet={(id) => openSet(id, "book")}
            onOpenNotifications={() => navigate("notifications")}
            onOpenFridge={() => setFridgeOpen(true)}
            onOpenHelp={() => navigate("onboarding")}
            onOpenHome={() => navigate("kondate", true)}
            onOpenChef={openChef}
          />
        )
      case "catalog":
        return (
          <RecipeCatalogScreen
            categories={categories}
            followedAuthors={mockFollowedAuthors}
            recipes={publicRecipes}
            sets={publicSets}
            savedRecipeIds={savedRecipeIds}
            savedSetIds={savedSetIds}
            onSaveRecipe={handleSaveRecipeFromCatalog}
            onPurchaseRecipe={(id) => openPurchaseConfirm("recipe", id)}
            onSaveSet={handleSaveSetFromCatalog}
            onPurchaseSet={(id) => openPurchaseConfirm("set", id)}
            onUpdateCategories={setCategories}
            onCreateCategory={createCategory}
            onOpenChef={openChef}
            membershipAvailable={membershipAvailable}
            onOpenRecipe={(id) => openRecipe(id, "catalog")}
            onOpenSet={(id) => openSet(id, "catalog")}
            onOpenNotifications={() => navigate("notifications")}
            onOpenFridge={() => setFridgeOpen(true)}
            onOpenHelp={() => navigate("onboarding")}
            onOpenHome={() => navigate("kondate", true)}
          />
        )
      case "mypage":
        return (
          <MyPageScreen
            onOpenNotifications={() => navigate("notifications")}
            onOpenFridge={() => setFridgeOpen(true)}
            onOpenHelp={() => navigate("onboarding")}
            onOpenHome={() => navigate("kondate", true)}
            onOpenPurchaseHistory={() => navigate("purchase")}
            onOpenPaymentHistory={() => navigate("payment")}
            onOpenCatalog={() => navigate("catalog")}
            onToast={setToastMessage}
            onOpenArchive={() => navigate("archive")}
            onLogout={() => setLogoutConfirm(true)}
          />
        )
      case "share-recipe":
        return (
          <ShareRecipeScreen
            recipe={shareRecipeView ?? recipeDetailMock}
            onBack={() => navigate("auth", true)}
          />
        )
      case "share-set":
        return (
          <ShareSetScreen
            recipeSet={shareSetView ?? recipeSetDetailMock}
            onBack={() => navigate("auth", true)}
          />
        )
      case "onboarding":
        return (
          <OnboardingScreen
            onStart={() => {
              setHasOnboarded(true)
              navigate("kondate", true)
            }}
          />
        )
      case "set-select":
        return (
          <SetSelectScreen
            sets={mySets}
            publicSets={publicSets}
            recipes={recipePool}
            fridgeItems={fridgeItems}
            selectingFor={selectingFor}
            membershipAvailable={membershipAvailable}
            onSelect={(setItem) => handleSelectSet(setItem)}
            onSelectLocked={(message) => setToastMessage(message)}
            onCreateSet={() => {
              setSetTemplate(null)
              navigate("set-create")
            }}
            onOpenRecipeBook={() => navigate("book")}
            onOpenRecipeCatalog={() => navigate("catalog")}
            onBack={goBack}
          />
        )
      case "set-create":
        return (
          <SetCreateScreen
            recipes={recipePool}
            templates={mySets}
            initialSet={setTemplate ?? undefined}
            onBack={() => {
              setSetTemplate(null)
              goBack()
            }}
            onSave={handleCreateSet}
          />
        )
      case "recipe-add":
        return <RecipeAddScreen onBack={goBack} onSave={handleCreateRecipe} />
      case "shopping":
        return (
          <ShoppingListScreen
            items={shoppingItems}
            onPurchase={handlePurchaseItem}
            onConfirm={handleConfirmPurchase}
            onAddExtra={handleAddExtraItem}
            onRemoveExtra={handleRemoveExtraItem}
            onBack={goBack}
          />
        )
      case "fridge":
        return (
          <FridgeScreen
            items={fridgeItems}
            deletedItems={deletedFridgeItems}
            onAddItem={handleAddFridgeItem}
            onDeleteItem={handleDeleteFridgeItem}
            onBack={goBack}
          />
        )
      case "notifications":
        return (
          <NotificationsScreen
            onBack={goBack}
            onOpenHome={() => navigate("kondate", true)}
            onOpenHelp={() => navigate("onboarding")}
            onOpenNotifications={() => navigate("notifications")}
            onOpenFridge={() => setFridgeOpen(true)}
            onOpenNews={(item) => {
              setActiveNews(item)
              navigate("news-detail")
            }}
          />
        )
      case "news-detail":
        return <NewsDetailScreen onBack={goBack} data={activeNews ?? undefined} />
      case "chef":
        return <ChefDetailScreen onBack={goBack} chefName={activeChef?.name} />
      case "membership-plans":
        return <MembershipPlansScreen onBack={goBack} />
      case "membership-detail":
        return <MembershipDetailScreen onBack={goBack} />
      case "archive":
        return <ArchiveScreen onBack={goBack} />
      case "diagnosis":
        return <DiagnosisScreen onBack={goBack} />
      case "purchase":
        return <PurchaseHistoryScreen onBack={goBack} />
      case "payment":
        return <PaymentHistoryScreen onBack={goBack} />
      default:
        return null
    }
  }

  return (
    <div>
      {renderScreen()}
      {!pwaDismissed && !pwaInstalled && isAuthenticated ? (
        <div className="fixed bottom-24 left-0 right-0 z-40 flex justify-center px-4">
          <div className="w-full max-w-[430px] rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
            <Stack gap="sm">
              <div className="text-sm font-semibold">ホーム画面に追加できます</div>
              <div className="text-xs text-muted-foreground">
                アプリのように素早く開けるようになります。
              </div>
              <Cluster gap="sm" justify="end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPwaDismissed(true)}
                >
                  あとで
                </Button>
                {pwaPromptEvent ? (
                  <Button variant="secondary" size="sm" onClick={handlePwaInstall}>
                    追加する
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setToastMessage("ブラウザの共有メニューから追加できます")}
                  >
                    追加方法
                  </Button>
                )}
              </Cluster>
            </Stack>
          </div>
        </div>
      ) : null}
      {isAuthenticated && rootScreens.includes(screen) ? (
        <BottomNav active={screen as NavItemKey} onChange={handleNav} />
      ) : null}
      <RecipeDetailModal
        open={selectedRecipeId !== null}
        onClose={closeRecipe}
        data={recipeDetailData}
        cooked={selectedRecipeId ? cookedIds.has(selectedRecipeId) : false}
        onToggleCooked={toggleCooked}
        footer={recipeLocked ? undefined : recipeFooter}
        onBackToSet={returnToSetId ? backToSetDetail : undefined}
        onOpenAuthor={
          recipeContext === "catalog" || setContext === "catalog"
            ? () => openChef(recipeDetailData.author)
            : undefined
        }
        locked={recipeLocked}
        lockedMessage={recipeLockedMessage}
        lockedActions={recipeLockedActions ?? undefined}
      />
      <RecipeSetDetailModal
        open={setDetailOpen && selectedSetId !== null}
        onClose={closeSet}
        data={setDetailData}
        footer={setLocked ? undefined : setFooter}
        locked={setLocked}
        lockedMessage={setLockedMessage}
        lockedActions={setLockedActions ?? undefined}
        onOpenAuthor={setContext === "catalog" ? () => openChef(setDetailData.author) : undefined}
        onOpenRecipe={(id) => {
          if (selectedSetId) {
            setReturnToSetId(selectedSetId)
          }
          setSetDetailOpen(false)
          openRecipe(id, "set")
        }}
      />
      <ShareModal
        open={shareTarget !== null}
        title={
          shareTarget?.type === "recipe"
            ? shareRecipe?.title ?? "レシピ"
            : shareSet?.title ?? "レシピセット"
        }
        typeLabel={shareTarget?.type === "recipe" ? "レシピ" : "レシピセット"}
        author={shareTarget?.type === "recipe" ? shareRecipe?.author : shareSet?.author}
        sourceUrl={shareTarget?.type === "recipe" ? shareRecipe?.sourceUrl : shareSet?.sourceUrl}
        onClose={closeShare}
        onSubmit={handleShareSubmit}
      />
      <ShareLinkModal
        open={shareLink !== null}
        title={shareLinkTitle}
        typeLabel={shareLinkTypeLabel}
        link={shareLink?.url ?? ""}
        onClose={() => setShareLink(null)}
        onCopy={() => setToastMessage("リンクをコピーしました")}
      />
      <ShoppingModal
        open={shoppingOpen}
        onClose={() => setShoppingOpen(false)}
        items={shoppingItems}
        onToggle={handlePurchaseItem}
        onConfirm={handleConfirmPurchase}
        onAddExtra={handleAddExtraItem}
        onRemoveExtra={handleRemoveExtraItem}
        unitOptions={unitOptions}
        onAddUnitOption={registerUnitOption}
      />
      <FridgeModal
        open={fridgeOpen}
        onClose={() => setFridgeOpen(false)}
        items={fridgeItems}
        deletedItems={deletedFridgeItems}
        onAddItem={handleAddFridgeItem}
        onDeleteItem={handleDeleteFridgeItem}
        unitOptions={unitOptions}
        onAddUnitOption={registerUnitOption}
      />
      {purchasePrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 text-center shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4 motion-safe:duration-200">
            <button
              type="button"
              aria-label="閉じる"
              onClick={closePurchasePrompt}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm text-muted-foreground"
            >
              ×
            </button>
            <div className="text-3xl">🎉</div>
            <div className="mt-3 text-base font-semibold">購入しました</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {purchasePrompt.type === "recipe" ? "レシピ" : "セット"}
            </div>
            <div className="mt-1 text-sm font-semibold">
              {purchasePrompt.type === "recipe"
                ? publicRecipes.find((item) => item.id === purchasePrompt.id)?.title ?? "購入アイテム"
                : publicSets.find((item) => item.id === purchasePrompt.id)?.title ?? "購入アイテム"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {purchasePrompt.type === "recipe"
                ? "購入したレシピをレシピ帳に保存しましょう"
                : "購入したレシピセットをレシピ帳に保存しましょう"}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button className="w-full rounded-full" onClick={handlePurchasePromptSave}>
                レシピ帳に保存
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {purchaseConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 text-center shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4 motion-safe:duration-200">
            <button
              type="button"
              aria-label="閉じる"
              onClick={closePurchaseConfirm}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm text-muted-foreground"
            >
              ×
            </button>
            <div className="text-base font-semibold">購入しますか？</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {purchaseConfirm.priceLabel
                ? `${purchaseConfirm.priceLabel}の${purchaseConfirm.type === "recipe" ? "レシピ" : "レシピセット"}を購入します`
                : "このアイテムを購入します"}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button className="w-full rounded-full" onClick={handleConfirmPurchaseIntent}>
                購入する
              </Button>
              <Button variant="ghost" className="w-full rounded-full" onClick={closePurchaseConfirm}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {logoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 text-center shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4 motion-safe:duration-200">
            <div className="text-base font-semibold">ログアウトしますか？</div>
            <div className="mt-2 text-sm text-muted-foreground">
              ログアウトするとトップページに戻ります。
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  setLogoutConfirm(false)
                  handleLogout()
                }}
              >
                ログアウトする
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => setLogoutConfirm(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {toastMessage ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="toast-pop rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
      {completionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 text-center shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4 motion-safe:duration-200">
            <div className="text-3xl">🎉</div>
            <div className="mt-3 text-base font-semibold">献立を完了しました！</div>
            <div className="mt-2 text-sm text-muted-foreground">
              おつかれさま！<br />
              全ての料理を作りました。<br />
              次の献立を選びましょう。
            </div>
            <Button className="mt-5 w-full rounded-full" onClick={completeCurrentSet}>
              閉じる
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
