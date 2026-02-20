# Issue #024 CloudFront画面確認とmockデフォルト修正 (2026-02-20)

## 背景
- CloudFront画面で `新規登録` / `ログイン` 操作時に DevTools Network に `/v1/auth/*` が出ない事象を確認。
- 画面は認証後のオンボーディングに遷移するため、UI側は動いているがAPI通信が発生していない状態。

## 切り分け結果
- CloudFront配信バンドル上には `/v1/auth/signup` と `/v1/auth/login` の文字列は含まれている。
- ただし画面操作時の `window.fetch` フックで `/v1/auth/*` 呼び出しは0件。
- 挙動から `API_USE_MOCK=true` で実行されていると判断。

## 修正
- `apps/web/src/api/config.ts`
  - `VITE_API_USE_MOCK` 未指定時のデフォルトを環境別に変更:
    - `DEV` では `"true"`
    - `PROD`（CloudFront含む）では `"false"`

## 目的
- 環境変数が未指定でも、CloudFront配信画面は実API接続を既定値にする。
