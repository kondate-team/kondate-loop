import * as React from "react"
import { CreditCard, UserRound, Loader2 } from "lucide-react"

import { ScreenContainer } from "@/components/layout/ScreenContainer"
import { StripeCardInput } from "@/components/StripeCardInput"
import {
  registerPaymentMethod,
  createSubscription,
  purchasePlan,
  createConnectAccount,
  createConnectAccountLink,
  getConnectAccountStatus,
  createConnectLoginLink,
} from "@/api/payment"
import { HeaderBar } from "@/components/layout/HeaderBar"
import { HeaderActions } from "@/components/layout/HeaderActions"
import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, H3, Body, Muted } from "@/components/primitives/Typography"
import { SectionHeader } from "@/components/primitives/SectionHeader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  isPushSupported,
  requestPushToken,
  getStoredPushToken,
  clearPushToken,
} from "@/lib/push"

export function MyPageScreen({
  onOpenNotifications,
  onOpenFridge,
  onOpenHelp,
  onOpenHome,
  onOpenPurchaseHistory,
  onOpenPaymentHistory,
  onOpenCatalog,
  onToast,
  onOpenArchive,
  onLogout,
  // カード情報（App全体で共有）
  hasPaymentMethod,
  cardLast4: cardLast4Prop,
  cardBrand: cardBrandProp,
  onPaymentMethodChange,
}: {
  onOpenNotifications?: () => void
  onOpenFridge?: () => void
  onOpenHelp?: () => void
  onOpenHome?: () => void
  onOpenPurchaseHistory?: () => void
  onOpenPaymentHistory?: () => void
  onOpenCatalog?: () => void
  onToast?: (message: string) => void
  onOpenArchive?: () => void
  onLogout?: () => void
  // カード情報（App全体で共有）
  hasPaymentMethod?: boolean
  cardLast4?: string | null
  cardBrand?: string | null
  onPaymentMethodChange?: (hasPayment: boolean, last4: string | null, brand: string | null) => void
}) {
  const planOptions = [
    { id: "user", label: "ユーザー", price: "無料" },
    { id: "user_plus", label: "ユーザー+", price: "月額 ¥500" },
    { id: "creator", label: "クリエイター", price: "買い切り ¥1,200" },
    { id: "creator_plus", label: "クリエイター+", price: "月額 ¥800" },
  ] as const
  type PlanId = (typeof planOptions)[number]["id"]
  const planDetails: Record<
    PlanId,
    { summary: string; allowed: string[]; blocked: string[] }
  > = {
    user: {
      summary: "基本機能を無料で利用できます。",
      allowed: ["献立表 / レシピ帳", "レシピカタログ閲覧", "有料レシピ購入", "AI取り込み 月10回"],
      blocked: ["レシピ投稿", "有料レシピ販売", "メンバーシップ作成"],
    },
    user_plus: {
      summary: "AIをたくさん使いたい方向け。",
      allowed: ["献立表 / レシピ帳", "レシピカタログ閲覧", "有料レシピ購入", "AI取り込み 月100回"],
      blocked: ["レシピ投稿", "有料レシピ販売", "メンバーシップ作成"],
    },
    creator: {
      summary: "レシピの発信を始めたい方向け。",
      allowed: ["無料レシピ投稿", "無料レシピセット投稿", "有料レシピセット販売", "AI取り込み 月10回"],
      blocked: ["有料レシピ販売", "メンバーシップ作成"],
    },
    creator_plus: {
      summary: "収益化を最大化したい方向け。",
      allowed: ["有料レシピ販売", "有料レシピセット販売", "メンバーシップ作成", "AI取り込み 月100回"],
      blocked: [],
    },
  }
  const [tab, setTab] = React.useState<"profile" | "settings">("profile")
  const [pushEnabled, setPushEnabled] = React.useState(() => {
    if (typeof Notification === "undefined") return false
    return Notification.permission === "granted"
  })
  const [pushPending, setPushPending] = React.useState(false)
  const [pushToken, setPushToken] = React.useState<string | null>(null)
  const [plan, setPlan] = React.useState<PlanId>("user")
  const [planOpen, setPlanOpen] = React.useState(false)
  const [planPending, setPlanPending] = React.useState<PlanId | null>(null)
  const [planCheckoutOpen, setPlanCheckoutOpen] = React.useState(false)
  const [planChanged, setPlanChanged] = React.useState<PlanId | null>(null)
  const activePlan = planOptions.find((item) => item.id === plan) ?? planOptions[0]
  const accountType = plan.startsWith("creator") ? "creator" : "user"
  const selectedPlanId = planPending ?? plan
  const selectedPlan = planOptions.find((item) => item.id === selectedPlanId) ?? activePlan
  const selectedPlanDetail = planDetails[selectedPlanId]
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  // propsがある場合はpropsを使用、なければローカル状態
  const [hasPaymentLocal, setHasPaymentLocal] = React.useState(false)
  const [cardLast4Local, setCardLast4Local] = React.useState<string | null>(null)
  const [cardBrandLocal, setCardBrandLocal] = React.useState<string | null>(null)

  // propsが渡されている場合はpropsを優先
  const hasPayment = hasPaymentMethod ?? hasPaymentLocal
  const cardLast4 = cardLast4Prop ?? cardLast4Local
  const cardBrand = cardBrandProp ?? cardBrandLocal

  // カード情報を更新するヘルパー（propsがあればApp全体を更新、なければローカル更新）
  const updatePaymentInfo = React.useCallback((newHasPayment: boolean, newLast4: string | null, newBrand: string | null) => {
    if (onPaymentMethodChange) {
      onPaymentMethodChange(newHasPayment, newLast4, newBrand)
    } else {
      setHasPaymentLocal(newHasPayment)
      setCardLast4Local(newLast4)
      setCardBrandLocal(newBrand)
    }
  }, [onPaymentMethodChange])

  const [paymentLoading, setPaymentLoading] = React.useState(false)
  const [checkoutLoading, setCheckoutLoading] = React.useState(false)

  // Stripe Connect state
  const [connectOnboardingOpen, setConnectOnboardingOpen] = React.useState(false)
  const [connectStatus, setConnectStatus] = React.useState<{
    hasAccount: boolean
    payoutsEnabled: boolean
    detailsSubmitted: boolean
  }>({ hasAccount: false, payoutsEnabled: false, detailsSubmitted: false })
  const [connectLoading, setConnectLoading] = React.useState(false)

  // Price IDs from environment (Vite)
  const PRICE_IDS: Record<string, string> = {
    user_plus: import.meta.env.VITE_STRIPE_PRICE_ID_USER_PLUS || "",
    creator_plus: import.meta.env.VITE_STRIPE_PRICE_ID_CREATOR_PLUS || "",
    creator: import.meta.env.VITE_STRIPE_PRICE_ID_CREATOR || "",
  }

  // TODO: 実際のユーザーIDとメールアドレスを認証から取得する
  const currentUserId = "demo-user-1"
  const currentUserEmail = "demo@example.com"
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("あなた")
  const [profileBio, setProfileBio] = React.useState("")
  const [profilePublic, setProfilePublic] = React.useState(true)
  const [profileDraftName, setProfileDraftName] = React.useState(displayName)
  const [profileDraftBio, setProfileDraftBio] = React.useState(profileBio)
  const [profileDraftPublic, setProfileDraftPublic] = React.useState(profilePublic)

  const recipeCount = 0
  const setCount = 0
  const historyCount = 0
  const membershipCount = 0
  const purchaseCount = 0

  const pushSupported = isPushSupported()

  React.useEffect(() => {
    const storedToken = getStoredPushToken()
    if (storedToken) {
      setPushToken(storedToken)
      setPushEnabled(true)
    }
  }, [])

  // クリエイターの場合、Connect Accountの状態を確認
  React.useEffect(() => {
    if (accountType !== "creator") return
    const checkConnectStatus = async () => {
      try {
        const result = await getConnectAccountStatus(currentUserId)
        if (result.ok) {
          setConnectStatus({
            hasAccount: true,
            payoutsEnabled: result.payoutsEnabled,
            detailsSubmitted: result.detailsSubmitted,
          })
        }
      } catch {
        // アカウントがまだ作成されていない
        setConnectStatus({
          hasAccount: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        })
      }
    }
    checkConnectStatus()
  }, [accountType, currentUserId])

  const togglePush = async () => {
    if (!pushSupported) {
      onToast?.("このブラウザではプッシュ通知を利用できません")
      return
    }
    if (pushEnabled) {
      setPushEnabled(false)
      setPushToken(null)
      clearPushToken()
      onToast?.("プッシュ通知をオフにしました")
      return
    }
    setPushPending(true)
    try {
      const token = await requestPushToken()
      if (!token) {
        onToast?.("通知の許可が必要です")
        setPushEnabled(false)
        return
      }
      setPushToken(token)
      setPushEnabled(true)
      onToast?.("プッシュ通知をオンにしました")
    } finally {
      setPushPending(false)
    }
  }

  const openProfileEdit = () => {
    setProfileDraftName(displayName)
    setProfileDraftBio(profileBio)
    setProfileDraftPublic(profilePublic)
    setProfileOpen(true)
  }

  const saveProfile = () => {
    setDisplayName(profileDraftName.trim() || "あなた")
    setProfileBio(profileDraftBio.trim())
    setProfilePublic(profileDraftPublic)
    setProfileOpen(false)
    onToast?.("プロフィールを更新しました")
  }

  return (
    <ScreenContainer>
      <HeaderBar
        actions={<HeaderActions onNotifications={onOpenNotifications} onFridge={onOpenFridge} />}
        onHelpClick={onOpenHelp}
        onLogoClick={onOpenHome}
      />
      <main className="px-5 pb-6 pt-4">
        <Stack gap="lg">
          <div className="flex items-center">
            <H2 className="relative text-[22px] tracking-tight">
              <span className="relative z-10">マイページ</span>
              <span className="absolute -bottom-1 left-0 h-3 w-full origin-left skew-x-[-12deg] rounded-[1px] bg-orange-200/75" />
            </H2>
          </div>

          <Surface tone="card" density="comfy" className="rounded-2xl">
            <Cluster justify="between" align="center" className="gap-4">
              <Cluster gap="sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5" />
                </div>
                <Stack gap="xs">
                  <H3 className="text-sm">{displayName}</H3>
                  <Muted className="text-xs">アカウント: {accountType === "creator" ? "クリエイター" : "ユーザー"}</Muted>
                  <Muted className="text-xs">
                    プラン: {activePlan.label}（{activePlan.price}）
                  </Muted>
                </Stack>
              </Cluster>
              <Stack gap="xs" align="end">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPlanOpen(true)}>
                  プラン変更
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-xs", accountType === "user" ? "hidden" : "")}
                  onClick={openProfileEdit}
                >
                  プロフィール編集
                </Button>
              </Stack>
            </Cluster>
          </Surface>

          <div className="grid w-full grid-cols-2 rounded-full bg-muted/40 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full",
                tab === "profile" ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setTab("profile")}
            >
              プロフィール
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-full",
                tab === "settings" ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setTab("settings")}
            >
              設定
            </Button>
          </div>

          {tab === "profile" ? (
            <Stack gap="lg">
              <Stack gap="sm">
                <SectionHeader title="ダッシュボード" description="今月の記録" />
                <Surface tone="card" density="comfy" className="rounded-2xl">
                  <Stack gap="md">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "レシピ", value: recipeCount },
                        { label: "セット", value: setCount },
                        { label: "料理した日", value: historyCount },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-muted/40 px-3 py-3 text-center">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <div className="mt-1 text-lg font-semibold">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {accountType === "user" ? (
                      <Cluster justify="between" align="center" className="rounded-xl bg-muted/30 px-3 py-2">
                        <span className="text-xs text-muted-foreground">メンバーシップ</span>
                        <span className="text-xs font-semibold text-foreground">
                          {membershipCount}件
                        </span>
                      </Cluster>
                    ) : null}
                  </Stack>
                </Surface>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="加入中メンバーシップ" description={membershipCount ? `${membershipCount}件` : "未加入"} />
                {membershipCount === 0 ? (
                  <Muted className="text-sm text-muted-foreground">
                    まだ加入中のメンバーシップはありません
                  </Muted>
                ) : (
                  <Stack gap="sm">
                    <Body className="text-sm">加入中のメンバーシップを表示</Body>
                  </Stack>
                )}
                <Button variant="secondary" size="sm" onClick={onOpenCatalog}>
                  レシピカタログを見る
                </Button>
              </Stack>

              {accountType !== "user" ? (
                <>
                  <Stack gap="sm">
                    <SectionHeader title="売上を受け取る設定" description="Stripe Connect" />
                    <Surface tone="card" density="comfy" className="rounded-2xl">
                      <Stack gap="sm">
                        {connectStatus.payoutsEnabled ? (
                          <>
                            <Cluster gap="sm" align="center">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                              <Body className="text-sm">売上の受け取り設定が完了しています</Body>
                            </Cluster>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setConnectLoading(true)
                                try {
                                  const result = await createConnectLoginLink({ userId: currentUserId })
                                  if (result.ok && result.url) {
                                    window.open(result.url, "_blank")
                                  }
                                } catch {
                                  onToast?.("ダッシュボードを開けませんでした")
                                } finally {
                                  setConnectLoading(false)
                                }
                              }}
                              disabled={connectLoading}
                            >
                              {connectLoading ? "読み込み中..." : "売上ダッシュボードを開く"}
                            </Button>
                          </>
                        ) : connectStatus.detailsSubmitted ? (
                          <>
                            <Cluster gap="sm" align="center">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <Body className="text-sm">審査中です。しばらくお待ちください。</Body>
                            </Cluster>
                          </>
                        ) : (
                          <>
                            <Body className="text-sm">
                              有料レシピを販売するには、売上を受け取るための設定が必要です。
                            </Body>
                            <Muted className="text-xs">
                              本人確認と銀行口座の登録を行います（約5分）
                            </Muted>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setConnectOnboardingOpen(true)}
                            >
                              設定を開始する
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Surface>
                  </Stack>

                  <Stack gap="sm">
                    <SectionHeader title="メンバーシップ管理" description="クリエイター" />
                    <Surface tone="card" density="comfy" className="rounded-2xl">
                      <Stack gap="sm">
                        <Body className="text-sm">プランや掲示板、限定コンテンツを整えます。</Body>
                        <Cluster gap="sm" className="flex-wrap">
                          <Button variant="secondary" size="sm">概要を編集</Button>
                          <Button variant="secondary" size="sm">プランを追加</Button>
                          <Button variant="secondary" size="sm">プレビュー</Button>
                        </Cluster>
                      </Stack>
                    </Surface>
                  </Stack>
                </>
              ) : null}

              <Stack gap="sm">
                <SectionHeader title="診断" description="-" />
                <Muted className="text-sm text-muted-foreground">
                  料理の履歴から、いまの好みや気分を言葉で整理できます。
                </Muted>
                <span className="inline-flex w-fit rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                  準備中
                </span>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="アーカイブ" description="-" />
                <Muted className="text-sm text-muted-foreground">
                  作った日ごとの献立を、カレンダーから見返せます。
                </Muted>
                <Button variant="secondary" size="sm" onClick={onOpenArchive}>
                  アーカイブを開く
                </Button>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="購入履歴" description={purchaseCount ? `${purchaseCount}件` : "0件"} />
                {purchaseCount === 0 ? (
                  <Muted className="text-sm text-muted-foreground">
                    まだ購入履歴がありません
                  </Muted>
                ) : (
                  <Stack gap="sm">
                    <Body className="text-sm">購入履歴を表示</Body>
                  </Stack>
                )}
                <Button variant="secondary" size="sm" onClick={onOpenPurchaseHistory}>
                  購入履歴を見る
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack gap="lg">
              <Stack gap="sm">
                <SectionHeader title="お支払い" description={hasPayment ? "登録済み" : "登録なし"} />
                <Surface tone="card" density="comfy" className="rounded-2xl">
                  <Stack gap="sm">
                    <Cluster gap="sm">
                      <CreditCard className="h-4 w-4" />
                      <Body className="text-sm">
                        {hasPayment && cardLast4
                          ? `${cardBrand?.toUpperCase() ?? "CARD"} •••• ${cardLast4}`
                          : hasPayment
                            ? "お支払い情報を登録済みです"
                            : "お支払い情報が未登録です"}
                      </Body>
                    </Cluster>
                    <Cluster gap="sm" className="flex-wrap">
                      <Button variant="secondary" size="sm" onClick={() => setPaymentOpen(true)}>
                        登録 / 変更
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasPayment}
                        onClick={() => {
                          updatePaymentInfo(false, null, null)
                          onToast?.("お支払い情報を削除しました")
                        }}
                      >
                        削除
                      </Button>
                      <Button variant="ghost" size="sm" onClick={onOpenPaymentHistory}>
                        決済履歴を見る
                      </Button>
                    </Cluster>
                  </Stack>
                </Surface>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="通知" />
                <Surface tone="card" density="comfy" className="rounded-2xl">
                  <Stack gap="sm">
                    <Cluster justify="between" align="center">
                      <Stack gap="xs">
                        <Body className="text-sm">プッシュ通知</Body>
                        <Muted className="text-xs">あなた宛ての通知を受け取る</Muted>
                      </Stack>
                      <Button
                        variant={pushEnabled ? "secondary" : "ghost"}
                        size="sm"
                        onClick={togglePush}
                        disabled={pushPending}
                      >
                        {pushPending ? "処理中" : pushEnabled ? "ON" : "OFF"}
                      </Button>
                    </Cluster>
                    {pushToken ? (
                      <Muted className="text-xs">登録済み</Muted>
                    ) : null}
                    <Cluster justify="between" align="center">
                      <Stack gap="xs">
                        <Body className="text-sm">フォロー通知</Body>
                        <Muted className="text-xs">フォロー中: 0人</Muted>
                      </Stack>
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        準備中
                      </span>
                    </Cluster>
                  </Stack>
                </Surface>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="ユーザー設定" />
                <Surface tone="card" density="comfy" className="rounded-2xl">
                  <Stack gap="sm">
                    <Cluster justify="between" align="center">
                      <Stack gap="xs">
                        <Body className="text-sm">アカウントタイプ</Body>
                        <Muted className="text-xs">使い方に合わせて切り替え</Muted>
                      </Stack>
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        準備中
                      </span>
                    </Cluster>
                    <Cluster justify="between" align="center">
                      <Stack gap="xs">
                        <Body className="text-sm">ヘルプ / フィードバック</Body>
                        <Muted className="text-xs">困った時はいつでも</Muted>
                      </Stack>
                      <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                        準備中
                      </span>
                    </Cluster>
                  </Stack>
                </Surface>
              </Stack>

              <Stack gap="sm">
                <SectionHeader title="ログアウト" />
                <Button variant="ghost" size="sm" className="w-full rounded-full" onClick={onLogout}>
                  ログアウトする
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </main>
      {planOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="comfy" className="w-full max-w-sm rounded-3xl">
            <Stack gap="md">
              <Cluster justify="between" align="center">
                <H3 className="text-base">プラン変更</H3>
                <button
                  type="button"
                  onClick={() => {
                    setPlanOpen(false)
                    setPlanPending(null)
                  }}
                  className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  閉じる
                </button>
              </Cluster>
              <Stack gap="sm">
                {planOptions.map((option) => {
                  const selected = option.id === selectedPlanId
                  const isCurrent = option.id === plan
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPlanPending(option.id)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition",
                        selected ? "border-primary/50 bg-primary/10" : "border-border bg-card"
                      )}
                    >
                      <Stack gap="xs">
                        <span className="font-semibold">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.price}</span>
                      </Stack>
                      <span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">
                        {isCurrent ? "現在のプラン" : option.id !== "user" ? "有料" : "無料"}
                      </span>
                    </button>
                  )
                })}
              </Stack>
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="sm">
                  <H3 className="text-sm">{selectedPlan.label}の概要</H3>
                  <Muted className="text-xs">{selectedPlanDetail.summary}</Muted>
                  <Stack gap="xs">
                    <span className="text-xs font-semibold text-foreground">できること</span>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {selectedPlanDetail.allowed.map((item) => (
                        <li key={item}>・{item}</li>
                      ))}
                    </ul>
                  </Stack>
                  {selectedPlanDetail.blocked.length ? (
                    <Stack gap="xs">
                      <span className="text-xs font-semibold text-foreground">できないこと</span>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {selectedPlanDetail.blocked.map((item) => (
                          <li key={item}>・{item}</li>
                        ))}
                      </ul>
                    </Stack>
                  ) : null}
                </Stack>
              </Surface>
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  if (selectedPlanId === plan) {
                    setPlanOpen(false)
                    return
                  }
                  if (selectedPlanId === "user") {
                    setPlan(selectedPlanId)
                    setPlanPending(null)
                    setPlanOpen(false)
                    setPlanChanged(selectedPlanId)
                    return
                  }
                  setPlanOpen(false)
                  setPlanCheckoutOpen(true)
                }}
              >
                {selectedPlanId === "user" ? "このプランに変更" : "決済へ進む"}
              </Button>
            </Stack>
          </Surface>
        </div>
      ) : null}
      {planCheckoutOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="comfy" className="w-full max-w-sm rounded-3xl">
            <Stack gap="md">
              <Cluster justify="between" align="center">
                <H3 className="text-base">決済</H3>
                <button
                  type="button"
                  onClick={() => {
                    setPlanCheckoutOpen(false)
                    setPlanPending(null)
                  }}
                  className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                  disabled={checkoutLoading}
                >
                  閉じる
                </button>
              </Cluster>
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="xs">
                  <Muted className="text-xs">変更プラン</Muted>
                  <H3 className="text-base">
                    {selectedPlan.label}（{selectedPlan.price}）
                  </H3>
                  <Muted className="text-xs">確認後にプランが切り替わります。</Muted>
                </Stack>
              </Surface>
              {checkoutLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">決済処理中...</span>
                </div>
              ) : hasPayment && cardLast4 ? (
                <Stack gap="sm">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">
                      {cardBrand?.toUpperCase()} •••• {cardLast4}
                    </span>
                  </div>
                  <Button
                    className="w-full rounded-full"
                    onClick={async () => {
                      if (!planPending) return
                      setCheckoutLoading(true)
                      try {
                        if (planPending === "creator") {
                          // 買い切り
                          const result = await purchasePlan({
                            userId: currentUserId,
                            planId: "creator",
                          })
                          if (result.ok && result.status === "succeeded") {
                            setPlan(planPending)
                            setPlanChanged(planPending)
                            setPlanPending(null)
                            setPlanCheckoutOpen(false)
                          } else if (result.clientSecret) {
                            onToast?.("追加認証が必要です")
                          }
                        } else {
                          // サブスク（user_plus, creator_plus）
                          const priceId = PRICE_IDS[planPending]
                          const result = await createSubscription({
                            userId: currentUserId,
                            priceId,
                          })
                          if (result.ok) {
                            setPlan(planPending)
                            setPlanChanged(planPending)
                            setPlanPending(null)
                            setPlanCheckoutOpen(false)
                          }
                        }
                      } catch {
                        onToast?.("決済に失敗しました")
                      } finally {
                        setCheckoutLoading(false)
                      }
                    }}
                  >
                    このカードで支払う
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      updatePaymentInfo(false, null, null)
                    }}
                  >
                    別のカードを使う
                  </Button>
                </Stack>
              ) : (
                <StripeCardInput
                  submitLabel="支払って変更する"
                  onSuccess={async (paymentMethodId) => {
                    if (!planPending) return
                    setCheckoutLoading(true)
                    try {
                      // 1. カード登録
                      const pmResult = await registerPaymentMethod({
                        userId: currentUserId,
                        email: currentUserEmail,
                        paymentMethodId,
                      })
                      if (!pmResult.ok) {
                        throw new Error("カード登録に失敗しました")
                      }
                      if (pmResult.card) {
                        updatePaymentInfo(true, pmResult.card.last4, pmResult.card.brand)
                      }

                      // 2. プランに応じて決済
                      if (planPending === "creator") {
                        // 買い切り
                        const result = await purchasePlan({
                          userId: currentUserId,
                          planId: "creator",
                        })
                        if (result.ok && result.status === "succeeded") {
                          // カード情報は既にupdatePaymentInfoで設定済み
                          setPlan(planPending)
                          setPlanChanged(planPending)
                          setPlanPending(null)
                          setPlanCheckoutOpen(false)
                        } else if (result.clientSecret) {
                          onToast?.("追加認証が必要です")
                        }
                      } else {
                        // サブスク（user_plus, creator_plus）
                        const priceId = PRICE_IDS[planPending]
                        const subResult = await createSubscription({
                          userId: currentUserId,
                          priceId,
                        })
                        if (subResult.ok) {
                          // カード情報は既にupdatePaymentInfoで設定済み
                          setPlan(planPending)
                          setPlanChanged(planPending)
                          setPlanPending(null)
                          setPlanCheckoutOpen(false)
                        }
                      }
                    } catch {
                      onToast?.("決済に失敗しました")
                    } finally {
                      setCheckoutLoading(false)
                    }
                  }}
                  onError={(error) => {
                    onToast?.(error)
                  }}
                />
              )}
            </Stack>
          </Surface>
        </div>
      ) : null}
      {planChanged ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="comfy" className="w-full max-w-sm rounded-3xl text-center">
            <Stack gap="sm" align="center">
              <span className="text-2xl">✅</span>
              <H3 className="text-base">プランが変更されました</H3>
              <Muted className="text-xs">
                {planOptions.find((item) => item.id === planChanged)?.label} に切り替わりました。
              </Muted>
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  setPlanChanged(null)
                  onToast?.("プランを変更しました")
                }}
              >
                閉じる
              </Button>
            </Stack>
          </Surface>
        </div>
      ) : null}
      {profileOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface
            tone="card"
            density="none"
            elevation="raised"
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <H2 className="text-lg">プロフィール編集</H2>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="px-5 py-5">
              <Stack gap="sm">
                <label className="text-xs font-semibold text-muted-foreground">表示名</label>
                <input
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                  value={profileDraftName}
                  onChange={(event) => setProfileDraftName(event.target.value)}
                />
                <label className="text-xs font-semibold text-muted-foreground">自己紹介</label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                  rows={4}
                  value={profileDraftBio}
                  onChange={(event) => setProfileDraftBio(event.target.value)}
                />
                <Cluster justify="between" align="center">
                  <Stack gap="xs">
                    <Body className="text-sm">公開ステータス</Body>
                    <Muted className="text-xs">
                      {profileDraftPublic ? "公開" : "非公開"}
                    </Muted>
                  </Stack>
                  <Button
                    variant={profileDraftPublic ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setProfileDraftPublic((prev) => !prev)}
                  >
                    {profileDraftPublic ? "公開中" : "非公開"}
                  </Button>
                </Cluster>
                <Cluster justify="end" gap="sm">
                  <Button variant="ghost" size="sm" onClick={() => setProfileOpen(false)}>
                    キャンセル
                  </Button>
                  <Button variant="secondary" size="sm" onClick={saveProfile}>
                    保存する
                  </Button>
                </Cluster>
              </Stack>
            </div>
          </Surface>
        </div>
      ) : null}
      {paymentOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="comfy" className="w-full max-w-sm rounded-3xl">
            <Stack gap="md">
              <Cluster justify="between" align="center">
                <H3 className="text-base">お支払い情報</H3>
                <button
                  type="button"
                  onClick={() => setPaymentOpen(false)}
                  className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                  disabled={paymentLoading}
                >
                  閉じる
                </button>
              </Cluster>
              {paymentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">登録中...</span>
                </div>
              ) : (
                <StripeCardInput
                  submitLabel="カードを登録"
                  onSuccess={async (paymentMethodId) => {
                    setPaymentLoading(true)
                    try {
                      const result = await registerPaymentMethod({
                        userId: currentUserId,
                        email: currentUserEmail,
                        paymentMethodId,
                      })
                      if (result.ok && result.card) {
                        updatePaymentInfo(true, result.card.last4, result.card.brand)
                        setPaymentOpen(false)
                        onToast?.("お支払い情報を登録しました")
                      }
                    } catch (err) {
                      onToast?.("登録に失敗しました")
                    } finally {
                      setPaymentLoading(false)
                    }
                  }}
                  onError={(error) => {
                    onToast?.(error)
                  }}
                />
              )}
            </Stack>
          </Surface>
        </div>
      ) : null}
      {connectOnboardingOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Surface tone="card" density="comfy" className="w-full max-w-sm rounded-3xl">
            <Stack gap="md">
              <Cluster justify="between" align="center">
                <H3 className="text-base">売上を受け取る設定</H3>
                <button
                  type="button"
                  onClick={() => setConnectOnboardingOpen(false)}
                  className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                  disabled={connectLoading}
                >
                  閉じる
                </button>
              </Cluster>
              <Surface tone="section" density="comfy" className="border-transparent">
                <Stack gap="sm">
                  <H3 className="text-sm">設定の流れ</H3>
                  <Stack gap="xs">
                    <Muted className="text-xs">1. 本人確認書類のアップロード</Muted>
                    <Muted className="text-xs">2. 銀行口座の登録</Muted>
                    <Muted className="text-xs">3. 審査（通常1〜2営業日）</Muted>
                  </Stack>
                  <Muted className="text-xs mt-2">
                    ※ Stripeの安全な画面で行います
                  </Muted>
                </Stack>
              </Surface>
              {connectLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">準備中...</span>
                </div>
              ) : (
                <Button
                  className="w-full rounded-full"
                  onClick={async () => {
                    setConnectLoading(true)
                    try {
                      // 1. Connect Account作成
                      const accountResult = await createConnectAccount({
                        userId: currentUserId,
                        email: currentUserEmail,
                      })
                      if (!accountResult.ok) {
                        throw new Error("アカウント作成に失敗しました")
                      }

                      // 2. オンボーディングURLを取得してリダイレクト
                      const linkResult = await createConnectAccountLink({
                        userId: currentUserId,
                        returnUrl: `${window.location.origin}/mypage?connect=complete`,
                        refreshUrl: `${window.location.origin}/mypage?connect=refresh`,
                      })
                      if (linkResult.ok && linkResult.url) {
                        window.location.href = linkResult.url
                      }
                    } catch {
                      onToast?.("設定を開始できませんでした")
                    } finally {
                      setConnectLoading(false)
                    }
                  }}
                >
                  設定を開始する
                </Button>
              )}
            </Stack>
          </Surface>
        </div>
      ) : null}
    </ScreenContainer>
  )
}
