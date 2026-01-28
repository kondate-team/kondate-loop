import * as React from "react"

import { ScreenContainer } from "@/components/layout/ScreenContainer"
import { HeaderBar } from "@/components/layout/HeaderBar"
import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Body, Muted } from "@/components/primitives/Typography"
import { StatusBadge } from "@/components/domain/StatusBadge"
import { RecipeCard } from "@/components/domain/RecipeCard"

type ShareRecipe = {
  title: string
  author?: string
  sourceUrl?: string
  tags?: string[]
  imageUrl?: string
  servings?: string
  ingredients?: string[] | { name: string; amount: number; unit: string }[]
  steps?: string[]
  statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
}

type ShareRecipeSet = {
  title: string
  author?: string
  description?: string
  count?: number
  tags?: string[]
  imageUrl?: string
  statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
  recipes?: {
    id: string
    title: string
    author?: string
    tags?: string[]
    statusBadges?: { label: string; variant: React.ComponentProps<typeof StatusBadge>["variant"] }[]
    imageUrl?: string
  }[]
}

const normalizeIngredients = (
  value?: ShareRecipe["ingredients"]
): string[] => {
  if (!value || value.length === 0) return ["材料の詳細はアプリで確認できます"]
  if (typeof value[0] === "string") return value as string[]
  return (value as { name: string; amount: number; unit: string }[]).map(
    (item) => `${item.name} ${item.amount}${item.unit}`
  )
}

const ensureMetaTag = (key: string, value: string, attr: "name" | "property") => {
  const selector = `meta[${attr}="${key}"]`
  let element = document.querySelector(selector)
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute("content", value)
}

const useShareMeta = (params: {
  title: string
  description: string
  imageUrl?: string
}) => {
  React.useEffect(() => {
    const pageTitle = `${params.title} | こんだてLoop`
    document.title = pageTitle
    ensureMetaTag("description", params.description, "name")
    ensureMetaTag("og:title", pageTitle, "property")
    ensureMetaTag("og:description", params.description, "property")
    ensureMetaTag("og:type", "article", "property")
    if (params.imageUrl) {
      ensureMetaTag("og:image", params.imageUrl, "property")
    }
  }, [params.description, params.imageUrl, params.title])
}

export function ShareRecipeScreen({
  recipe,
  onBack,
}: {
  recipe: ShareRecipe
  onBack?: () => void
}) {
  const ingredients = normalizeIngredients(recipe.ingredients)
  const steps = recipe.steps?.length ? recipe.steps : ["作り方はアプリで確認できます"]
  const description = recipe.tags?.length
    ? `${recipe.tags.join("・")} のレシピです`
    : "こんだてLoopで共有されたレシピです"

  useShareMeta({
    title: recipe.title,
    description,
    imageUrl: recipe.imageUrl,
  })

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="共有レシピ" onBack={onBack} />
      <main className="px-5 pb-10 pt-4">
        <Stack gap="lg">
          <Surface tone="card" density="comfy" className="rounded-2xl">
            <Stack gap="md">
              <div className="overflow-hidden rounded-xl border border-border bg-muted">
                <div className="aspect-[16/9] w-full">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🍲
                    </div>
                  )}
                </div>
              </div>
              <Stack gap="xs">
                <H2 className="text-lg">{recipe.title}</H2>
                {recipe.author ? <Muted className="text-xs">作成者: {recipe.author}</Muted> : null}
                {recipe.sourceUrl ? (
                  <Muted className="break-all text-xs">{recipe.sourceUrl}</Muted>
                ) : null}
                {recipe.statusBadges?.length ? (
                  <Cluster gap="xs" className="flex-wrap">
                    {recipe.statusBadges.map((badge) => (
                      <StatusBadge key={badge.label} variant={badge.variant}>
                        {badge.label}
                      </StatusBadge>
                    ))}
                  </Cluster>
                ) : null}
                {recipe.tags?.length ? (
                  <Muted className="text-xs">{recipe.tags.join(" ")}</Muted>
                ) : null}
              </Stack>
            </Stack>
          </Surface>

          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="md">
              {recipe.servings ? (
                <Surface tone="inset" density="compact">
                  <Body className="text-sm">{recipe.servings}</Body>
                </Surface>
              ) : null}
              <Stack gap="sm">
                <H3 className="text-base">材料</H3>
                <Stack gap="xs">
                  {ingredients.map((item) => (
                    <div key={item} className="border-b border-border/60 pb-2 text-sm">
                      {item}
                    </div>
                  ))}
                </Stack>
              </Stack>
              <Stack gap="sm">
                <H3 className="text-base">作り方</H3>
                <Stack gap="xs">
                  {steps.map((item, idx) => (
                    <div key={`${idx}-${item}`} className="border-b border-border/60 pb-2 text-sm">
                      {idx + 1}. {item}
                    </div>
                  ))}
                </Stack>
              </Stack>
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3">
                <Muted className="text-xs">
                  もっと詳しく見るには、こんだてLoopアプリで開いてください。
                </Muted>
              </div>
            </Stack>
          </Surface>
        </Stack>
      </main>
    </ScreenContainer>
  )
}

