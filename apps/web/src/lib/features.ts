/**
 * フィーチャーフラグ設定
 *
 * MVP: CATALOG_ENABLED=false, MYPAGE_ENABLED=false
 * フルリリース: CATALOG_ENABLED=true, MYPAGE_ENABLED=true
 */

export const FEATURES = {
  /** レシピカタログ画面の有効/無効 */
  CATALOG_ENABLED: import.meta.env.VITE_FEATURE_CATALOG === 'true',

  /** マイページ画面の有効/無効 */
  MYPAGE_ENABLED: import.meta.env.VITE_FEATURE_MYPAGE === 'true',
} as const

/**
 * MVPモードかどうかを判定
 * カタログとマイページが両方無効の場合はMVPモード
 */
export const isMvpMode = () => !FEATURES.CATALOG_ENABLED && !FEATURES.MYPAGE_ENABLED
