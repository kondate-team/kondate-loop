export const recipeCategories = [
  {
    id: "all",
    label: "全て",
    isDefault: true,
    colorClass: "bg-muted/30",
    activeColorClass: "bg-muted/50",
    textClass: "text-foreground",
    panelClass: "bg-muted/30",
    panelRecipeClass: "bg-muted/25",
    panelSetClass: "bg-muted/20",
  },
  {
    id: "japanese",
    label: "和食",
    isDefault: true,
    colorClass: "bg-amber-100/70",
    activeColorClass: "bg-amber-200/70",
    textClass: "text-amber-900",
    panelClass: "bg-amber-50",
    panelRecipeClass: "bg-amber-50",
    panelSetClass: "bg-amber-100/60",
  },
  {
    id: "western",
    label: "洋食",
    isDefault: true,
    colorClass: "bg-rose-100/70",
    activeColorClass: "bg-rose-200/70",
    textClass: "text-rose-900",
    panelClass: "bg-rose-50",
    panelRecipeClass: "bg-rose-50",
    panelSetClass: "bg-rose-100/60",
  },
  {
    id: "chinese",
    label: "中華",
    isDefault: true,
    colorClass: "bg-emerald-100/70",
    activeColorClass: "bg-emerald-200/70",
    textClass: "text-emerald-900",
    panelClass: "bg-emerald-50",
    panelRecipeClass: "bg-emerald-50",
    panelSetClass: "bg-emerald-100/60",
  },
  {
    id: "quick",
    label: "時短",
    isDefault: true,
    colorClass: "bg-sky-100/70",
    activeColorClass: "bg-sky-200/70",
    textClass: "text-sky-900",
    panelClass: "bg-sky-50",
    panelRecipeClass: "bg-sky-50",
    panelSetClass: "bg-sky-100/60",
  },
  {
    id: "korean",
    label: "韓国",
    isDefault: true,
    colorClass: "bg-purple-100/70",
    activeColorClass: "bg-purple-200/70",
    textClass: "text-purple-900",
    panelClass: "bg-purple-50",
    panelRecipeClass: "bg-purple-50",
    panelSetClass: "bg-purple-100/60",
  },
  {
    id: "ethnic",
    label: "エスニック",
    isDefault: true,
    colorClass: "bg-lime-100/70",
    activeColorClass: "bg-lime-200/70",
    textClass: "text-lime-900",
    panelClass: "bg-lime-50",
    panelRecipeClass: "bg-lime-50",
    panelSetClass: "bg-lime-100/60",
  },
  {
    id: "dessert",
    label: "スイーツ",
    isDefault: true,
    colorClass: "bg-pink-100/70",
    activeColorClass: "bg-pink-200/70",
    textClass: "text-pink-900",
    panelClass: "bg-pink-50",
    panelRecipeClass: "bg-pink-50",
    panelSetClass: "bg-pink-100/60",
  },
]