export function ShareSetScreen({
  recipeSet,
  onBack,
}: {
  recipeSet: ShareRecipeSet
  onBack?: () => void
}) {
  const description =
    recipeSet.description ??
    (recipeSet.tags?.length
      ? `${recipeSet.tags.join("・")} の献立セットです`
      : "こんだてLoopで共有されたセットです")

  useShareMeta({
    title: recipeSet.title,
    description,
    imageUrl: recipeSet.imageUrl,
  })

  return (
    <ScreenContainer>
      <HeaderBar variant="sub" title="共有セット" onBack={onBack} />
      <main className="px-5 pb-10 pt-4">
        <Stack gap="lg">
          <Surface tone="card" density="comfy" className="rounded-2xl">
            <Stack gap="md">
              <div className="overflow-hidden rounded-xl border border-border bg-muted">
                <div className="aspect-[16/9] w-full">
                  {recipeSet.imageUrl ? (
                    <img
                      src={recipeSet.imageUrl}
                      alt={recipeSet.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🧺
                    </div>
                  )}
                </div>
              </div>
              <Stack gap="xs">
                <H2 className="text-lg">{recipeSet.title}</H2>
                {recipeSet.author ? (
                  <Muted className="text-xs">作成者: {recipeSet.author}</Muted>
                ) : null}
                {recipeSet.statusBadges?.length ? (
                  <Cluster gap="xs" className="flex-wrap">
                    {recipeSet.statusBadges.map((badge) => (
                      <StatusBadge key={badge.label} variant={badge.variant}>
                        {badge.label}
                      </StatusBadge>
                    ))}
                  </Cluster>
                ) : null}
                {recipeSet.tags?.length ? (
                  <Muted className="text-xs">{recipeSet.tags.join(" ")}</Muted>
                ) : null}
                {recipeSet.description ? (
                  <Body className="text-sm text-muted-foreground">{recipeSet.description}</Body>
                ) : null}
              </Stack>
            </Stack>
          </Surface>

          <Surface tone="section" density="comfy" className="border-transparent">
            <Stack gap="sm">
              <H3 className="text-base">セットに入っているレシピ</H3>
              {recipeSet.recipes?.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {recipeSet.recipes.map((recipe) => (
                    <div key={recipe.id} className="w-[140px]">
                      <RecipeCard
                        title={recipe.title}
                        author={recipe.author}
                        tags={recipe.tags}
                        statusBadges={recipe.statusBadges}
                        imageUrl={recipe.imageUrl}
                        variant="saved"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Muted className="text-xs">レシピ一覧はアプリで確認できます。</Muted>
              )}
            </Stack>
          </Surface>
        </Stack>
      </main>
    </ScreenContainer>
  )
}
