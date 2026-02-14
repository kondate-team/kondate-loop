# Issue #011 1機能作成プラン（2026-02-14）

## 1. 目的
- バックエンドを「1機能ずつ」AWSへ反映し、段階的に本番利用可能な状態へ持っていく。

## 2. 現在の AWS 状況（2026-02-14 時点）
- 参照:
  - `docs/ISSUE010_IMPLEMENTATION_RECORD_2026-02-09.md`
  - `docs/DB_KEY_DESIGN_DRAFT.md`
  - GitHub Actions `Deploy` run `21931560862`（2026-02-12）
- 事実:
  - CloudFormation `kondate-loop-backend-stack` は更新成功。
  - Lambda アーティファクトは S3 にアップロードされ、`LambdaCodeS3Key` を指定してデプロイされている。
  - Lambda 直接 invoke で `POST /v1/recipes` 相当の書き込みが成功し、DynamoDB `MainTable` で `PK/SK` 検証まで通過。
  - ただし API Gateway 経由は `Missing Authentication Token (403)` が継続（`/dev/v1/recipes` など候補URLで再現）。

## 3. 優先順（1機能ずつ）
1. **API Gateway 経由の `/v1/recipes` 到達性修正（最優先）**
   - 理由: インターネット公開利用のボトルネックはここ。ここが通らないと他機能を積んでも外部利用できない。
2. **Recipe CRUD の API Gateway 経由E2E確立**
   - 理由: `Set` `Plan` `Shopping` `Fridge` の依存元。
3. **Set CRUD**
4. **Plan（current/next, select-set, items toggle）**
5. **Shopping（list/items/complete）**
6. **Fridge（list/items/deleted/restore）**
7. **Auth/Cognito（JWT前提への移行）**
   - 理由: 最終的な公開運用で必須。ただし現行の動作検証は到達性・CRUDの先行確立を優先。

## 4. Issue #011 の「1機能目」定義
- 機能名: **API Gateway 到達性修正**
- 対象:
  - API Gateway のリソース/ステージ/パスマッピング見直し
  - `BackendApiEndpoint` と実パス組み立ての整合
  - デプロイ後 smoke を「API Gateway 経由必須」で通す（Lambda direct fallback は切り分け用途に限定）
- 完了条件（DoD）:
  - `POST {BackendApiEndpoint}/recipes` もしくは正規 `/v1/recipes` が 201 で成功
  - `GET` でも同経路が 200
  - CI の backend-dev で API Gateway 経由 smoke が成功ログとして残る

## 5. ブランチ
- 作業ブランチ: `feature/011-1機能作成`
