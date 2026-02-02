# Infra

AWS / CloudFormation のインフラ資産向け README。

## 命名規則

## リソース別の“現実的な命名”例

### 1) S3バケット（ここだけ特別扱い推奨）

S3はグローバルでユニークが必要なので、候補Aに **uniq** を足すのが安全です。

**`{app}-{env}-{scope}-s3-{name}-{accountId}-{region}`**

例：

- `kondate-prod-web-s3-assets-123456789012-ap-northeast-1`

S3の命名制約（小文字・63文字など）に合わせて、全体を小文字に寄せるのが一番ラクです。 ([AWS ドキュメント](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html?utm_source=chatgpt.com))

---

### 2) CloudFront（実は“名前”を付けにくい）

CloudFront Distributionは “リソース名”というより **IDで管理**されがちです。

CloudFormationだと `Comment`（128文字以内）を説明的に入れるのが定石です。 ([AWS ドキュメント](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cloudfront-distribution-distributionconfig.html?utm_source=chatgpt.com))

- **Comment**：`kondate-prod-web-cf-assets`
- **Tag(Name)**：`kondate-prod-web-cf-assets`

    （CloudFrontはタグで見分ける運用が現実的）

---

### 3) API Gateway

- Rest API / HTTP API の “表示名” は比較的自由度があります（ただし変な記号を避けておけばOK）
- **Stage名**は制約があるので、ここは `dev/stg/prod` をそのまま採用が強いです

    （ステージ名は英数字・ハイフン・アンダースコアのみ、最大128文字） ([AWS ドキュメント](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html?utm_source=chatgpt.com))

おすすめ：

- API名：`kondate-prod-api`
- Stage名：`prod`（= envと一致）

---

### 4) Lambda（64文字制限を絶対に意識）

Lambda関数名は「関数名だけ指定する場合は **64文字**制限」があるので、ここが一番長さで詰みやすいです。 ([AWS ドキュメント](https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html))

またCloudFormationでも `FunctionName` を指定すると置き換え更新が絡むので、名前変更を前提にしない方が安全です。 ([AWS ドキュメント](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-function.html))

おすすめフォーマット（短め）：

**`{app}-{env}-api-fn-{action}`**

例：

- `kondate-prod-api-fn-get-menus`
- `kondate-prod-api-fn-put-menu`
- `kondate-prod-api-fn-list-recipes`

コツ：

- `get-menus` みたいに **動詞-名詞で短く**
- `lambda` という単語自体は不要（`fn`で十分）
- 将来増えるなら、`menu-` などドメインを先に付ける（候補C寄り）

---

### 5) DynamoDB（自由度高め、でも揃える）

DynamoDBのテーブル名は 3〜255文字で、英数字・アンダースコア・ハイフン・ドットが許容されます。 ([AWS ドキュメント](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html?utm_source=chatgpt.com))

とはいえ全体統一のために **小文字＋ハイフン**で揃えるのがおすすめ。

例：

- `kondate-prod-data-ddb-menus`
- `kondate-prod-data-ddb-users`
