# こんだてLoop GitHub運用ルール（ZenHub前提）

このドキュメントは、こんだてLoop（`systems/private/kondate-loop`）のGitHub運用を
「軽量・迷わない」ことを優先して定義したものです。

## 目次
- [1. 目的と前提](#1-目的と前提)
- [2. ブランチ構成](#2-ブランチ構成)
- [3. Issue運用（ZenHub）](#3-issue運用zenhub)
- [4. 作業開始の手順（標準）](#4-作業開始の手順標準)
- [5. PR運用ルール](#5-pr運用ルール)
- [6. リリースフロー（dev → main）](#6-リリースフローdev--main)
- [7. ブランチの片付け（必須）](#7-ブランチの片付け必須)
- [8. ローカル運用の理解（よくある疑問）](#8-ローカル運用の理解よくある疑問)
- [9. 例外ルール（やむを得ないとき）](#9-例外ルールやむを得ないとき)
- [10. チェックリスト（最小）](#10-チェックリスト最小)
- [11. リポジトリ移管とローカル更新（最新）](#11-リポジトリ移管とローカル更新最新)

## 1. 目的と前提
- 2人開発でも迷わない運用を最優先
- 余計な管理は増やさない（最小限）
- ZenHubのボードを使う
- Issueを起点に作業する

## 2. ブランチ構成
- `main` : 本番（安定版）
- `dev` : プレ本番 / 統合検証
- `feature/*` : 個別作業ブランチ（必ず `dev` から作成）
- `hotfix/*` : 本番緊急修正（`main` から作成して `main` と `dev` に反映）

## 3. Issue運用（ZenHub）
### ボード列（最小）
- `Backlog`：いつかやる
- `Sprint`：今週やる
- `In Progress`：着手中
- `Review`：PRレビュー中
- `Done`：`dev` にマージ済

### 最小ルール
- 作業は **必ずIssueから開始**
- IssueはZenHubボード上で管理
- PRは必ずIssueと紐付ける（`Closes #<issue番号>`）

### パイプライン更新（必須）
- PR作成時にIssueを `Review` に移動
- `dev` へマージ後にIssueを `Done` に移動
- 自動化する場合は `scripts/zenhub-move-issue.sh` を使用（`ZENHUB_TOKEN` が必要）

## 4. 作業開始の手順（標準）
必ず **最新の `dev` を基準**に `feature/*` を切る。

```bash
git fetch --prune
git switch dev
git pull
git switch -c feature/<issue番号>-<短い説明>
```

## 5. PR運用ルール
- `feature/*` → `dev` は **必ずPR** で取り込む
- `dev` → `main` も **必ずPR** で取り込む
- `dev` / `main` に **直接pushしない**
- PR本文に `Closes #<issue番号>` を入れる

## 6. リリースフロー（dev → main）
- `feature/*` のPRを **複数 `dev` に取り込んでOK**
- まとまったら **`dev` → `main` をPR**
- `main` にタグを付ける（例: `v0.1.0`）

## 7. ブランチの片付け（必須）
- **PRマージ後は作業ブランチを削除する**
- ローカル・リモート両方を削除する

例:
```bash
git branch -D feature/xxx
git push origin --delete feature/xxx
```

## 8. ローカル運用の理解（よくある疑問）
- ローカルにも `main` / `dev` は存在する
- これらは **「最新を確認するための写し」**
- 作業は **必ず `feature/*`** で行う
- ローカル `main` / `dev` は放置すると古くなるので、必要時に `pull` で更新する

## 9. 例外ルール（やむを得ないとき）
- 原則はPR運用だが、**緊急時のみ例外で直接pushを許可**
- 例外を使った場合は、**必ず理由と日時を記録**する

## 10. チェックリスト（最小）
- [ ] Issueを作成した
- [ ] `feature/*` を `dev` から作成した
- [ ] PRに `Closes #<issue番号>` を入れた
- [ ] `feature/*` → `dev` をPRで取り込んだ
- [ ] 必要に応じて `dev` → `main` をPRした
- [ ] マージ後に作業ブランチを削除した

## 11. リポジトリ移管とローカル更新（最新）
作業場所が確定したため、参照先URLとremote更新手順を最新化する。以後このURLのみを正とする。

- 新しい作業場所: https://github.com/kondate-team/kondate-loop
- 移管後はローカルのremoteを更新する

```bash
git remote set-url origin git@github.com:kondate-team/kondate-loop.git
```

共同作業者にも、リポジトリ移管とremote更新を必ず共有する。
