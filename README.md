# こんだてLoop（本番フロントエンド）

こんだてLoopのMVP初期リリース向けフロントエンドです。現時点はモックデータで動作し、後続でAPI接続を行う前提の構成です。

## 開発環境

```bash
npm install
npm run dev
```

## 環境変数

`.env` を作成し、`.env.example` を参考に設定してください。

- `VITE_API_BASE_URL` : APIベースURL
- `VITE_API_TIMEOUT_MS` : タイムアウト(ms)
- `VITE_API_USE_MOCK` : `true` の場合はモックデータを利用

## API接続の土台

- `src/api/` : APIクライアントと設定
- `src/services/` : ドメイン別のAPI呼び出し
- `src/types/` : API型定義
- `src/data/` : モックデータ

接続を開始する際は `VITE_API_USE_MOCK=false` に切り替え、`src/services/` のエンドポイントを調整してください。

## 画面構成（MVP）

- 献立表
- レシピ帳
- レシピカタログ
- マイページ
- 認証（ログイン / 新規登録）

## 注意

- 仕様は `INITIAL_RELEASE_REQUIREMENTS.md` と Notion のMVPエンハンスシートが正です。
- UIルールは `UI_RULES.md` を参照してください。
