import * as React from "react"

import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareModalProps {
  open: boolean
  title: string
  typeLabel: string
  author?: string
  sourceUrl?: string
  onClose: () => void
  onSubmit: (payload: { author?: string; sourceUrl?: string }) => void
}

export function ShareModal({
  open,
  title,
  typeLabel,
  author,
  sourceUrl,
  onClose,
  onSubmit,
}: ShareModalProps) {
  const [authorDraft, setAuthorDraft] = React.useState(author ?? "")
  const [sourceDraft, setSourceDraft] = React.useState(sourceUrl ?? "")

  React.useEffect(() => {
    if (!open) return
    setAuthorDraft(author ?? "")
    setSourceDraft(sourceUrl ?? "")
  }, [open, author, sourceUrl])

  if (!open) return null

  const hasInfo = Boolean((authorDraft ?? "").trim() || (sourceDraft ?? "").trim())
  const requiresInput = !hasInfo

  const handleSubmit = () => {
    if (!hasInfo) return
    onSubmit({
      author: authorDraft.trim() || undefined,
      sourceUrl: sourceDraft.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <Surface
        tone="card"
        density="none"
        elevation="raised"
        className="max-h-[85vh] w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <H2 className="text-lg">{typeLabel}を共有</H2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            閉じる
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <Stack gap="md">
            <Stack gap="xs">
              <Muted className="text-xs">対象</Muted>
              <div className="text-sm font-semibold">{title || "名称未設定"}</div>
            </Stack>

            {requiresInput ? (
              <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                共有するには作成者または出典URLが必要です。
              </div>
            ) : (
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                作成者/出典URLを含めて共有します。
              </div>
            )}

            <Stack gap="sm">
              <input
                className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                placeholder="作成者名（任意）"
                value={authorDraft}
                onChange={(event) => setAuthorDraft(event.target.value)}
              />
              <input
                className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                placeholder="出典URL（任意）"
                value={sourceDraft}
                onChange={(event) => setSourceDraft(event.target.value)}
              />
            </Stack>
            {requiresInput ? (
              <Muted className={cn("text-xs", !hasInfo && "text-destructive")}>
                作成者または出典URLのどちらかが必須です。
              </Muted>
            ) : null}
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button className="rounded-full" onClick={handleSubmit} disabled={!hasInfo}>
              共有リンクを作成
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
