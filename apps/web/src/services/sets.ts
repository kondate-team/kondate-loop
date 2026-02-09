import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import { mockSets, mockPublicSets } from "@/data/mockData"
import type { RecipeSet } from "@/types/api"

type BackendSet = {
  id: string
  title: string
  authorName?: string | null
  thumbnailUrl?: string | null
  sourceUrl?: string | null
  tags?: string[]
  recipeIds?: string[]
  savedCount?: number
  createdAt?: string
}

type ListApiResponse<T> = {
  data: {
    items: T[]
  }
}

function resolveFreeBadge(): NonNullable<RecipeSet["statusBadges"]>[number] {
  for (const setItem of mockPublicSets) {
    for (const badge of setItem.statusBadges ?? []) {
      if (badge.variant === "free") {
        return { label: badge.label, variant: "free" }
      }
    }
  }
  return { label: "free", variant: "free" }
}

const FREE_BADGE = resolveFreeBadge()

function mapSet(item: BackendSet): RecipeSet {
  const recipeIds = item.recipeIds ?? []
  return {
    id: item.id,
    title: item.title,
    author: item.authorName ?? undefined,
    count: recipeIds.length,
    imageUrl: item.thumbnailUrl ?? undefined,
    sourceUrl: item.sourceUrl ?? undefined,
    tags: item.tags ?? [],
    savedCount: item.savedCount ?? 0,
    createdAt: item.createdAt,
    statusBadges: [FREE_BADGE],
    recipeIds,
  }
}

export async function listRecipeBookSets(): Promise<RecipeSet[]> {
  if (API_USE_MOCK) {
    return mockSets
  }

  const response = await apiFetch<ListApiResponse<BackendSet>>("/v1/sets")
  return response.data.items.map(mapSet)
}

export async function listCatalogSets(): Promise<RecipeSet[]> {
  if (API_USE_MOCK) {
    return mockPublicSets
  }

  const response = await apiFetch<ListApiResponse<BackendSet>>("/v1/sets")
  return response.data.items.map(mapSet)
}
