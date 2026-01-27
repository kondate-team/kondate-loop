# Kondate Loop モノレポ

こんだてLoopのモノレポ構成です。フロントエンドとインフラ/バックエンド資産を同一リポジトリで管理します。

## ディレクトリ構成

- `apps/web/` : フロントエンド（Vite + React）
- `infra/` : AWS / CloudFormation / インフラ資産

### infra 配下のルール（CloudFormation）

- テンプレートで定義するresourceには必ずTagsを付ける（Key: `Owner`, Value: `yukanagatake`）。
- テンプレートの先頭に必ずParametersを定義する。

```yaml
Parameters:
  SystemId:
    Type: String
    Default: 'kondate-5036514'
    Description: SystemId
  Env:
    Type: String
    Default: 'dev'
    AllowedValues:
      - 'dev'
      - 'prod'
    Description: Environment
```

## ブランチ運用（必須ルール）

- `main` : 本番（安定版）
- `dev` : プレ本番 / 統合検証
- `future/*` : 個別作業ブランチ（必ず `dev` から作成）
- `hotfix/*` : 本番緊急修正（`main` から作成して `main` と `dev` に反映）

### PR運用（必須）

- `future/*` → `dev` は **必ずPR** を作成して統合する
- `dev` → `main` も **必ずPR** を作成して統合する
- 可能な限り GitHub Issues / Projects でタスク管理する

### リリースフロー

1. `future/*` → `dev` にPRで統合
2. 検証OKなら `dev` → `main` にPRで昇格
3. `main` にタグ（例: `v0.1.0`）を付与

## 開発（フロント）

```bash
cd apps/web
npm install
npm run dev
```

## 補足

- フロントの仕様は `apps/web/INITIAL_RELEASE_REQUIREMENTS.md` と Notion のMVPエンハンスシートが正です。
- UIルールは `apps/web/UI_RULES.md` を参照してください。
