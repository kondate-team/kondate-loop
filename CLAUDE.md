# CLAUDE.md - こんだてLoop AIアシスタント向けルール

このファイルはClaude Code、Codex、その他のAIアシスタントがkondate-loopプロジェクトで作業する際のルールを定義します。

## 必須ワークフロー（絶対に守ること）

### 作業開始前に必ずやること

1. **Issueを作成する**
   ```bash
   gh issue create --title "タスクのタイトル" --body "概要と完了条件"
   ```

2. **devから最新を取得してfeatureブランチを作成**
   ```bash
   git fetch --prune
   git switch dev
   git pull
   git switch -c feature/<issue番号>-<短い説明>
   ```

3. **実装を行う**

4. **コミット＆プッシュ**
   ```bash
   git add .
   git commit -m "feat/fix/docs: 説明

   Closes #<issue番号>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   git push -u origin feature/<issue番号>-<短い説明>
   ```

5. **PRを作成**
   ```bash
   gh pr create --title "タイトル" --body "..." --base dev
   ```

6. **ZenHubパイプラインを更新**
   - PR作成時にIssueを `Review` へ移動
   - マージ後にIssueを `Done` へ移動

### 絶対にやってはいけないこと

- ❌ Issueを作らずに実装を始める
- ❌ devやmainブランチに直接コミットする
- ❌ featureブランチを作らずに作業する
- ❌ PRを作らずにマージする

## ブランチ命名規則

| パターン | 用途 |
|---------|------|
| `feature/<issue番号>-<説明>` | 新機能・改善 |
| `hotfix/<issue番号>-<説明>` | 本番緊急修正（mainから作成） |

例：
- `feature/40-types-package`
- `feature/42-stripe-integration`
- `hotfix/45-critical-bug`

## コミットメッセージ規則

```
<type>: <説明>

<本文（任意）>

Closes #<issue番号>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### type一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他（ビルド設定等）

## Issue/PRボード管理（ZenHub）

| ステータス | 意味 |
|-----------|------|
| Backlog | まだ着手しない（いつかやる） |
| Sprint | 今週やる（合意済み） |
| In Progress | 作業中 |
| Review | PR待ち/レビュー中 |
| Done | devにマージ済 |

## ZenHubパイプライン更新（自動化）

ZenHubの列移動は**必須**。自動化できる場合はスクリプトを使う。

### 前提（トークン）
- `ZENHUB_TOKEN` を環境変数に設定する（トークンは **リポジトリに保存しない**）。
- GitHub CLI (`gh`) が利用可能な状態であること。

### 実行コマンド
```bash
scripts/zenhub-move-issue.sh <issue番号> <pipeline名> [position]
```

例:
```bash
scripts/zenhub-move-issue.sh 60 Review top
scripts/zenhub-move-issue.sh 60 Done top
```

### 補足
- `pipeline名` は `Backlog / Sprint / In Progress / Review / Done` を前提とする。
- `ZENHUB_TOKEN` が無い場合はユーザーに提供を依頼する。

## プロジェクト構成

```
kondate-loop/
├── apps/
│   └── web/          # フロントエンド（Vite + React）
├── packages/
│   └── types/        # 共通型定義 @kondate-loop/types
├── infra/            # AWS / CloudFormation
├── README.md         # プロジェクト概要
├── GITHUB_WORKFLOW.md # 詳細なGitHub運用ルール
└── CLAUDE.md         # このファイル
```

## 技術スタック

### フロントエンド
- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- React Router

### バックエンド（AWS）
- Cognito（認証）
- API Gateway + Lambda
- DynamoDB
- Bedrock + Claude Haiku（AI）

### 外部サービス
- Stripe（決済）
- Firebase Cloud Messaging（プッシュ通知）

## 参照ドキュメント

- API仕様: `knowledge/side-business/kondate-loop/02_仕様/API仕様定義書_埋め込み済み.md`
- 外部連携仕様: `knowledge/side-business/kondate-loop/02_仕様/外部連携詳細仕様書.md`
- UIルール: `apps/web/UI_RULES.md`
- 初期リリース要件: `apps/web/INITIAL_RELEASE_REQUIREMENTS.md`

## チェックリスト（作業完了前に確認）

- [ ] Issueを作成した
- [ ] `feature/*` を `dev` から作成した
- [ ] PRに `Closes #<issue番号>` を入れた
- [ ] ビルドが通ることを確認した
- [ ] PRを作成した