export const mockRecipes = [
  {
    id: "r1",
    title: "甘辛チキンと焼き野菜",
    author: "Kondatelab",
    sourceUrl: "https://example.com/recipe",
    tags: ["時短", "定番", "冬こそ", "30分以内"],
    cookTimeMinutes: 25,
    savedCount: 120,
    createdAt: "2026-01-20T09:00:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "鶏もも肉", amount: 2, unit: "枚" },
      { name: "パプリカ", amount: 1, unit: "個" },
      { name: "醤油", amount: 2, unit: "大さじ" },
      { name: "みりん", amount: 2, unit: "大さじ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r2",
    title: "鮭ときのこのバター醤油",
    author: "やまねこ",
    tags: ["和食", "定番", "30分以内"],
    cookTimeMinutes: 30,
    savedCount: 80,
    createdAt: "2026-01-18T12:00:00.000Z",
    statusBadges: [{ label: "購入済み", variant: "purchased" as const }],
    ingredients: [
      { name: "鮭", amount: 2, unit: "切れ" },
      { name: "しめじ", amount: 1, unit: "袋" },
      { name: "バター", amount: 20, unit: "g" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r3",
    title: "豆腐とひき肉の旨辛丼",
    author: "こんだて研究所",
    tags: ["中華", "節約", "15分以内"],
    cookTimeMinutes: 15,
    savedCount: 95,
    createdAt: "2026-01-22T18:30:00.000Z",
    statusBadges: [{ label: "購入済み", variant: "purchased" as const }],
    ingredients: [
      { name: "豆腐", amount: 1, unit: "丁" },
      { name: "ひき肉", amount: 200, unit: "g" },
      { name: "長ねぎ", amount: 1, unit: "本" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r4",
    title: "トマトとバジルのパスタ",
    author: "Kondatelab",
    tags: ["洋食", "定番", "30分以内"],
    cookTimeMinutes: 30,
    savedCount: 60,
    createdAt: "2026-01-10T10:15:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "パスタ", amount: 200, unit: "g" },
      { name: "トマト缶", amount: 1, unit: "缶" },
      { name: "バジル", amount: 1, unit: "束" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r5",
    title: "韓国風キンパ",
    author: "キッチンA",
    tags: ["韓国", "作り置き", "45分以内"],
    cookTimeMinutes: 40,
    savedCount: 45,
    createdAt: "2026-01-08T08:45:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "海苔", amount: 3, unit: "枚" },
      { name: "ごはん", amount: 2, unit: "杯" },
      { name: "人参", amount: 1, unit: "本" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r6",
    title: "エスニックチキンカレー",
    author: "スパイス研",
    tags: ["エスニック", "辛め", "45分以内"],
    cookTimeMinutes: 45,
    savedCount: 30,
    createdAt: "2025-12-20T17:20:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "鶏もも肉", amount: 1, unit: "枚" },
      { name: "玉ねぎ", amount: 1, unit: "個" },
      { name: "カレー粉", amount: 2, unit: "大さじ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r7",
    title: "ほうれん草の胡麻和え",
    author: "やまねこ",
    tags: ["和食", "副菜", "時短", "15分以内"],
    cookTimeMinutes: 10,
    savedCount: 70,
    createdAt: "2026-01-05T07:30:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "ほうれん草", amount: 1, unit: "束" },
      { name: "すりごま", amount: 2, unit: "大さじ" },
      { name: "醤油", amount: 1, unit: "大さじ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "r8",
    title: "濃厚チーズケーキ",
    author: "パティシエM",
    tags: ["スイーツ", "ごほうび", "45分以内"],
    cookTimeMinutes: 50,
    savedCount: 20,
    createdAt: "2025-12-15T20:00:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "クリームチーズ", amount: 200, unit: "g" },
      { name: "卵", amount: 2, unit: "個" },
      { name: "砂糖", amount: 50, unit: "g" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80",
  },
]

// テスト用クリエイターID（実際のStripe Connect AccountのuserIdに対応）
export const MOCK_CREATOR_IDS = {
  kondatelab: "creator-kondatelab",
  kitchenA: "creator-kitchen-a",
  spice: "creator-spice",
  patissier: "creator-patissier",
}

export const mockPublicRecipes = [
  {
    id: "p1",
    title: "週末ごちそうハンバーグ",
    author: "Kondatelab",
    creatorId: MOCK_CREATOR_IDS.kondatelab,
    price: 680,
    sourceUrl: "https://example.com/recipe",
    tags: ["洋食", "ごちそう", "45分以内"],
    cookTimeMinutes: 45,
    savedCount: 140,
    createdAt: "2026-01-24T11:10:00.000Z",
    statusBadges: [{ label: "¥680", variant: "price" as const }],
    ingredients: [
      { name: "合い挽き肉", amount: 300, unit: "g" },
      { name: "玉ねぎ", amount: 1, unit: "個" },
      { name: "パン粉", amount: 30, unit: "g" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p2",
    title: "韓国風キンパ",
    author: "キッチンA",
    creatorId: MOCK_CREATOR_IDS.kitchenA,
    price: 480,
    tags: ["韓国", "作り置き", "45分以内"],
    cookTimeMinutes: 40,
    savedCount: 110,
    createdAt: "2026-01-21T09:40:00.000Z",
    statusBadges: [
      { label: "¥480", variant: "price" as const },
      { label: "限定", variant: "membership" as const },
    ],
    ingredients: [
      { name: "海苔", amount: 3, unit: "枚" },
      { name: "ごはん", amount: 2, unit: "杯" },
      { name: "人参", amount: 1, unit: "本" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p3",
    title: "スパイス香るココナッツカレー",
    author: "スパイス研",
    tags: ["エスニック", "辛め", "45分以内"],
    cookTimeMinutes: 50,
    savedCount: 90,
    createdAt: "2026-01-15T19:00:00.000Z",
    statusBadges: [{ label: "限定", variant: "membership" as const }],
    ingredients: [
      { name: "鶏もも肉", amount: 1, unit: "枚" },
      { name: "ココナッツミルク", amount: 1, unit: "缶" },
      { name: "カレー粉", amount: 2, unit: "大さじ" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p4",
    title: "濃厚チーズケーキ",
    author: "パティシエM",
    tags: ["スイーツ", "ごほうび", "45分以内"],
    cookTimeMinutes: 50,
    savedCount: 75,
    createdAt: "2026-01-12T13:20:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    ingredients: [
      { name: "クリームチーズ", amount: 200, unit: "g" },
      { name: "卵", amount: 2, unit: "個" },
      { name: "砂糖", amount: 50, unit: "g" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80",
  },
  ...mockRecipes,
]

export const mockSets = [
  {
    id: "s1",
    title: "平日5日ゆるっとセット",
    count: 5,
    recipeIds: ["r1", "r2", "r3"],
    author: "Kondatelab",
    sourceUrl: "https://example.com/set",
    tags: ["時短", "定番", "和食"],
    savedCount: 110,
    createdAt: "2026-01-19T08:00:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s2",
    title: "週末ごちそうセット",
    count: 3,
    recipeIds: ["r2", "r3"],
    author: "やまねこ",
    tags: ["ごちそう", "洋食"],
    savedCount: 95,
    createdAt: "2026-01-14T09:30:00.000Z",
    statusBadges: [{ label: "¥480", variant: "price" as const }],
    imageUrl:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s3",
    title: "お弁当4日セット",
    count: 4,
    recipeIds: ["r4", "r7", "r5", "r1"],
    author: "Kondatelab",
    tags: ["作り置き", "時短", "和食"],
    savedCount: 70,
    createdAt: "2026-01-07T11:45:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    imageUrl:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
  },
]

export const mockPublicSets = [
  {
    id: "ps1",
    title: "週末ごちそうセット",
    count: 3,
    recipeIds: ["p1", "p2", "p4"],
    author: "Kondatelab",
    creatorId: MOCK_CREATOR_IDS.kondatelab,
    price: 680,
    sourceUrl: "https://example.com/set",
    tags: ["ごちそう", "洋食"],
    savedCount: 130,
    createdAt: "2026-01-23T12:00:00.000Z",
    statusBadges: [{ label: "¥680", variant: "price" as const }],
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ps2",
    title: "韓国おうちごはんセット",
    count: 3,
    recipeIds: ["p2", "r5", "r7"],
    author: "キッチンA",
    creatorId: MOCK_CREATOR_IDS.kitchenA,
    price: 480,
    tags: ["韓国", "定番"],
    savedCount: 85,
    createdAt: "2026-01-17T15:30:00.000Z",
    statusBadges: [
      { label: "¥480", variant: "price" as const },
      { label: "限定", variant: "membership" as const },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ps3",
    title: "ごほうびスイーツセット",
    count: 2,
    recipeIds: ["p4", "r8"],
    author: "パティシエM",
    tags: ["スイーツ"],
    savedCount: 60,
    createdAt: "2026-01-09T17:00:00.000Z",
    statusBadges: [{ label: "フリー", variant: "free" as const }],
    imageUrl:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80",
  },
]

export const mockShoppingItems = [
  { id: "i1", name: "鶏もも肉", amount: 2, unit: "枚" },
  { id: "i2", name: "長ねぎ", amount: 1, unit: "本" },
  { id: "i3", name: "バター", amount: 20, unit: "g" },
]

export const mockFridgeItems = [
  { id: "f1", name: "卵", amount: 6, unit: "個" },
  { id: "f2", name: "牛乳", amount: 1, unit: "本" },
]

export const mockFollowedAuthors = ["Kondatelab", "やまねこ"]

export const recipeDetailMock = {
  title: "甘辛チキンと焼き野菜",
  author: "Kondatelab",
  sourceUrl: "https://example.com/recipe",
  tags: ["時短", "定番"],
  statusBadges: [{ label: "フリー", variant: "free" as const }],
  imageUrl:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
  servings: "2人前",
  ingredients: ["鶏もも肉 2枚", "パプリカ 1個", "醤油 大さじ2", "みりん 大さじ2"],
  materials: ["甘辛だれ（醤油/みりん/砂糖）"],
  steps: [
    "鶏肉を一口大に切る",
    "フライパンで焼き色をつける",
    "野菜を加えて炒める",
    "調味料を絡めて仕上げる",
  ],
}

export const recipeSetDetailMock = {
  title: "平日5日ゆるっとセット",
  author: "Kondatelab",
  description: "平日の献立をまとめた時短5日セット",
  count: 5,
  tags: ["時短", "定番"],
  statusBadges: [{ label: "フリー", variant: "free" as const }],
  imageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
  recipes: [
    {
      id: "r1",
      title: "甘辛チキンと焼き野菜",
      author: "Kondatelab",
      tags: ["時短", "定番"],
      statusBadges: [{ label: "フリー", variant: "free" as const }],
      imageUrl:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "r2",
      title: "鮭ときのこのバター醤油",
      author: "やまねこ",
      tags: ["和食", "定番"],
      statusBadges: [{ label: "購入済み", variant: "purchased" as const }],
      imageUrl:
        "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "r3",
      title: "豆腐とひき肉の旨辛丼",
      author: "こんだて研究所",
      tags: ["中華", "節約"],
      statusBadges: [{ label: "フリー", variant: "free" as const }],
      imageUrl:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    },
  ],
}
