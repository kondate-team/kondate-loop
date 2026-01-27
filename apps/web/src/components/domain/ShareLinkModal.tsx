import { Surface } from "@/components/primitives/Surface"
import { Stack, Cluster } from "@/components/primitives/Stack"
import { H2, Muted } from "@/components/primitives/Typography"
import { Button } from "@/components/ui/button"

interface ShareLinkModalProps {
  open: boolean
  title: string
  typeLabel: string
  link: string
  onClose: () => void
  onCopy?: () => void
}

export function ShareLinkModal({
  open,
  title,
  typeLabel,
  link,
  onClose,
  onCopy,
}: ShareLinkModalProps) {
  if (!open) return null

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      onCopy?.()
    } catch {
      onCopy?.()
    }
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
          <H2 className="text-lg">リンクを作成しました</H2>
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
              <Muted className="text-xs">共有する{typeLabel}</Muted>
              <div className="text-sm font-semibold">{title || "名称未設定"}</div>
            </Stack>
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
              {link}
            </div>
            <Muted className="text-xs">
              共有先の人は詳細を閲覧できます。利用者ならレシピ帳に追加できます。
            </Muted>
          </Stack>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Cluster justify="end">
            <Button className="rounded-full" onClick={handleCopy} disabled={!link}>
              リンクをコピー
            </Button>
          </Cluster>
        </div>
      </Surface>
    </div>
  )
}
