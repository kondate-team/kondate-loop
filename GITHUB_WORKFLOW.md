# こんだてLoop GitHub運用ルール�E�EenHub前提�E�E

こ�Eドキュメント�E、こんだてLoop�E�Esystems/private/kondate-loop`�E��EGitHub運用めE
「軽量�E迷わなぁE��ことを優先して定義したも�Eです、E

## 目次
- [1. 目皁E��前提](#1-目皁E��前提)
- [2. ブランチ構�E](#2-ブランチ構�E)
- [3. Issue運用�E�EenHub�E�](#3-issue運用zenhub)
- [4. 作業開始�E手頁E��標準）](#4-作業開始�E手頁E��溁E
- [5. PR運用ルール](#5-pr運用ルール)
- [6. リリースフロー�E�Eev ↁEmain�E�](#6-リリースフローdev--main)
- [7. ブランチ�E牁E��け�E�忁E��）](#7-ブランチ�E牁E��け忁E��E
- [8. ローカル運用の琁E���E�よくある疑問）](#8-ローカル運用の琁E��よくある疑問)
- [9. 例外ルール�E�やむを得なぁE��き）](#9-例外ルールめE�Eを得なぁE��ぁE
- [10. チェチE��リスト（最小）](#10-チェチE��リスト最封E
- [11. リポジトリ移管とローカル更新�E�最新�E�](#11-リポジトリ移管とローカル更新最新)

## 1. 目皁E��前提
- 2人開発でも迷わなぁE��用を最優允E
- 余計な管琁E�E増やさなぁE��最小限�E�E
- ZenHubのボ�Eドを使ぁE
- Issueを起点に作業する

## 2. ブランチ構�E
- `main` : 本番�E�安定版�E�E
- `dev` : プレ本番 / 統合検証
- `feature/*` : 個別作業ブランチE��忁E�� `dev` から作�E�E�E
- `hotfix/*` : 本番緊急修正�E�Emain` から作�Eして `main` と `dev` に反映�E�E

## 3. Issue運用�E�EenHub�E�E
### ボ�Eド�E�E�最小！E
- `Backlog`�E�いつかやめE
- `Sprint`�E�今週めE��
- `In Progress`�E�着手中
- `Review`�E�PRレビュー中
- `Done`�E�`dev` にマ�Eジ渁E

### 最小ルール
- 作業は **忁E��Issueから開姁E*
- IssueはZenHubボ�Eド上で管琁E
- PRは忁E��Issueと紐付ける！ECloses #<issue番号>`�E�E

### パイプライン更新�E�忁E��！E
- PR作�E時にIssueめE`Review` に移勁E
- `dev` へマ�Eジ後にIssueめE`Done` に移勁E
- 自動化する場合�E `scripts/zenhub-move-issue.sh` を使用�E�EZENHUB_TOKEN` が忁E��E��E

## 4. 作業開始�E手頁E��標準！E
忁E�� **最新の `dev` を基溁E*に `feature/*` を�Eる、E

```bash
git fetch --prune
git switch dev
git pull
git switch -c feature/<issue番号>-<短ぁE��昁E
```

## 5. PR運用ルール
- `feature/*` ↁE`dev` は **忁E��PR** で取り込む
- `dev` ↁE`main` めE**忁E��PR** で取り込む
- `dev` / `main` に **直接pushしなぁE*
- PR本斁E�� `Closes #<issue番号>` を�Eれる

## 6. リリースフロー�E�Eev ↁEmain�E�E
- `feature/*` のPRめE**褁E�� `dev` に取り込んでOK**
- まとまったら **`dev` ↁE`main` をPR**
- `main` にタグを付ける（侁E `v0.1.0`�E�E

## 7. ブランチ�E牁E��け�E�忁E��！E
- **PRマ�Eジ後�E作業ブランチを削除する**
- ローカル・リモート両方を削除する

侁E
```bash
git branch -D feature/xxx
git push origin --delete feature/xxx
```

## 8. ローカル運用の琁E���E�よくある疑問！E
- ローカルにめE`main` / `dev` は存在する
- これら�E **「最新を確認するため�E写し、E*
- 作業は **忁E�� `feature/*`** で行う
- ローカル `main` / `dev` は放置すると古くなる�Eで、忁E��時に `pull` で更新する

## 9. 例外ルール�E�やむを得なぁE��き！E
- 原則はPR運用だが、E*緊急時�Eみ例外で直接pushを許可**
- 例外を使った場合�E、E*忁E��琁E��と日時を記録**する

## 10. チェチE��リスト（最小！E
- [ ] Issueを作�Eした
- [ ] `feature/*` めE`dev` から作�Eした
- [ ] PRに `Closes #<issue番号>` を�Eれた
- [ ] `feature/*` ↁE`dev` をPRで取り込んだ
- [ ] 忁E��に応じて `dev` ↁE`main` をPRした
- [ ] マ�Eジ後に作業ブランチを削除した

## 11. リポジトリ移管とローカル更新�E�最新�E�E
作業場所が確定したため、参照允ERLとremote更新手頁E��最新化する。以後このURLのみを正とする、E

- 新しい作業場所: https://github.com/kondate-team/kondate-loop
- 移管後�Eローカルのremoteを更新する

```bash
git remote set-url origin git@github.com:kondate-team/kondate-loop.git
```

共同作業老E��も、リポジトリ移管とremote更新を忁E��共有する、E

## Deploy templates (CloudFormation)

- Dev templates: infra/aws-resources/kondate-loop-iam-github-oidc-stack.yaml, infra/aws-resources/kondate-loop-iam-LambdaExecutionRole-stack.yaml, infra/aws-resources/kondate-loop-iam-stack.yaml, infra/aws-resources/kondate-loop-backend-stack.yaml, infra/aws-resources/kondate-loop-infra-stack.yaml.
- Prod templates: infra/aws-resources/PROD/PRODkondate-loop-backend-stack.yaml, infra/aws-resources/PROD/PRODkondate-loop-infra-stack.yaml.
- Default buckets (if vars unset): dev frontend kondate-loop-dev-s3-web-211669976488-ap-northeast-1, prod frontend kondate-prod-s3-web-211669976488-ap-northeast-1, artifacts kondate-loop-infra-s3-artifacts-211669976488-ap-northeast-1.
- Backend stack names: dev kondate-loop-backend-stack, prod PRODkondate-loop-backend-stack.
- kondate-loop-iam-stack.yaml (dev) requires DEVELOPER_PRINCIPAL_ARN (secret or var); if unset, the workflow skips that stack.




