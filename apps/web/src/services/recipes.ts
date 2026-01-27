import { API_USE_MOCK } from "@/api/config"
import { apiFetch } from "@/api/client"
import { mockRecipes, mockPublicRecipes } from "@/data/mockData"
import type { Recipe } from "@/types/api"

export async function listRecipeBookRecipes(): Promise<Recipe[]> {
  if (API_USE_MOCK) {
    return mockRecipes
  }

  return apiFetch<Recipe[]>("/recipe-book/recipes")
}

export async function listCatalogRecipes(): Promise<Recipe[]> {
  if (API_USE_MOCK) {
    return mockPublicRecipes
  }

  return apiFetch<Recipe[]>("/catalog/recipes")
}
