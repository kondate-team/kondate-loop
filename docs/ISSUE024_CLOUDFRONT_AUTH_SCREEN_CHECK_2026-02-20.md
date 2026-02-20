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
- `apps/web/src/services/auth.ts`
  - `AUTH_USE_MOCK = API_USE_MOCK && import.meta.env.DEV` を導入。
  - 認証系 (`login/signup/refresh/logout/callback/me`) は `PROD` で必ず実APIを使用するよう固定。

## 目的
- 環境変数が未指定でも、CloudFront配信画面は実API接続を既定値にする。

## 追加検証 (2026-02-20)
- Playwrightで CloudFront (`https://da8ahpdul87cu.cloudfront.net/`) を開き、
  `新規登録 -> 登録してはじめる` と `ログイン -> ログイン` を実クリックして計測した。
- 計測結果:
  - クリックイベントは発火している
  - 画面は認証後UIへ遷移する
  - ただし `fetch/XHR/beacon` の `/v1/auth/*` 呼び出しは 0 件
- 同一ハッシュのビルド成果物をローカル配信して同操作をすると、
  `/v1/auth/signup` を含む `fetch` が発火することを確認。
- したがって、CloudFront実行時だけ挙動が異なるため、ブラウザ側キャッシュや実行コンテキスト差分を含めて追加切り分けが必要。

## 安全側の再検証 (2026-02-20)
- コード変更は行わず、以下のみ実施:
  - `serviceWorkers: block` で CloudFront 画面を再操作
  - URL に cache buster (`?cb=<timestamp>`) を付与して再操作
- 結果:
  - クリックは成功し、画面は認証後UIへ遷移
  - それでも `/v1/auth/*` の `fetch/XHR/beacon` は 0 件

- 併せて API Gateway 側を `Origin: https://da8ahpdul87cu.cloudfront.net` で再確認:
  - `POST /v1/auth/signup` -> `200`
  - `POST /v1/auth/login` -> `200`
  - `POST /v1/auth/refresh` (invalid token) -> `401`
  - いずれも `access-control-allow-origin: https://da8ahpdul87cu.cloudfront.net` を返却

- 結論:
  - バックエンド/CORS は正常。
  - CloudFront 画面側の実行時挙動に限定した差分が残っている。
