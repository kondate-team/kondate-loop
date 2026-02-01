export type StatusBadgeVariant = "free" | "purchased" | "price" | "membership" | "status"

export type StatusBadge = {
  label: string
  variant: StatusBadgeVariant
}

export type Recipe = {
  id: string
  title: string
  author?: string
  imageUrl?: string
  sourceUrl?: string
  tags?: string[]
  cookTimeMinutes?: number
  savedCount?: number
  createdAt?: string
  statusBadges?: StatusBadge[]
}

export type RecipeSet = {
  id: string
  title: string
  author?: string
  count: number
  imageUrl?: string
  sourceUrl?: string
  tags?: string[]
  savedCount?: number
  createdAt?: string
  statusBadges?: StatusBadge[]
  recipeIds?: string[]
}

export type ApiUserRole = "user" | "user_plus" | "creator" | "creator_plus"

export type ApiUser = {
  id: string
  name: string
  role: ApiUserRole
  avatarUrl?: string
}

export type ApiResponse<T> = {
  data: T
  meta?: Record<string, unknown>
}
