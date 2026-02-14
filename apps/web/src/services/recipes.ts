import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import { mockRecipes, mockPublicRecipes } from "@/data/mockData"
import type { Recipe } from "@/types/api"

type BackendRecipe = {
  id: string
  title: string
  authorName?: string | null
  thumbnailUrl?: string | null
  sourceUrl?: string | null
  tags?: string[]
  cookTimeMinutes?: number | null
  savedCount?: number
  createdAt?: string
  ingredients?: Array<{
    name: string
    quantity: number
    unit: string
  }>
}

type ListApiResponse<T> = {
  data: {
    items: T[]
  }
}

function resolveFreeBadge(): NonNullable<Recipe["statusBadges"]>[number] {
  for (const recipe of mockPublicRecipes) {
    for (const badge of recipe.statusBadges ?? []) {
      if (badge.variant === "free") {
        return { label: badge.label, variant: "free" }
      }
    }
  }
  return { label: "free", variant: "free" }
}

const FREE_BADGE = resolveFreeBadge()

function mapRecipe(item: BackendRecipe): Recipe {
  const ingredients = item.ingredients?.map((ingredient) => ({
    name: ingredient.name,
    amount: ingredient.quantity,
    unit: ingredient.unit,
  }))

  return {
    id: item.id,
    title: item.title,
    author: item.authorName ?? undefined,
    imageUrl: item.thumbnailUrl ?? undefined,
    sourceUrl: item.sourceUrl ?? undefined,
    tags: item.tags ?? [],
    cookTimeMinutes: item.cookTimeMinutes ?? undefined,
    savedCount: item.savedCount ?? 0,
    createdAt: item.createdAt,
    statusBadges: [FREE_BADGE],
    ...(ingredients ? { ingredients } : {}),
  } as Recipe
}

export async function listRecipeBookRecipes(): Promise<Recipe[]> {
  if (API_USE_MOCK) {
    return mockRecipes
  }

  const response = await apiFetch<ListApiResponse<BackendRecipe>>("/v1/recipes")
  return response.data.items.map(mapRecipe)
}

export async function listCatalogRecipes(): Promise<Recipe[]> {
  if (API_USE_MOCK) {
    return mockPublicRecipes
  }

  const response = await apiFetch<ListApiResponse<BackendRecipe>>("/v1/recipes")
  return response.data.items.map(mapRecipe)
}
