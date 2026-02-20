# Issue #020 CORS CloudFront対応メモ (2026-02-20)

## 背景
- CloudFront (`https://da8ahpdul87cu.cloudfront.net`) から dev API を呼ぶと、preflight が CORS エラーになる事象を確認。
- エラー内容:
  - `Access-Control-Allow-Origin` が `http://localhost:5173` 固定で返っていた。
  - CloudFront Origin (`https://da8ahpdul87cu.cloudfront.net`) と一致せずブラウザ側でブロックされた。

## 原因
- `apps/api/src/server.ts` の CORS 設定が単一値 `CORS_ORIGIN` 前提だった。
- `CORS_ORIGIN` 未設定時のデフォルトが `http://localhost:5173` のみだった。

## 修正
- `apps/api/src/server.ts` を修正:
  - `CORS_ORIGINS` (カンマ区切り) と `CORS_ORIGIN` の両方を受け付ける。
  - Origin 判定を関数化し、複数Origin許可に変更。
  - デフォルト許可に以下を設定:
    - `http://localhost:5173`
    - `https://da8ahpdul87cu.cloudfront.net`
  - 起動時に `[bootstrap] CORS origins: ...` をログ出力。

## ローカル確認結果
- `npm run build --workspace=apps/api` : 成功
- `npm run smoke:api --workspace=apps/api` : 成功
- `CORS_ORIGIN` 未設定での確認:
  - `OPTIONS /v1/auth/callback` + `Origin: https://da8ahpdul87cu.cloudfront.net`
  - 結果: `204` / `Access-Control-Allow-Origin: https://da8ahpdul87cu.cloudfront.net`

## デプロイ後の確認ポイント
- CloudFront 画面上の DevTools で `/v1/auth/callback`, `/v1/auth/refresh`, `/v1/auth/logout` を実行。
- Network で以下を確認:
  - すべて 2xx
  - `access-control-allow-origin` が CloudFront Origin と一致
