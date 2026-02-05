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
- `feature/*` : 個別作業ブランチ（必ず `dev` から作成）
- `hotfix/*` : 本番緊急修正（`main` から作成して `main` と `dev` に反映）

### PR運用（必須）

- `feature/*` → `dev` は **必ずPR** を作成して統合する
- `dev` → `main` も **必ずPR** を作成して統合する
- 可能な限り GitHub Issues / Projects でタスク管理する

### リリースフロー

1. `feature/*` → `dev` にPRで統合
2. 検証OKなら `dev` → `main` にPRで昇格
3. `main` にタグ（例: `v0.1.0`）を付与

## 開発運用（ZenHub + GitHub Issues）

### ボード運用（最小）

- `Backlog`：いつかやる
- `Sprint`：今週やる
- `In Progress`：着手中
- `Review`：PRレビュー中
- `Done`：`dev` にマージ済

### ルール（最小）

- 作業は **必ずIssueから開始**する
- ブランチ名は `feature/<issue番号>-<短い説明>` とする
- PRには `Closes #<issue番号>` を入れてIssueと紐付ける
- `dev` / `main` へは **直接pushしない**（PR経由のみ）

### ZenHubパイプライン更新（必須）

- PR作成時にIssueを `Review` へ移動する
- `dev` にマージ後、Issueを `Done` に移動する
- 自動化する場合は `scripts/zenhub-move-issue.sh` を使用する（`ZENHUB_TOKEN` が必要）

### 作業開始の手順

```bash
git fetch --prune
git switch dev
git pull
git switch -c feature/<issue番号>-<短い説明>
```

### リリースの考え方

- `feature/*` のPRを `dev` に複数取り込んだ後、まとめて `dev` → `main` をPRする

## リポジトリ移管とローカル更新（最新）

作業場所が確定したため、参照先URLとremote更新手順を最新化する。以後このURLのみを正とする。

- 新しい作業場所: https://github.com/kondate-team/kondate-loop
- 移管後はローカルのremoteを更新する

```bash
git remote set-url origin git@github.com:kondate-team/kondate-loop.git
```

共同作業者にも、リポジトリ移管とremote更新を必ず共有する。

## 開発（フロント）

```bash
cd apps/web
npm install
npm run dev
```

## 補足

- フロントの仕様は `apps/web/INITIAL_RELEASE_REQUIREMENTS.md` と Notion のMVPエンハンスシートが正です。
- UIルールは `apps/web/UI_RULES.md` を参照してください。

## CI/CD (GitHub Actions Deploy)

- Workflow: `.github/workflows/deploy.yml`
- Triggers:
  - push to `dev`: deploys backend + frontend (dev)
  - push to `feature/*`: deploys backend (dev)
  - push to `main`: deploys prod
- Manual run (dev only): Actions -> Deploy -> Run workflow, set branch `dev`,
  set `allow_stack_delete=true` to delete a `ROLLBACK_COMPLETE` stack and recreate.
- Secrets/Vars are read from repo/org (environment secrets are not used).
  Required: `AWS_ROLE_ARN_DEV` (dev), `AWS_ROLE_ARN` (prod).
