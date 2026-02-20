# Issue #021 devフロントを実API接続に固定 (2026-02-20)

## 目的
- dev環境（CloudFront / GitHub Pages）で配信されるフロントエンドを、モックではなく実バックエンドに接続する。

## 背景
- `apps/web/src/api/config.ts` は `VITE_API_USE_MOCK` 未設定時に `true` になる実装。
- dev向け workflow の frontend build で `VITE_API_USE_MOCK` / `VITE_API_BASE_URL` が注入されていなかった。
- その結果、画面操作が mock 分岐に入り、実APIに接続しない状態が起きていた。

## 実施内容
- `.github/workflows/deploy.yml` の `frontend-dev` ジョブを修正。
  - `VITE_API_USE_MOCK=false` を指定して build。
  - `VITE_API_BASE_URL` は優先順で解決:
    1. `vars.VITE_API_BASE_URL_DEV`
    2. CloudFormation出力 `BackendApiEndpoint` を取得し、末尾 `/v1` を除去して利用
- `.github/workflows/pages-dev.yml` の build 環境変数を修正。
  - `VITE_API_USE_MOCK=false`
  - `VITE_API_BASE_URL=${{ vars.VITE_API_BASE_URL_DEV || 'https://9xgpv0z4r7.execute-api.ap-northeast-1.amazonaws.com/dev' }}`

## ローカル確認
- 実API設定を付けて `apps/web` build 成功:
  - `VITE_API_USE_MOCK=false`
  - `VITE_API_BASE_URL=https://9xgpv0z4r7.execute-api.ap-northeast-1.amazonaws.com/dev`
- 生成バンドル内に dev API base URL が埋め込まれることを確認。

## 注意
- これは「フロントが実APIを呼ぶ」ための修正。
- Cognito実認証（User Pool / Hosted UI / JWT検証 / API Gateway Authorizer）は別タスクで未実装。
