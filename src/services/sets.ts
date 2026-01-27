import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import { mockSets, mockPublicSets } from "@/data/mockData"
import type { RecipeSet } from "@/types/api"

export async function listRecipeBookSets(): Promise<RecipeSet[]> {
  if (API_USE_MOCK) {
    return mockSets
  }

  return apiFetch<RecipeSet[]>("/recipe-book/sets")
}

export async function listCatalogSets(): Promise<RecipeSet[]> {
  if (API_USE_MOCK) {
    return mockPublicSets
  }

  return apiFetch<RecipeSet[]>("/catalog/sets")
}
