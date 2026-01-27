export const sortOptions = ["おすすめ順", "新着順", "人気順"] as const

export const filterGroups = {
  status: ["購入済み", "フリー", "有料"],
  time: ["15分以内", "30分以内", "45分以内"],
  tag: ["時短", "ヘルシー", "子ども向け", "作り置き", "節約"],
  rating: ["保存数トップ10", "保存数トップ30", "新着"],
  follow: ["フォロー中"],
} as const

export type FilterGroupKey = keyof typeof filterGroups
